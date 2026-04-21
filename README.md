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
│  • Find TE window by shortName (HLLAPI)                     │
│  • beforeAll / afterAll lifecycle hooks                     │
└──────┬──────────────────────────────────────────────────────┘
       │ calls keywords from
┌──────▼──────────────────────────────────────────────────────┐
│          ACTION LAYER  (libraries/terminalHelper.js)        │
│  • getTeWindow / waitForScreen / sendKey                    │
│  • typeInField / typeSecure / readField                     │
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
│  TE shortName · timeouts · environment (SIT/UAT)            │
└─────────────────────────────────────────────────────────────┘
```

### Execution Flow

```
Jasmine Test Suite
  └─► Driver/Runner.setup()         ← Init LeanFT + find TE window (HLLAPI)
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

## Why JavaScript? (LeanFT Language Choice Rationale)

LeanFT supports **Java, C#/.NET, and JavaScript**. This POC deliberately uses JavaScript. Here is the full rationale to share with the client.

### LeanFT Supported Languages – Comparison

| Factor | JavaScript (This POC) | Java | C# / .NET |
|---|---|---|---|
| **Setup time** | `npm install` – done in minutes | JDK + Maven/Gradle + IDE setup | .NET SDK + Visual Studio + NuGet |
| **Dependencies** | `package.json` – one file, auto-resolved | `pom.xml` / `build.gradle` – verbose | `.csproj` / `packages.config` – verbose |
| **Team ramp-up** | JavaScript is the most widely known language in QE teams today | Requires Java-trained engineers | Requires C#/.NET-trained engineers |
| **CI/CD integration** | `npm test` – single command, works on any CI runner out of the box | Requires Maven/Gradle wrapper on CI agent | Requires .NET SDK on CI agent |
| **VBScript migration path** | Closest cognitive model – scripting language → scripting language | Larger paradigm shift for testers | Larger paradigm shift for testers |
| **Async/non-blocking** | Native `async/await` – built into the language | Requires explicit threading or CompletableFuture | `async/await` available but heavier stack |
| **File format** | Plain `.js` files – readable, Git-diffable, no compile step | `.java` files – require compilation | `.cs` files – require compilation |
| **IDE requirement** | VS Code (free, lightweight) | IntelliJ IDEA / Eclipse | Visual Studio / Rider |
| **Ecosystem** | `npm` – 2M+ packages, xlsx, reporting, CI tools all available | Maven Central – strong but Java-only | NuGet – strong but .NET-only |
| **LeanFT SDK parity** | Full TE (HLLAPI), Web, Windows, Mobile – same capability as Java/.NET | Full SDK | Full SDK |

### Key Arguments for the Client

**1. Fastest POC-to-Pilot path**
No compilation, no IDE setup, no build tool configuration. A new team member runs `npm install` and executes tests within 10 minutes of cloning the repository.

**2. Closest migration from VBScript**
VBScript is a scripting language. JavaScript is a scripting language. The testers who currently maintain `.qfl` files can read and write JavaScript with minimal training — far less than learning Java or C#.

**3. No proprietary lock-in beyond LeanFT itself**
The entire framework (object repository, test data, keywords, config) is plain JavaScript files. Zero binary files. Every line is in Git, reviewable in a PR, and executable with Node.js — which is free and available on every OS.

**4. Same LeanFT capability as Java or .NET**
`leanft.sdk.te` (TN3270 HLLAPI), `leanft.sdk.web`, `leanft.sdk.stdwin` — all available in JavaScript. There is no LeanFT feature available in Java or C# that is not also available in JavaScript.

**5. Enterprise CI/CD readiness**
`npm test` is a single command. Every major CI platform (Jenkins, GitHub Actions, Azure DevOps, GitLab CI) has a Node.js runner available. No additional build infrastructure is needed.

**6. Future-proof**
Microsoft officially deprecated VBScript in Windows. JavaScript (ECMAScript) is a living standard maintained by the industry. Node.js LTS versions are supported for 3+ years. This stack will not face the same deprecation risk.

### When Java or C# Would Be Preferred

| Scenario | Recommended Language |
|---|---|
| Team is 100% Java-trained with existing Java framework | Java |
| Enterprise mandates .NET across all tooling | C# / .NET |
| Mainframe automation combined with heavy Java backend API testing | Java |
| Existing LeanFT Java framework being extended | Java |

**For this BOA engagement** — migrating from VBScript, targeting QE testers (not developers), requiring rapid setup — JavaScript is the optimal choice.

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

### 2. Configure the terminal emulator session

Edit `config/settings.js` **or** set environment variables:

```bash
# Windows
# TE_SHORT_NAME = session short name as configured in IBM PCOMM / Attachmate
# (typically a single letter e.g. "A" – check your emulator's session settings)
set TE_SHORT_NAME=A
set TEST_ENV=SIT
```

> **Note:** LeanFT controls your **already-running** terminal emulator via HLLAPI.
> Open your emulator, connect it to the mainframe, then run the tests.
> LeanFT does NOT open a TN3270 connection itself.

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

1. **Connect to actual mainframe** – open your terminal emulator, connect to the mainframe, set `TE_SHORT_NAME` in `config/settings.js` to your session name
2. **Capture real screen identifiers** – use LeanFT Object Identification Center (OIC) to spy on your live 3270 screens and update `objectrepository/screens.js` with exact `identifiers` (screen text) and `attachedText` values for each field
3. **Expand test data** – add more rows to `testdata/ftd_testdata.json` or migrate to `.xlsx` using the `xlsx` npm package
4. **Run pilot scope** – agree on 3–5 regression scenarios to automate end-to-end
5. **Validate Citrix compatibility** – confirm LeanFT Agent accessibility within the Citrix environment
6. **Set up Jenkins pipeline** – connect to the organization's Jenkins instance using the supplied `Jenkinsfile`
