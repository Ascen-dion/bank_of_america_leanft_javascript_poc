# Framework Knowledge – LeanFT JavaScript + Jasmine
> **Agent Rule**: Read this file at PHASE 0 before any analysis or code generation action.

---

## 1. Framework Layer Map

```
spec/               → Test Suite layer     (Jasmine describe/it)
driver/runner.js    → Driver/Runner layer  (SDK lifecycle)
libraries/          → Action layer         (terminalHelper, reportHelper)
objectrepository/   → Object Repository   (screens.js — field locators)
testdata/           → Test Data layer      (JSON + testDataManager)
config/settings.js  → Configuration layer
results/            → Reports
```

Every generated spec file MUST follow this exact layer structure — import only from the layers above, never cross-reference layers out of order.

---

## 2. Jasmine Test Structure (canonical template)

```javascript
"use strict";

const expect   = require("leanft/expect");
const settings = require("../config/settings");
const runner   = require("../driver/runner");
const terminal = require("../libraries/terminalHelper");
const reporter = require("../libraries/reportHelper");
const td       = require("../testdata/testDataManager");
const screens  = require("../objectrepository/screens");

describe("<Suite Name>", function () {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = settings.execution.defaultTimeout;

    beforeAll(async function () { await runner.setup(); });
    beforeEach(async function () { await runner.beforeEachTest(); });
    afterEach(async function ()  { await runner.afterEachTest(); });
    afterAll(async function ()   { await runner.teardown(); });

    it("<test case name>", async function () {
        reporter.startTestCase("<test case name>");
        const win = runner.getWindow();
        // --- test steps ---
    });
});
```

**Rules**:
- All `it()` callbacks MUST be `async function ()` — never arrow functions
- All LeanFT calls MUST be `await`-ed
- `runner.getWindow()` returns the cached `WindowTO` — call it at the start of each `it()` block
- `describe` and `it` labels become the report test names — use clear business-language labels

---

## 3. terminalHelper.js API Reference

> File: `libraries/terminalHelper.js`

| Function | Signature | Description |
|---|---|---|
| `getTeWindow` | `async () → WindowTO` | Find the running TE emulator window by `settings.terminal.shortName` |
| `waitForScreen` | `async (win, screenName) → void` | Wait for screen identifiers to appear; throws on timeout |
| `typeInField` | `async (win, screenName, fieldName, value) → void` | Find field by `attachedText` and type value |
| `sendKey` | `async (win, key) → void` | Send HLLAPI key (e.g. `"Enter"`, `"PF3"`, `"Clear"`) |
| `getFieldValue` | `async (win, screenName, fieldName) → string` | Read current displayed value of a field |
| `login` | `async (win, userId, password) → void` | Composite: types credentials on LOGON_SCREEN and presses Enter |
| `accountInquiry` | `async (win, accountNumber) → void` | Composite: navigates to ACCOUNT_INQUIRY and submits account number |
| `fundsTransfer` | `async (win, fromAcc, toAcc, amount, currency, ref) → void` | Composite: fills FUNDS_TRANSFER screen and submits |
| `signOff` | `async (win) → void` | Composite: selects option 99 from MAIN_MENU and signs off |

**Usage pattern**:
```javascript
const win = runner.getWindow();
await terminal.waitForScreen(win, "LOGON_SCREEN");
await terminal.typeInField(win, "LOGON_SCREEN", "userId", data.userId);
await terminal.typeInField(win, "LOGON_SCREEN", "password", data.password);
await terminal.sendKey(win, "Enter");
await terminal.waitForScreen(win, "MAIN_MENU");
```

---

## 4. reportHelper.js API Reference

> File: `libraries/reportHelper.js`

