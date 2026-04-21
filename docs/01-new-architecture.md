# New Architecture – BOA Mainframe Automation (Python / py3270)

> **Audience**: Client presentation – shows the full layer structure of the new Python/py3270 open-source framework that replaces the Jarvis / UFT / VBScript stack.

---

## Architecture Diagram

```mermaid
flowchart TD
    subgraph SUITE["\ud83e\uddea TEST SUITE  (pytest)"]
        TS["tests/test_ftd_mainframe.py\nTest Cases \u00b7 Assertions"]
    end

    subgraph DRIVER["\u2699\ufe0f DRIVER / RUNNER  (driver/runner.py)"]
        DR["Session Lifecycle\nsetup \u00b7 teardown \u00b7 before/after each"]
    end

    subgraph CONFIG["\ud83d\udd27 CONFIGURATION  (config/settings.py)"]
        CS["Host \u00b7 Port \u00b7 Timeouts\nEnvironment (SIT/UAT) \u00b7 env vars"]
    end

    subgraph DATA["\ud83d\udcca TEST DATA  (testdata/)"]
        TDM["test_data_manager.py\n(JSON reader)"]
        TDF["ftd_testdata.json\nFTD_Login \u00b7 AccountInquiry \u00b7 FundsTransfer"]
    end

    subgraph ACTION["\ud83d\udee0\ufe0f ACTION LAYER  (libraries/)"]
        TH["terminal_helper.py\nKeywords: login \u00b7 account_inquiry\nfunds_transfer \u00b7 sign_off\nwait_for_screen \u00b7 type_in_field \u00b7 send_key"]
        RH["report_helper.py\nlog_step \u00b7 capture_screen \u00b7 write_html_report"]
    end

    subgraph OR["\ud83d\udce6 OBJECT REPOSITORY  (objectrepository/screens.py)"]
        SCR["SCREENS dict (Python)\nLOGON_SCREEN \u00b7 MAIN_MENU\nACCOUNT_INQUIRY \u00b7 FUNDS_TRANSFER\nRow/Col field definitions"]
    end

    subgraph DRIVER2["\ud83d\udda5\ufe0f TN3270 LAYER  (py3270 + s3270)"]
        PY["py3270 Python library\nWraps s3270 subprocess\nDirect TN3270 TCP socket\u2014no HLLAPI"]
    end

    subgraph APP["\ud83d\udda5\ufe0f GBS APPLICATION  (IBM Mainframe)"]
        MF["TN3270 / 3270 Protocol\nTCP Socket HOST:PORT"]
    end

    subgraph REPORT["\ud83d\udccb E2E REPORT  (results/)"]
        RPT["HTML Report\nStep Logs \u00b7 Screen Captures \u00b7 Pass/Fail"]
    end

    subgraph CICD["\ud83d\udd01 CI/CD  (Jenkinsfile)"]
        JK["Jenkins Pipeline\nSIT \u00b7 UAT \u00b7 Suite Filter\nArtifact Archive \u00b7 Report Publish"]
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
| **Test Suite** | `tests/test_ftd_mainframe.py` | pytest test cases with `assert` statements — replaces Excel Test Suite |
| **Driver/Runner** | `driver/runner.py` | Central execution controller — manages py3270 session lifecycle |
| **Configuration** | `config/settings.py` | All environment-specific settings from env vars (host, port, timeouts) |
| **Test Data** | `testdata/ftd_testdata.json` | Test input and expected values (JSON, replaces Excel spreadsheets) |
| **Test Data Manager** | `testdata/test_data_manager.py` | `get(sheet, tc_id)` API for loading test rows |
| **Action Layer** | `libraries/terminal_helper.py` | Business keywords: `login`, `account_inquiry`, `funds_transfer`, etc. |
| **Report Helper** | `libraries/report_helper.py` | HTML report builder + console logging |
| **Object Repository** | `objectrepository/screens.py` | Plain Python dict — screen identifiers and field row/col definitions |
| **TN3270 Layer** | py3270 (3rd party) | Wraps `s3270` subprocess; opens direct TCP socket to mainframe |
| **Reporting** | `results/report.html` | Generated HTML report with step logs and screen captures |
| **CI/CD** | `Jenkinsfile` | Parameterised Jenkins pipeline (SIT/UAT, pytest filter, artifact archiving) |


---

## Architecture Diagram

```mermaid
flowchart TD
    subgraph SUITE["🧪 TEST SUITE  (Jasmine)"]
        TS["spec/ftdtest_jasmine_spec.js\nTest Cases · Assertions"]
    end

    subgraph DRIVER["⚙️ DRIVER / RUNNER  (driver/runner.js)"]
        DR["LeanFT SDK Init · Session Lifecycle\nbeforeAll · afterAll · beforeEach · afterEach"]
    end

    subgraph CONFIG["🔧 CONFIGURATION  (config/settings.js)"]
        CS["TE ShortName · Timeouts\nEnvironment (SIT/UAT)"]
    end

    subgraph DATA["📊 TEST DATA  (testdata/)"]
        TDM["testDataManager.js\n(Excel / JSON reader)"]
        TDF["ftd_testdata.json\nFTD_Login · AccountInquiry · FundsTransfer"]
    end

    subgraph ACTION["🛠️ ACTION LAYER  (libraries/)"]
        TH["terminalHelper.js\nKeywords: login · accountInquiry\nfundsTransfer · signOff\nwaitForScreen · typeInField · sendKey"]
        RH["reportHelper.js\nlogStep · logSnapshot · startTestCase"]
    end

    subgraph OR["📦 OBJECT REPOSITORY  (objectrepository/screens.js)"]
        SCR["LOGON_SCREEN · MAIN_MENU\nACCOUNT_INQUIRY · FUNDS_TRANSFER\nField definitions · Key mappings"]
    end

    subgraph APP["🖥️ GBS APPLICATION  (IBM Mainframe)"]
        MF["TN3270 / 3270 Protocol\nTerminal Emulator Session"]
    end

    subgraph REPORT["📋 E2E REPORT  (results/)"]
        RPT["LeanFT HTML Report\nScreenshots · Step Logs · Pass/Fail"]
    end

    subgraph CICD["🔁 CI/CD  (Jenkinsfile)"]
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
    TH --> APP
    RH --> REPORT
    CICD --> SUITE

    style SUITE   fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    style DRIVER  fill:#ede9fe,stroke:#7c3aed,color:#3b0764
    style CONFIG  fill:#fef3c7,stroke:#d97706,color:#78350f
    style DATA    fill:#dcfce7,stroke:#16a34a,color:#14532d
    style ACTION  fill:#fff7ed,stroke:#ea580c,color:#7c2d12
    style OR      fill:#e0f2fe,stroke:#0284c7,color:#0c4a6e
    style APP     fill:#fef9c3,stroke:#ca8a04,color:#713f12
    style REPORT  fill:#f0fdf4,stroke:#15803d,color:#14532d
    style CICD    fill:#fce7f3,stroke:#db2777,color:#831843
