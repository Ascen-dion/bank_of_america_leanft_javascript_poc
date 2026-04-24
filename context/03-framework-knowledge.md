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

---

## 11. Official SDK API Reference – TerminalEmulators Namespace (v26.1)

> Source: https://admhelp.microfocus.com/documents/uftdev/26.1/JavaScriptSDKReference/TerminalEmulators.html
> All methods return `Promise` – always `await` them.

### 11.1 `TerminalEmulators.WindowTO`

Represents a running terminal emulator window (HLLAPI session).

| Method | Signature | Returns | Notes |
|---|---|---|---|
| `activate` | `activate(button?)` | `Promise<void>` | Brings window to foreground; default = left mouse button |
| `emulatorStatus` | `emulatorStatus()` | `Promise<EmulatorStatus>` | Ready / NotReady / Disconnected |
| `handle` | `handle()` | `Promise<number>` | Win32 window handle |
| `protocol` | `protocol()` | `Promise<Protocol>` | e.g. `TN3270`, `TN5250` |
| `shortName` | `shortName()` | `Promise<string>` | HLLAPI session ID (e.g. `"A"`) |

**Descriptor properties used in `LFT.find(Window({...}))`:**
- `shortName` – HLLAPI session short name (most common locator)
- `protocol` – terminal protocol

---

### 11.2 `TerminalEmulators.ScreenTO`

Represents the current screen within a TE window.

| Method | Signature | Returns | Notes |
|---|---|---|---|
| `getText` | `getText(area?)` | `Promise<string>` | Full screen text or text in `{top, left, bottom, right}` area |
| `sendTEKeys` | `sendTEKeys(keys)` | `Promise<void>` | Send a key string or `Keys` enum value (e.g. `Keys.enter`) |
| `setCursorPosition` | `setCursorPosition(positionOrRow, column?)` | `Promise<void>` | Move cursor; pass `{row, column}` or two numbers |
| `setText` | `setText(text, positionOrRow?, column?)` | `Promise<void>` | Write text directly to a screen position |
| `sync` | `sync(milliseconds?)` | `Promise<void>` | Wait for host Ready status; use after every Enter/PF key |
| `waitForText` | `waitForText(text, milliseconds?)` | `Promise<boolean>` | `text` can be a `string` or `RegExp` |
| `waitForTextInArea` | `waitForTextInArea(text, area, milliseconds?)` | `Promise<boolean>` | Like `waitForText` but scoped to a row/col rectangle |
| `cursorPosition` | `cursorPosition()` | `Promise<{row, column}>` | Current cursor location |
| `id` | `id()` | `Promise<number>` | Screen ID |
| `inputFieldCount` | `inputFieldCount()` | `Promise<number>` | Number of unprotected (input) fields |
| `protectedFieldCount` | `protectedFieldCount()` | `Promise<number>` | Number of protected (label) fields |
| `label` | `label()` | `Promise<string>` | Screen label |
| `size` | `size()` | `Promise<{rows, columns}>` | Screen dimensions (typically 24×80 or 27×132) |

> **No `getSnapshot()` / `snapshot()` method exists on TerminalEmulators.ScreenTO.**
> Use `getText()` to capture screen state for logging.

**`waitForText` examples from official docs:**
```javascript
// Wait 10s using regex (ignores variable time portion)
await screen.waitForText(/.*LAST ACCESS AT \d\d:\d\d:\d\d ON .*DAY.*/, 10000);

// Wait 5s for exact string
await screen.waitForText("User", 5000);

// Wait for text in a bounded area (rows 6-6, cols 53-60)
await screen.waitForTextInArea("User", { top: 6, left: 53, bottom: 6, right: 60 }, 5000);
```

---

### 11.3 `TerminalEmulators.FieldTO`

Represents a single input or label field on the current screen.

| Method | Signature | Returns | Notes |
|---|---|---|---|
| `setText` | `setText(text, offset?)` | `Promise<void>` | Type into unprotected field; optional offset within field |
| `setSecure` | `setSecure(codedString)` | `Promise<void>` | For password / hidden fields |
| `setCursor` | `setCursor(offset?)` | `Promise<void>` | Move cursor to this field (optional character offset) |
| `text` | `text()` | `Promise<string>` | Read current field value |
| `attachedText` | `attachedText()` | `Promise<string>` | The label text next to the field (locator property) |
| `id` | `id()` | `Promise<number>` | Field ID |
| `length` | `length()` | `Promise<number>` | Maximum field length in characters |
| `isProtected` | `isProtected()` | `Promise<boolean>` | `true` = read-only label field |
| `isNumeric` | `isNumeric()` | `Promise<boolean>` | `true` = numeric-only field |
| `isVisible` | `isVisible()` | `Promise<boolean>` | Visibility flag |
| `color` | `color()` | `Promise<string>` | Text colour (replaces deprecated `getColor()`) |
| `backgroundColor` | `backgroundColor()` | `Promise<string>` | Background colour (replaces deprecated `getBackgroundColor()`) |
| `startPosition` | `startPosition()` | `Promise<{row, column}>` | Field's top-left screen coordinate |
| `waitUntilVisible` | `waitUntilVisible(timeout?)` | `Promise<boolean>` | Synchronise on field appearance; returns `false` on timeout |

**Descriptor properties used in `LFT.find(Field({...}))`:**
- `attachedText` – most reliable locator; equals the protected label adjacent to the input field
- `id` – zero-based field index (fragile if screen layout changes)

---

### 11.4 `LFT` Lifecycle (leanft module)

| Method | When to call |
|---|---|
| `LFT.init(settings)` | Once in `beforeAll` (via `runner.setup()`) |
| `LFT.cleanup()` | Once in `afterAll` (via `runner.teardown()`) |
| `LFT.beforeTest()` | In `beforeEach` (via `runner.beforeEachTest()`) |
| `LFT.afterTest()` | In `afterEach` (via `runner.afterEachTest()`) |

---

### 11.5 `StringUtils` (leanft.utils module)

Utility helpers for string assertions and manipulation:
- `StringUtils.isNullOrEmpty(str)` → `boolean`
- `StringUtils.isNullOrWhiteSpace(str)` → `boolean`
- `StringUtils.trim(str)` → `string`
- `StringUtils.trimLeft(str)` / `StringUtils.trimRight(str)` → `string`
- `StringUtils.joinFunc(separator, ...parts)` → `string`
- `StringUtils.splitFunc(str, separator)` → `string[]`

---

### 11.6 Keys Enum (HLLAPI key strings)

Used in `screen.sendTEKeys(key)`. Keys are referenced via `TE.DescriptionsAndEnums.Keys`:

| Logical Name | Key Constant |
|---|---|
| Enter | `Keys.enter` |
| Clear | `Keys.clear` |
| PF1–PF12 | `Keys.pf1` … `Keys.pf12` |
| PF13–PF24 | `Keys.pf13` … `Keys.pf24` |
| Tab | `Keys.tab` |
| BackTab | `Keys.backtab` |
| PA1–PA3 | `Keys.pa1` … `Keys.pa3` |
| Home | `Keys.home` |
| End | `Keys.end` |

You can also pass raw HLLAPI strings directly: `"@E"` (Enter), `"@C"` (Clear), `"@3"` (PF3).
