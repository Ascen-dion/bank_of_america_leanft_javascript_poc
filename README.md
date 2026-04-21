# boa-leanft-java-poc
# New Architecture – BOA Mainframe Automation (LeanFT Java)

> **Audience**: Engineering & QA Teams – details the layer structure of the LeanFT/Java framework for IBM Mainframe (TN3270) automation.

---

## Architecture Diagram

```mermaid
flowchart TD
    subgraph SUITE["🧪 TEST SUITE  (TestNG)"]
        TS["tests/FtdMainframeTest.java\n@Test · Assertions"]
    end

    subgraph DRIVER["⚙️ EXECUTION ENGINE  (driver/BaseTest.java)"]
        DR["LeanFT SDK Init · Session Lifecycle\n@BeforeSuite · @AfterSuite · @BeforeMethod · @AfterMethod"]
    end

    subgraph CONFIG["🔧 CONFIGURATION  (config/Settings.java)"]
        CS["TE Host · Port · Timeouts\nEnvironment (SIT/UAT)"]
    end

    subgraph DATA["📊 TEST DATA  (data/TestDataProvider.java)"]
        TDM["@DataProvider\n(Excel / 2D Array data injection)"]
    end

    subgraph ACTION["🛠️ ACTION LAYER  (libraries/TerminalHelper.java)"]
        TH["Keywords: login · accountInquiry\nfundsTransfer · signOff\nwaitForScreen · typeInField"]
        RH["ReportHelper.java\nlogStep · attachSnapshot"]
    end

    subgraph OR["📦 OBJECT REPOSITORY  (objectrepository/Screens.java)"]
        SCR["LOGON_SCREEN · MAIN_MENU\nStrongly-typed MainframeScreenDescription\nStrongly-typed MainframeFieldDescription"]
    end

    subgraph APP["🖥️ GBS APPLICATION  (IBM Mainframe)"]
        MF["TN3270 / 3270 Protocol\nTerminal Emulator Session"]
    end

    subgraph REPORT["📋 E2E REPORT  (RunResults/)"]
        RPT["LeanFT HTML Report\nScreenshots · Step Logs · Pass/Fail"]
    end

    subgraph CICD["🔁 CI/CD  (Jenkinsfile)"]
        JK["Jenkins Pipeline (Maven)\nSIT · UAT · mvn clean test\nArtifact Archive · Report Publish"]
    end

    SUITE --> DRIVER
    DRIVER --> ACTION
    DATA --> SUITE
    CONFIG --> DRIVER
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
| **Test Suite** | `tests/FtdMainframeTest.java` | Test cases utilizing TestNG `@Test` annotations and assertions. |
| **Execution Engine** | `driver/BaseTest.java` | Central execution controller — manages LeanFT SDK and TE session lifecycle via TestNG annotations. |
| **Configuration** | `config/Settings.java` | All environment-specific settings externalized (host, port, timeouts, env tag). |
| **Test Data** | `data/TestDataProvider.java` | Supplies isolated test data to the Test Suite using TestNG `@DataProvider`. |
| **Action Layer** | `libraries/TerminalHelper.java` | Reusable Java keyword functions for 3270 mainframe interactions. |
| **Report Helper** | `libraries/ReportHelper.java` | Wraps LeanFT Report SDK for structured step-level logging and snapshots. |
| **Object Repository** | `objectrepository/Screens.java` | Centralized, strongly-typed screen and field definitions using LeanFT SDK classes. |
| **E2E Report** | `RunResults/` | Generated LeanFT HTML report with screenshots, step logs, and pass/fail status. |
| **CI/CD** | `Jenkinsfile` | Declarative Maven pipeline with SIT/UAT environment params and report publishing. |

---

## Execution Flow

```text
Jenkins Pipeline (Jenkinsfile -> `mvn clean test`)
  └─► TestNG Test Suite (testng.xml)
        └─► BaseTest.setupSuite()            ← Init LeanFT SDK
        └─► BaseTest.setupTest()             ← Open TN3270 session
              └─► TestDataProvider           ← Inject data into @Test method
              └─► TerminalHelper.login()     ← Logon screen keyword
                    └─► waitForScreen()      ← Screen resolved from Screens.java
                    └─► typeInField()        ← Field position from Screens.java
                    └─► screen.sendKeys()
              └─► TerminalHelper.fundsTransfer()
                    └─► Executes steps via TE keywords
                    └─► Captures screenshot via ReportHelper
              └─► Assert.assertTrue()        ← TestNG assertion
              └─► ReportHelper.logStep()     ← Written to LeanFT HTML report
        └─► BaseTest.teardownTest()          ← Close TE session
        └─► BaseTest.teardownSuite()         ← LeanFT SDK cleanup
```

---

## Local Development Setup

### Prerequisites
1. **Java JDK 11** or higher.
2. **Apache Maven** installed and added to your system PATH.
3. **OpenText UFT Developer (LeanFT) Runtime Engine** installed and running locally on port 5095.

### Execution
To run the framework locally, execute the following Maven command from the project root:
```bash
mvn clean test -Denv=SIT
```
The execution reports will be automatically generated in the `RunResults/` directory.
