# New Architecture - BOA Mainframe Automation (Python / py3270)

> **Audience**: Client presentation - shows the full layer structure of the new Python/py3270 open-source framework that replaces the Jarvis / UFT / VBScript stack.

---

## Architecture Diagram

```mermaid
flowchart TD
    subgraph SUITE["TEST SUITE  (pytest)"]
        TS["tests/test_ftd_mainframe.py\nTest Cases · Assertions"]
    end

    subgraph DRIVER["DRIVER / RUNNER  (driver/runner.py)"]
        DR["Session Lifecycle\nsetup · teardown · before/after each"]
    end

    subgraph CONFIG["CONFIGURATION  (config/settings.py)"]
        CS["Host · Port · Timeouts\nEnvironment (SIT/UAT) · env vars"]
    end

    subgraph DATA["TEST DATA  (testdata/)"]
        TDM["test_data_manager.py\n(JSON reader)"]
        TDF["ftd_testdata.json\nFTD_Login · AccountInquiry · FundsTransfer"]
    end

    subgraph ACTION["ACTION LAYER  (libraries/)"]
        TH["terminal_helper.py\nKeywords: login · account_inquiry\nfunds_transfer · sign_off\nwait_for_screen · type_in_field · send_key"]
        RH["report_helper.py\nlog_step · capture_screen · write_html_report"]
    end

    subgraph OR["OBJECT REPOSITORY  (objectrepository/screens.py)"]
        SCR["SCREENS dict (Python)\nLOGON_SCREEN · MAIN_MENU\nACCOUNT_INQUIRY · FUNDS_TRANSFER\nRow/Col field definitions"]
    end

    subgraph DRIVER2["TN3270 LAYER  (py3270 + s3270)"]
        PY["py3270 Python library\nWraps s3270 subprocess\nDirect TN3270 TCP socket - no HLLAPI"]
    end

    subgraph APP["GBS APPLICATION  (IBM Mainframe)"]
        MF["TN3270 / 3270 Protocol\nTCP Socket HOST:PORT"]
    end

    subgraph REPORT["E2E REPORT  (results/)"]
        RPT["HTML Report\nStep Logs · Screen Captures · Pass/Fail"]
    end

    subgraph CICD["CI/CD  (Jenkinsfile)"]
        JK["Jenkins Pipeline\nSIT · UAT · Suite Filter\nArtifact Archive · Report Publish"]
    end

    SUITE --> DRIVER
    DRIVER --> ACTION
    DRIVER --> DATA
    CONFIG --> DRIVER
    DATA --> TDM --> TDF
    ACTION --> TH
    ACTION --> RH
    TH --> OR
    TH --> DRIVER2
    DRIVER2 --> APP
    RH --> REPORT
    CICD --> SUITE

    style SUITE    fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    style DRIVER   fill:#ede9fe,stroke:#7c3aed,color:#3b0764
    style CONFIG   fill:#fef3c7,stroke:#d97706,color:#78350f
    style DATA     fill:#dcfce7,stroke:#16a34a,color:#14532d
    style ACTION   fill:#fff7ed,stroke:#ea580c,color:#7c2d12
    style OR       fill:#e0f2fe,stroke:#0284c7,color:#0c4a6e
    style DRIVER2  fill:#f5f3ff,stroke:#6d28d9,color:#2e1065
    style APP      fill:#fef9c3,stroke:#ca8a04,color:#713f12
    style REPORT   fill:#f0fdf4,stroke:#15803d,color:#14532d
    style CICD     fill:#fce7f3,stroke:#db2777,color:#831843
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