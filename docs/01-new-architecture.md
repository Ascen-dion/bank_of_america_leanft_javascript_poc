# New Architecture – BOA Mainframe Automation (LeanFT JavaScript)

> **Audience**: Client presentation – shows the full layer structure of the new LeanFT/JavaScript framework that replaces the Jarvis / UFT / VBScript stack.

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
        CS["TE Host · Port · Timeouts\nEnvironment (SIT/UAT) · Report Path"]
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
| **Configuration** | `config/settings.js` | All environment-specific settings externalized (host, port, timeouts, env tag) |
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