```

---

## Layer Descriptions

| Layer | File | Purpose |
|---|---|---|
| **Test Suite** | `spec/ftdtest_jasmine_spec.js` | Test cases with Jasmine `describe/it` — replaces Excel Test Suite |
| **Driver/Runner** | `driver/runner.js` | Central execution controller — manages LeanFT SDK and TE session lifecycle |
| **Configuration** | `config/settings.js` | All environment-specific settings externalized (shortName, timeouts, env tag) |
| **Test Data** | `testdata/` | JSON data store with Excel-compatible reader — replaces Spreadsheet Testdata |
| **Action Layer** | `libraries/terminalHelper.js` | Reusable keyword functions for 3270 mainframe — replaces `.qfl` VBScript libraries |
| **Report Helper** | `libraries/reportHelper.js` | Wraps LeanFT Report SDK for structured step-level logging |
| **Object Repository** | `objectrepository/screens.js` | Centralized screen and field definitions — no proprietary UFT format |
| **E2E Report** | `results/` | LeanFT HTML report with screenshots, step logs, and pass/fail status |
| **CI/CD** | `Jenkinsfile` | Jenkins pipeline with SIT/UAT environment params and report publishing |

---

## Execution Flow

```
Jenkins Pipeline (Jenkinsfile)
  └─► Jasmine Test Suite
        └─► Driver/Runner.setup()           ← Init LeanFT + open TN3270 session
              └─► terminalHelper.login()    ← Logon screen keyword
                    └─► waitForScreen()     ← Screen resolved from Object Repository
                    └─► typeInField()       ← Field position from Object Repository
                    └─► sendKey("Enter")
              └─► terminalHelper.accountInquiry() / fundsTransfer()
                    └─► Reads test data from testDataManager
                    └─► Executes steps via TE keywords
                    └─► Captures screenshot via reportHelper
              └─► expect(actual).toBe(expected)  ← Jasmine assertion
              └─► reportHelper.logStep()          ← Written to LeanFT HTML report
        └─► Driver/Runner.teardown()         ← Sign off + cleanup
```
