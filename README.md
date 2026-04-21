# BOA Mainframe Automation POC
### LeanFT (OpenText Functional Testing for Developers) · JavaScript · Jasmine

> **POC Objective**: Demonstrate a modern, language-native automation framework for IBM Mainframe (TN3270) applications as a modernization path away from the Jarvis / UFT / VBScript stack.

---

## Project Documents

| # | Document | Description |
|---|---|---|
| 1 | [docs/01-new-architecture.md](docs/01-new-architecture.md) | Full architecture diagram of the new LeanFT/JavaScript framework with layer descriptions and execution flow |
| 2 | [docs/02-jarvis-vs-leanft-comparison.md](docs/02-jarvis-vs-leanft-comparison.md) | Side-by-side component mapping: Jarvis (UFT/VBScript) vs new framework, technology differences, what is retained |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     TEST SUITE (Jasmine)                    │
│              spec/ftdtest_jasmine_spec.js                   │
└──────────────────────────┬──────────────────────────────────┘
                           │ uses
┌──────────────────────────▼──────────────────────────────────┐
│              DRIVER / RUNNER  (driver/runner.js)            │
│  • LeanFT SDK init / cleanup                                │
│  • TE session open / close                                  │
│  • beforeAll / afterAll lifecycle hooks                     │
└──────┬──────────────────────────────────────────────────────┘
       │ calls keywords from
┌──────▼──────────────────────────────────────────────────────┐
│          ACTION LAYER  (libraries/terminalHelper.js)        │
│  • openSession / closeSession                               │
│  • waitForScreen  / sendKey                                 │
│  • typeInField / readField / clearAndType                   │
│  • Business keywords: login, accountInquiry, fundsTransfer  │
└──────┬──────────────────┬──────────────────────────────────┘
       │ reads from        │ logs via
┌──────▼──────────┐ ┌──────▼──────────────────────────────────┐
│  OBJECT REPO    │ │  REPORT HELPER  (libraries/reportHelper) │
│  screens.js     │ │  LeanFT HTML Report + console logging    │
└──────┬──────────┘ └─────────────────────────────────────────┘
       │
┌──────▼──────────────────────────────────────────────────────┐
│            TEST DATA  (testdata/ftd_testdata.json)          │
│  Sheet-style JSON → replace with xlsx reader for Excel      │
└──────┬──────────────────────────────────────────────────────┘
       │
┌──────▼──────────────────────────────────────────────────────┐
│       CONFIGURATION  (config/settings.js)                   │
│  TE host · port · timeouts · report path · environment      │
└─────────────────────────────────────────────────────────────┘
```

### Execution Flow

```
Jasmine Test Suite
  └─► Driver/Runner.setup()         ← Init LeanFT + open TE session
        └─► terminalHelper.login()  ← Logon screen keyword
              └─► waitForScreen()   ← Resolves from Object Repo
              └─► typeInField()     ← Field from Object Repo
              └─► sendKey()         ← Enter / PFn keys
        └─► terminalHelper.accountInquiry() / fundsTransfer()
        └─► expect(actual).toBe(expected)
        └─► reporter.logStep()      ← Captured in LeanFT HTML report
  └─► Driver/Runner.teardown()      ← Sign off + cleanup
