# New Architecture - BOA Mainframe Automation (Python / py3270)

> **Audience**: Client presentation - shows the full layer structure of the new Python/py3270 open-source framework that replaces the Jarvis / UFT / VBScript stack.

---

## Architecture Diagram

```mermaid
flowchart LR
    CI["1. CI/CD PIPELINE<br/>Jenkins<br/><br/>• Trigger scheduled or on-demand runs<br/>• Set TEST_ENV, TE_HOST, TE_PORT, SUITE_FILTER<br/>• Archive reports and logs"]
    TE["2. TEST EXECUTION LAYER<br/>pytest<br/><br/>• tests/test_ftd_mainframe.py<br/>• Test classes and assertions<br/>• Keyword-driven business scenarios"]
    AE["3. AUTOMATION ENGINE<br/>conftest.py + driver/runner.py<br/><br/>• Session-scoped setup and teardown<br/>• Shared Emulator lifecycle<br/>• Per-test hooks and failure handling"]
    AL["4. ACTION LAYER<br/>libraries/terminal_helper.py<br/><br/>• login<br/>• select_menu_option<br/>• account_inquiry<br/>• funds_transfer<br/>• send_key / wait_for_screen"]
    TD["5. TEST DATA LAYER<br/>testdata/<br/><br/>• test_data_manager.py<br/>• ftd_testdata.json<br/>• Centralized test inputs and expected values"]
    OR["6. OBJECT REPOSITORY<br/>objectrepository/screens.py<br/><br/>• Screen identifiers<br/>• Row/column field mappings<br/>• Reusable 3270 UI abstraction"]
    TN["7. TN3270 CONNECTIVITY LAYER<br/>py3270 + s3270<br/><br/>• Headless emulator runtime<br/>• Subprocess-driven terminal control<br/>• Direct TN3270 socket communication"]
    APP["8. TARGET APPLICATION<br/>IBM Mainframe / GBS Application<br/><br/>• Logon, menu, inquiry, transfer flows<br/>• Real 3270 business transactions<br/>• Host reached through HOST:PORT"]
    RP["9. REPORTING & LOGGING<br/>libraries/report_helper.py + results/<br/><br/>• HTML report generation<br/>• Screen captures on failure<br/>• Step-level execution logs"]

    CFG["CONFIGURATION LAYER<br/>config/settings.py<br/><br/>• Environment selection<br/>• Host, port, timeouts<br/>• Screenshot and visibility switches"]
    COR["CENTRALIZED OBJECT + DATA REFERENCES<br/><br/>• Tests stay free of hard-coded coordinates<br/>• Shared screen model across all keywords<br/>• Shared data lookup across all scenarios"]
    EXT["EXTERNAL SYSTEM INTERACTION<br/><br/>• s3270 binary on PATH<br/>• TN3270 protocol over TCP<br/>• No proprietary LeanFT or HLLAPI dependency"]

    CI --> TE --> AE --> AL --> TD --> OR --> TN --> APP --> RP

    CFG -. configuration .-> TE
    CFG -. configuration .-> AE
    CFG -. configuration .-> AL
    TD -. data lookup .-> AL
    OR -. field mapping .-> AL
    COR -. reference model .-> TD
    COR -. reference model .-> OR
    TN <-. system interaction .-> EXT
    APP <-. live host session .-> EXT

    style CI fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    style TE fill:#ede9fe,stroke:#7c3aed,color:#3b0764
    style AE fill:#e0f2fe,stroke:#0284c7,color:#0c4a6e
    style AL fill:#ffedd5,stroke:#ea580c,color:#7c2d12
    style TD fill:#dcfce7,stroke:#16a34a,color:#14532d
    style OR fill:#cffafe,stroke:#0891b2,color:#164e63
    style TN fill:#fef3c7,stroke:#d97706,color:#78350f
    style APP fill:#fef9c3,stroke:#ca8a04,color:#713f12
    style RP fill:#dcfce7,stroke:#15803d,color:#14532d
    style CFG fill:#f8fafc,stroke:#64748b,color:#334155
    style COR fill:#eff6ff,stroke:#3b82f6,color:#1e3a8a
    style EXT fill:#f8fafc,stroke:#475569,color:#334155
```

---

## Layer Descriptions

| Layer | File | Purpose |
|---|---|---|
| **Test Suite** | `tests/test_ftd_mainframe.py` | pytest test cases with `assert` statements - replaces Excel Test Suite |
| **Driver/Runner** | `driver/runner.py` | Central execution controller - manages py3270 session lifecycle |
| **Configuration** | `config/settings.py` | All environment-specific settings from env vars (host, port, timeouts) |
| **Test Data** | `testdata/ftd_testdata.json` | Test input and expected values (JSON, replaces Excel spreadsheets) |
| **Test Data Manager** | `testdata/test_data_manager.py` | `get(sheet, tc_id)` API for loading test rows |
| **Action Layer** | `libraries/terminal_helper.py` | Business keywords: `login`, `account_inquiry`, `funds_transfer`, etc. |
| **Report Helper** | `libraries/report_helper.py` | HTML report builder + console logging |
| **Object Repository** | `objectrepository/screens.py` | Plain Python dict - screen identifiers and field row/col definitions |
| **TN3270 Layer** | py3270 (3rd party) | Wraps `s3270` subprocess; opens direct TCP socket to mainframe |
| **Reporting** | `results/report.html` | Generated HTML report with step logs and screen captures |
| **CI/CD** | `Jenkinsfile` | Parameterised Jenkins pipeline (SIT/UAT, pytest filter, artifact archiving) |

---

## Execution Flow

```
Jenkins Pipeline (Jenkinsfile)
  └─► pytest Test Suite (tests/test_ftd_mainframe.py)
        └─► conftest.py - session fixture
              └─► driver/runner.py - open_session()     ← py3270 launches s3270 subprocess
                    └─► s3270 opens TN3270 TCP socket → HOST:PORT (IBM Mainframe)
              └─► terminal_helper.login()
                    └─► wait_for_screen("LOGON_SCREEN") ← identifier from screens.py
                    └─► type_in_field(row, col, value)  ← field position from screens.py
                    └─► send_key("Enter")
              └─► terminal_helper.account_inquiry() / funds_transfer()
                    └─► Test data loaded via test_data_manager from ftd_testdata.json
                    └─► Executes TN3270 keywords
                    └─► capture_screen() → report_helper logs screenshot
              └─► assert actual == expected             ← pytest assertion
              └─► report_helper.log_step()              ← Written to results/report.html
        └─► conftest.py - session teardown
              └─► driver/runner.py - close_session()    ← s3270 subprocess terminated
              └─► report_helper.write_html_report()     ← results/report.html generated
```