| Function | Signature | Description |
|---|---|---|
| `startTestCase` | `(name) → void` | Opens a new named test case in the LeanFT report |
| `logStep` | `(stepName, detail?) → void` | Logs a named step with optional detail string |
| `logSnapshot` | `async (win, label?) → void` | Captures a screenshot and attaches to report |
| `logPass` | `(msg) → void` | Logs a green PASS entry |
| `logFail` | `(msg) → void` | Logs a red FAIL entry |

**Rules**:
- Call `reporter.startTestCase()` at the top of every `it()` block
- Call `reporter.logStep()` before each logical action group
- Call `reporter.logSnapshot()` after significant state changes (screen reached, data submitted) — except on LOGON_SCREEN

---

## 5. testDataManager.js API Reference

> File: `testdata/testDataManager.js`

| Function | Signature | Description |
|---|---|---|
| `get` | `(key) → Object` | Returns the data object for the given key from `ftd_testdata.json` |
| `getField` | `(key, field) → string` | Returns a single field value from the data object |

**Usage**:
```javascript
const loginData = td.get("FTD_Login");
const accountData = td.get("AccountInquiry");
```

---

## 6. objectrepository/screens.js Structure

```javascript
const screens = {
    SCREEN_ID: {
        screenId: "SCREEN_ID",
        identifiers: ["EXACT SCREEN HEADER TEXT"],   // used by waitForText
        fields: {
            fieldLogicalName: { attachedText: "EXACT LABEL ON SCREEN" }
        },
        keys: {
            submit: "Enter",
            pfBack: "PF3"
        }
    }
};
module.exports = screens;
```

- `screenId` key = uppercase with underscores (e.g. `LOGON_SCREEN`, `MAIN_MENU`)
- `identifiers[]` = exact text strings that uniquely identify the screen header
- `fields.{name}.attachedText` = exact protected label text adjacent to the input field (**MANUAL capture required**)
- `keys.submit` / `keys.pfBack` = logical key names mapped to HLLAPI strings

---

## 7. config/settings.js – Key Properties

```javascript
settings.terminal.shortName          // TE session name (env: TE_SHORT_NAME), default "A"
settings.terminal.screenTimeout      // waitForText timeout ms, default 15000
settings.execution.defaultTimeout    // Jasmine it() timeout ms, default 60000
settings.execution.screenshotOnFailure // boolean
settings.environment                 // "SIT" | "UAT" (env: TEST_ENV)
```

---

## 8. driver/runner.js API Reference

| Export | Description |
|---|---|
| `runner.setup()` | Init LeanFT SDK + locate TE window. Use in `beforeAll` |
| `runner.teardown()` | Cleanup SDK. Use in `afterAll` |
| `runner.beforeEachTest()` | Per-test setup (report context). Use in `beforeEach` |
| `runner.afterEachTest()` | Per-test cleanup (screenshot on fail). Use in `afterEach` |
| `runner.getWindow()` | Returns the cached `WindowTO` — call inside `it()` blocks |

---

## 9. Naming Conventions

| Artifact | Convention | Example |
|---|---|---|
| Spec file | `<feature>_jasmine_spec.js` | `ftdtest_jasmine_spec.js` |
| Screen ID | UPPER_SNAKE_CASE | `ACCOUNT_INQUIRY` |
| Field logical name | camelCase | `accountNumber` |
| Test data key | PascalCase | `FundsTransfer` |
| Jasmine `describe` label | Business language | `"FTD – BOA Mainframe Automation POC"` |
| Jasmine `it` label | Verb + object | `"should login and reach main menu"` |

---

## 10. Import Order (always respect this order)

```javascript
const expect   = require("leanft/expect");      // 1. assertion library
const settings = require("../config/settings"); // 2. config
const runner   = require("../driver/runner");   // 3. driver
const terminal = require("../libraries/terminalHelper"); // 4. action layer
const reporter = require("../libraries/reportHelper");   // 5. reporting
const td       = require("../testdata/testDataManager"); // 6. test data
const screens  = require("../objectrepository/screens"); // 7. object repo (optional in spec)
```