```

---

## Repository Structure

```
BOA_Javascript_jasmine/
├── config/
│   └── settings.js              ← External configuration (env, host, timeouts)
├── driver/
│   └── runner.js                ← Central execution controller (SDK lifecycle)
├── libraries/
│   ├── terminalHelper.js        ← Reusable TE keyword library (replaces .qfl)
│   └── reportHelper.js          ← LeanFT report wrapper
├── objectrepository/
│   └── screens.js               ← All mainframe screen & field definitions
├── testdata/
│   ├── testDataManager.js       ← Data access layer (Excel/JSON reader)
│   └── ftd_testdata.json        ← Test input data (Login, AccountInquiry, Transfer)
├── results/                     ← LeanFT HTML reports and screenshots (generated)
├── spec/
│   ├── support/
│   │   └── jasmine.mjs          ← Jasmine configuration
│   └── ftdtest_jasmine_spec.js  ← Test suite with TC001–TC005
├── Jenkinsfile                  ← CI/CD pipeline (SIT / UAT environments)
├── package.json
└── README.md
```

---

## Jarvis → LeanFT/JS Component Mapping

| Jarvis Component          | This Framework                         |
|---------------------------|----------------------------------------|
| Test Suite (Excel)        | `spec/ftdtest_jasmine_spec.js` (Jasmine)|
| Test Flow (XML)           | Jasmine `describe/it` structure        |
| Test Data (Excel)         | `testdata/ftd_testdata.json` + xlsx    |
| Driver/Runner             | `driver/runner.js`                     |
| Action Layer (.qfl)       | `libraries/terminalHelper.js`          |
| Object Repository         | `objectrepository/screens.js`          |
| Configuration Settings    | `config/settings.js`                   |
| E2E Report                | LeanFT HTML Report (`results/`)        |
| Jenkinsfile               | `Jenkinsfile`                          |

---

## Prerequisites

| Requirement              | Version         |
|--------------------------|-----------------|
| Node.js                  | 18+             |
| OpenText LeanFT Agent    | 2026.1          |
| LeanFT SDK (JS)          | 2026.1.0        |
| Jasmine                  | 6.x             |
| IBM Mainframe TN3270 access | TN3270 port  |

---

## Setup & Running Tests

### 1. Install dependencies
```bash
npm install
```

### 2. Configure the mainframe host

Edit `config/settings.js` **or** set environment variables:

```bash
# Windows
set TE_HOST=mainframe.bankofamerica.internal
set TE_PORT=23
set TEST_ENV=SIT
```

### 3. Start the LeanFT Agent
Ensure the **OpenText Functional Testing for Developers** agent is running on your machine (system tray icon).

### 4. Run the full suite
```bash
npm test
```

### 5. Run for a specific environment
```bash
npm run test:sit
npm run test:uat
```

### 6. Run a single test case (by filter)
```bash
npx jasmine --filter="TC001"
```

### 7. View the report
Open `results/index.html` in a browser after execution.

---

## CI/CD (Jenkins)

The `Jenkinsfile` provides:
- Parameterized `TEST_ENV` selection (SIT / UAT)
- Optional `SUITE_FILTER` for targeted execution
- Automatic HTML report publishing
- Build artifact archiving

To integrate, point a Jenkins Pipeline job at this repository.

---

## Key Design Decisions vs Jarvis

| Concern                  | Jarvis (Current)                 | This Framework                  |
|--------------------------|----------------------------------|---------------------------------|
| Language                 | VBScript (.qfl)                  | JavaScript (ES2020)             |
| Tool                     | UFT                              | LeanFT (OpenText FTD)           |
| Test runner              | UFT runner                       | Jasmine (npm)                   |
| Async model              | Synchronous VBScript             | async/await (Promise-based)     |
| Object Repository        | UFT OR (.tsr)                    | Plain JS object (`screens.js`)  |
| CI/CD                    | Limited (Litmus POC in progress) | Jenkins pipeline (Jenkinsfile)  |
| Source control           | TBD                              | Git (this repo)                 |
| Long-term VBScript risk  | High – VBScript deprecation      | None – standard JavaScript      |

---

## Next Steps (Pilot)

1. **Connect to actual mainframe** – update `config/settings.js` with real TE host/port
2. **Capture real screen identifiers** – use LeanFT Object Identification Center to update `objectrepository/screens.js` with actual screen text and field positions
3. **Expand test data** – add more rows to `testdata/ftd_testdata.json` or migrate to `.xlsx` using the `xlsx` npm package
4. **Run pilot scope** – agree on 3–5 regression scenarios to automate end-to-end
5. **Validate Citrix compatibility** – confirm LeanFT Agent accessibility within the Citrix environment
6. **Set up Jenkins pipeline** – connect to the organization's Jenkins instance using the supplied `Jenkinsfile`
