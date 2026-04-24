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

---

## BOA Pilot Execution Guide — Step-by-Step

> **Purpose:** This guide is the exact runbook to follow when starting the live pilot inside Bank of America's environment. Follow every phase in sequence. Do not skip Phase 1 or Phase 2 — everything that comes after depends on them.

---

### Phase 1 — Environment Setup (Day 1, ~4 hours)

This phase gets the framework installed and talking to LeanFT before any mainframe connection is attempted.

#### Step 1.1 — Install Node.js on the BOA test workstation

```
Minimum version: Node.js 18 LTS
Download: https://nodejs.org (or use BOA's internal software catalog)
Verify: node --version   →  should print v18.x.x or higher
        npm --version    →  should print 9.x.x or higher
```

> If the workstation is air-gapped (no internet), the LeanFT `.tgz` SDK files already ship locally at:
> `C:\Program Files (x86)\OpenText\Functional Testing for Developers\SDK\JavaScript\`
> The `package.json` in this repo references them as `file:` paths — no internet required for SDK packages.

#### Step 1.2 — Clone / copy this repository onto the workstation

```bash
# If Git is available:
git clone https://github.com/Ascen-dion/bank_of_america_leanft_javascript_poc.git

# If no Git access, copy the project folder directly. Ensure this structure is present:
#   config/settings.js
#   driver/runner.js
#   libraries/terminalHelper.js
#   objectrepository/screens.js
#   testdata/ftd_testdata.json
#   spec/ftdtest_jasmine_spec.js
#   package.json
```

#### Step 1.3 — Install dependencies

```bash
cd BOA_Javascript_jasmine
npm install
```

Expected output: `added N packages` with no `ERR!` lines. The `node_modules/` folder will be created.

> **Proxy note:** If BOA has a corporate npm proxy, set it first:
> ```bash
> npm config set proxy http://proxy.bankofamerica.com:PORT
> npm config set https-proxy http://proxy.bankofamerica.com:PORT
> ```

#### Step 1.4 — Verify LeanFT Agent is installed and running

1. Open the Start Menu → search **"OpenText Functional Testing for Developers"**
2. Look for the LeanFT Agent icon in the Windows system tray (bottom-right)
3. Right-click the icon → **Settings** → confirm the port is `54345` (matches `config/settings.js`)
4. If not installed: run `C:\Program Files (x86)\OpenText\Functional Testing for Developers\Agent\LFTAgent.exe`

---

### Phase 2 — Terminal Emulator Configuration (Day 1, ~2 hours)

LeanFT does **not** open the mainframe connection. It controls an already-running emulator via HLLAPI. This phase configures that emulator.

#### Step 2.1 — Confirm the emulator is HLLAPI-capable

| Emulator | HLLAPI support | Notes |
|---|---|---|
| IBM Personal Communications (PCOMM) | ✅ Native | Most common at large banks |
| Attachmate Reflection | ✅ Native | |
| Micro Focus Rumba | ✅ Native | |
| IBM Host On-Demand | ⚠️ Limited | Browser-based, may not support HLLAPI |
| mochaTN3270 | ❌ No | Open-source only, no HLLAPI |

> **If BOA already runs UFT for mainframe automation, they already have a HLLAPI-capable emulator** — use the same one.

#### Step 2.2 — Open the terminal emulator and connect to the SIT mainframe

1. Launch your emulator (e.g. IBM PCOMM)
2. Open a new 3270 session
3. Enter the **SIT mainframe hostname and TN3270 port** (get from BOA infra team)
4. Connect — you should see the LOGON screen

#### Step 2.3 — Note the session short name

In IBM PCOMM:
- Go to **Edit → Preferences → API** (or **File → Properties**)
- Look for "Short session ID" or "Session name" — this is typically a single letter: `A`, `B`, etc.

Then set it in the framework:

```bash
# Windows — set before running tests
set TE_SHORT_NAME=A        # replace A with your actual session letter
set TEST_ENV=SIT
```

Or edit `config/settings.js` directly:
```js
terminal: {
    shortName: "A",    // ← update this to your session letter
}
```

#### Step 2.4 — Smoke test the HLLAPI connection

Open IBM PCOMM → **Actions → Start or Stop API** → ensure HLLAPI API is **started** (not just the emulator, but the HLLAPI service).

---

### Phase 3 — Screen Locator Calibration (Day 2–3, most important step)

> ⚠️ **This is the single most critical phase.** The `attachedText` values in `objectrepository/screens.js` are placeholders. If they do not match the real screen exactly, every test will fail with a "field not found" error. Do not skip this phase.

#### Step 3.1 — Open the LeanFT Object Identification Center (OIC)

1. Start the LeanFT Agent (system tray)
2. Open Visual Studio Code or any editor
3. Launch the OIC: **Start Menu → OpenText FTD → Object Identification Center**
   - Or from VS Code: open a `.js` file → press the LeanFT toolbar icon
4. The OIC will show a crosshair/spy tool

#### Step 3.2 — Capture identifiers for LOGON_SCREEN

With the mainframe LOGON screen visible in the emulator:

1. In OIC, click **Identify Object** / point the spy at the emulator window
2. Click on the **USER ID** input field
3. OIC will show its properties — look for `attachedText` (the label text immediately left of the field)
4. Copy the **exact** value (e.g. it might be `"USER ID  :"` or `"USERID"` — spacing matters)
5. Repeat for the **PASSWORD** field
6. Also note the **screen title text** that uniquely identifies this screen (e.g. `"BOA LOGON"` or `"BANK OF AMERICA MAINFRAME"`)

Update `objectrepository/screens.js`:
```js
LOGON_SCREEN: {
    identifiers: ["<exact header text seen on screen>"],
    fields: {
        userId:   { attachedText: "<exact label text from OIC>" },
        password: { attachedText: "<exact label text from OIC>" }
    }
}
```

#### Step 3.3 — Repeat for all screens in the pilot scope

| Screen | Key fields to capture |
|---|---|
| `LOGON_SCREEN` | `USER ID`, `PASSWORD` |
| `MAIN_MENU` | `OPTION` (the input field for entering a menu selection) |
| `ACCOUNT_INQUIRY` | `ACCOUNT NUMBER`, `ACCOUNT TYPE`, `BALANCE`, `STATUS`, `ACCOUNT HOLDER` |
| `FUNDS_TRANSFER_INPUT` | `FROM ACCOUNT`, `TO ACCOUNT`, `AMOUNT`, `CURRENCY` |
| `CONFIRMATION` | No input fields — just capture the screen identifier text |

> **Tip:** Screenshot every screen with its OIC panel open and save them. These become your "object repository evidence" documentation.

#### Step 3.4 — Update screens.js with all captured values

Edit `objectrepository/screens.js`. Each screen entry looks like this — replace **only** the `identifiers` strings and `attachedText` values:

```js
ACCOUNT_INQUIRY: {
    screenId: "ACCOUNT_INQUIRY",
    identifiers: ["<text that always appears on this screen>"],
    fields: {
        accountNumber: { attachedText: "<exact OIC value>" },
        balance:       { attachedText: "<exact OIC value>" },
        status:        { attachedText: "<exact OIC value>" }
    }
}
```

---

### Phase 4 — Test Data Setup (Day 3, ~2 hours)

#### Step 4.1 — Replace placeholder credentials

Edit `testdata/ftd_testdata.json`. Replace all dummy values with real SIT credentials and account numbers provided by BOA's test team:

```json
"FTD_Login": [
    {
        "testCaseId": "TC001",
        "description": "Valid login to mainframe FTD application",
        "userId": "<real SIT user ID>",
        "password": "<real SIT password>",
        "expectedScreen": "<exact text that appears on Main Menu after login>"
    }
]
```

> **Security note:** Never commit real credentials to Git. Use environment variables for passwords:
> ```bash
> set BOA_PASSWORD=your_password
> ```
> Then reference in `testDataManager.js`:
> ```js
> data.password = process.env.BOA_PASSWORD || data.password;
> ```

#### Step 4.2 — Provide valid test account numbers

Replace the placeholder account numbers in `FTD_AccountInquiry` and `FTD_FundsTransfer` with real SIT test accounts that BOA's test environment team can provide.

---

### Phase 5 — First Run: Login Smoke Test (Day 3, ~1 hour)

Run only TC001 first — this is the simplest test and confirms every layer of the stack is working before running the full suite.

#### Step 5.1 — Verify pre-conditions

Before running, confirm all of the following:

- [ ] Node.js 18+ installed
- [ ] `npm install` completed without errors
- [ ] IBM PCOMM (or other emulator) is open and connected to SIT mainframe
- [ ] LOGON screen is visible in the emulator
- [ ] LeanFT Agent is running in system tray
- [ ] `TE_SHORT_NAME` is set to the correct session letter
- [ ] `screens.js` updated with real `identifiers` and `attachedText` for `LOGON_SCREEN` and `MAIN_MENU`
- [ ] `ftd_testdata.json` updated with real SIT user ID and password

#### Step 5.2 — Run TC001 only

```bash
# Run only the login test case
npx jasmine --filter="TC001"
```

#### Step 5.3 — Interpret the result

| Result | What it means |
|---|---|
| ✅ PASS — "Main Menu displayed after login" | All layers working. Proceed to Phase 6 |
| ❌ `No TE window found` | LeanFT Agent not running, or `TE_SHORT_NAME` is wrong |
| ❌ `Screen LOGON_SCREEN did not appear` | `identifiers` in `screens.js` do not match real screen text |
| ❌ `Field userId not found` | `attachedText` for `userId` in `screens.js` does not match OIC value |
| ❌ `Cannot connect to LeanFT agent` | Port mismatch — check `config/settings.js` agent port vs Agent settings |
| ❌ Any other error | Check `results/` folder for the LeanFT HTML report with step-level detail |

---

### Phase 6 — Initial Priority Test Cases (Day 4–5)

Once TC001 passes, run the remaining initial test cases in this order. These cover the most critical mainframe flows and represent the pilot scope agreed with BOA.

| Priority | Test Case | Screen flow | Jasmine filter |
|---|---|---|---|
| 1 | TC001 — Valid Login | LOGON → MAIN_MENU | `--filter="TC001"` |
| 2 | TC002 — Invalid Login | LOGON → error message | `--filter="TC002"` |
| 3 | TC003 — Account Inquiry (CHK) | MAIN_MENU → ACCOUNT_INQUIRY → verify balance | `--filter="TC003"` |
| 4 | TC004 — Account Inquiry (SAV) | MAIN_MENU → ACCOUNT_INQUIRY → verify balance | `--filter="TC004"` |
| 5 | TC005 — Funds Transfer | MAIN_MENU → FUNDS_TRANSFER → CONFIRMATION | `--filter="TC005"` |

Run each test case individually first, validate the result, fix any locator issues, then run the full suite:

```bash
# Run the complete pilot suite
npm run test:sit
```

---

### Phase 7 — CI/CD Integration (Day 5, ~2 hours)

Once all pilot test cases pass locally, integrate with BOA's Jenkins.

#### Step 7.1 — Configure Jenkins agent requirements

The Jenkins build agent (the machine that runs the tests) must have:
- Node.js 18+ installed
- LeanFT Agent running as a Windows service (not just tray app)
- IBM PCOMM installed and pre-configured with the SIT session
- The emulator session must auto-connect on startup (configure in PCOMM autostart settings)

#### Step 7.2 — Set Jenkins environment variables

In Jenkins → **Manage Jenkins → Credentials** (or the Pipeline job settings), set:
```
TE_SHORT_NAME   = A             (your emulator session letter)
TEST_ENV        = SIT           (or UAT)
BOA_PASSWORD    = <SIT password> (mark as Secret Text)
```

#### Step 7.3 — Create Jenkins Pipeline job

1. New Item → **Pipeline**
2. Pipeline definition: **Pipeline script from SCM**
3. SCM: Git → enter this repository URL
4. Script Path: `Jenkinsfile`
5. Save and click **Build Now**

The `Jenkinsfile` already handles:
- `npm install`
- `npm run test:sit` or `npm run test:uat` based on `TEST_ENV` parameter
- HTML report publishing to Jenkins build page
- Optional `SUITE_FILTER` for targeted runs

---

### Phase 8 — Expanding the Migration (Week 2+)

Once the pilot test cases are stable on CI, begin migrating the remaining Jarvis test cases using the migration agent.

#### Using the BOA Migration Agent (VS Code Copilot)

For each existing Jarvis VBScript test file:

1. Open VS Code in this repository
2. Open GitHub Copilot Chat
3. Select the **boa-migration-agent** agent
4. Paste the VBScript test file and use the prompt:

```
Migrate this VBScript Jarvis test file to LeanFT JavaScript:

[paste the VBScript content here]
```

5. The agent will produce:
   - A complete Jasmine spec file (`spec/`)
   - Any new keywords needed in `terminalHelper.js`
   - Any new screens needed in `screens.js`
   - A Migration Delta Report listing `✅ AUTO`, `⚠️ PARTIAL`, and `🔴 MANUAL` items

6. For each `🔴 LOCATOR_MANUAL` flag: use the OIC to capture the missing `attachedText` and add it to `screens.js`
7. For each `🔴 TESTDATA_MANUAL` flag: add the missing test data key to `ftd_testdata.json`
8. Run the new spec:

```bash
npx jasmine --filter="<new test case ID>"
```

---

### Quick Reference Checklist

Copy this as your daily pilot status tracker:

```
PHASE 1 — Environment Setup
  [ ] Node.js 18+ installed
  [ ] Repository cloned / copied to workstation
  [ ] npm install completed (no errors)
  [ ] LeanFT Agent running on port 54345

PHASE 2 — Terminal Emulator
  [ ] HLLAPI-capable emulator confirmed
  [ ] SIT mainframe session open and showing LOGON screen
  [ ] Session short name identified (letter: ___ )
  [ ] TE_SHORT_NAME set in environment or settings.js
  [ ] HLLAPI API started in emulator

PHASE 3 — Screen Locator Calibration
  [ ] OIC opened and working
  [ ] LOGON_SCREEN: identifiers captured
  [ ] LOGON_SCREEN: userId attachedText captured
  [ ] LOGON_SCREEN: password attachedText captured
  [ ] MAIN_MENU: identifiers captured
  [ ] MAIN_MENU: option attachedText captured
  [ ] ACCOUNT_INQUIRY: all fields captured
  [ ] FUNDS_TRANSFER_INPUT: all fields captured
  [ ] CONFIRMATION: identifier text captured
  [ ] screens.js updated with all real values

PHASE 4 — Test Data
  [ ] Real SIT user ID added to ftd_testdata.json
  [ ] Password handled via env var (not hard-coded)
  [ ] Real test account numbers added
  [ ] Expected screen text values verified

PHASE 5 — First Run
  [ ] TC001 passes locally
  [ ] LeanFT HTML report opens in results/

PHASE 6 — Pilot Test Cases
  [ ] TC001 PASS (Valid Login)
  [ ] TC002 PASS (Invalid Login)
  [ ] TC003 PASS (Account Inquiry CHK)
  [ ] TC004 PASS (Account Inquiry SAV)
  [ ] TC005 PASS (Funds Transfer)
  [ ] Full suite: npm run test:sit PASS

PHASE 7 — Jenkins CI
  [ ] Jenkins agent configured (Node + LeanFT Agent + emulator)
  [ ] Environment variables set in Jenkins credentials
  [ ] Pipeline job created pointing to Jenkinsfile
  [ ] First CI run GREEN

PHASE 8 — Migration
  [ ] First Jarvis VBScript file migrated via agent
  [ ] MANUAL flags resolved (OIC + test data)
  [ ] Migrated test passing on CI
  [ ] Migration velocity established (tests/sprint)
```
