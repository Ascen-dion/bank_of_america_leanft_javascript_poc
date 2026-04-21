# VBScript (UFT/Jarvis) → LeanFT JavaScript Migration Map
> **Agent Rule**: Use this file in PHASE 2 (Construct Mapping) and PHASE 4 (Keyword Translation).
> This is the canonical mapping table. Do NOT invent translations not listed here — flag as `MANUAL_REQUIRED` instead.

---

## 1. Language Construct Mapping

| VBScript / UFT | LeanFT JavaScript | Notes |
|---|---|---|
| `Sub TestCase_Name()` | `it("test case name", async function () { ... })` | Jasmine `it()` block |
| `Function KeywordName(args)` | `async function keywordName(args) { ... }` | In `terminalHelper.js` |
| `Call KeywordName(args)` | `await terminal.keywordName(args)` | Always `await` |
| `Dim varName` | `const varName` or `let varName` | `const` unless reassigned |
| `varName = value` | `const varName = value` | Use `const` for test data |
| `Set obj = ...` | `const obj = ...` | No `Set` keyword in JS |
| `If condition Then ... End If` | `if (condition) { ... }` | Standard JS |
| `If condition Then ... Else ... End If` | `if (condition) { ... } else { ... }` | Standard JS |
| `For i = 1 To n` | `for (let i = 1; i <= n; i++)` | Standard JS loop |
| `For Each item In collection` | `for (const item of collection)` | Modern JS |
| `Do While condition` | `while (condition) { ... }` | Standard JS |
| `Exit Sub` | `return` | Inside `it()` |
| `MsgBox "text"` | `reporter.logStep("text")` | Use reporter, not console |
| `Reporter.ReportEvent micPass, "step", "msg"` | `reporter.logPass("step – msg")` | LeanFT report |
| `Reporter.ReportEvent micFail, "step", "msg"` | `reporter.logFail("step – msg")` | LeanFT report |
| `Wait N` (seconds sleep) | ⛔ **MANUAL_REQUIRED** – replace with `await terminal.waitForScreen(win, "SCREEN_ID")` | Never use sleep |
| `Err.Raise` | `throw new Error("message")` | JS error throwing |
| `On Error Resume Next` | `try { ... } catch (e) { reporter.logFail(e.message); throw e; }` | Never silently swallow |

---

## 2. UFT Object Model → LeanFT TE SDK Mapping

| UFT / Jarvis | LeanFT JavaScript | Notes |
|---|---|---|
| `TeScreen("screenTitle")` | `await win.find(Screen())` | LeanFT finds the single current screen |
| `TeScreen("s").TeField("label")` | `await screen.find(Field({ attachedText: "LABEL" }))` | `attachedText` = exact label text |
| `TeField("label").Set "value"` | `await field.sendKeys("value")` | Type into field |
| `TeField("label").GetROProperty("value")` | `await field.getValue()` | Read field content |
| `TeScreen("s").SendKey HLLAPI_key` | `await screen.sendKey(Keys.Enter)` | Or `terminal.sendKey(win, "Enter")` |
| `TeField("label").Check CheckPoint(...)` | `expect(await terminal.getFieldValue(...)).toBe(expected)` | Assertion |
| `SwfWindow("app").SwfObject(...)` | ⛔ **NOT APPLICABLE** – 3270 TE has no SwfWindow | Flag as MANUAL_REQUIRED |
| `Browser("b").Page("p").WebEdit(...)` | ⛔ **NOT APPLICABLE** – 3270 TE is not a web app | Flag as MANUAL_REQUIRED |
| `Window("...").WinEdit(...)` | ⛔ **NOT APPLICABLE** – not a Windows GUI | Flag as MANUAL_REQUIRED |

---

## 3. Jarvis Keyword Library → terminalHelper.js Mapping

| Jarvis Keyword | terminalHelper.js Equivalent | Status |
|---|---|---|
| `Login userId, password` | `await terminal.login(win, userId, password)` | ✅ Direct map |
| `NavigateToMainMenu` | Implicit after `login()` — verify with `waitForScreen(win, "MAIN_MENU")` | ✅ Direct map |
| `SelectMenuOption optionCode` | `await terminal.typeInField(win, "MAIN_MENU", "option", optionCode)` + `sendKey(win, "Enter")` | ✅ Compose |
| `AccountInquiry accountNum` | `await terminal.accountInquiry(win, accountNum)` | ✅ Direct map |
| `FundsTransfer from, to, amt, ccy, ref` | `await terminal.fundsTransfer(win, from, to, amt, ccy, ref)` | ✅ Direct map |
| `SignOff` | `await terminal.signOff(win)` | ✅ Direct map |
| `WaitForScreen screenTitle` | `await terminal.waitForScreen(win, "SCREEN_ID")` | ✅ Direct map |
| `TypeInField screenId, fieldLabel, value` | `await terminal.typeInField(win, "SCREEN_ID", "fieldName", value)` | ✅ Direct map |
| `GetFieldValue screenId, fieldLabel` | `await terminal.getFieldValue(win, "SCREEN_ID", "fieldName")` | ✅ Direct map |
| `TakeScreenshot label` | `await reporter.logSnapshot(win, "label")` | ✅ Direct map |
| `LogStep stepName, detail` | `reporter.logStep("stepName", "detail")` | ✅ Direct map |
| `ReadExcelData sheet, row, col` | `td.get("DataKey")` — data is pre-loaded from JSON | ✅ Pattern shift |
| Any custom Jarvis keyword not in this list | ⛔ **MANUAL_REQUIRED** – document keyword name and intent | Manual |

---

## 4. Test Data Mapping

| Jarvis / VBScript pattern | LeanFT JavaScript equivalent |
|---|---|
| `GetDataFromExcel("Sheet1", rowNum, "ColumnName")` | `td.get("DataKey").fieldName` |
| `Datatable.Value("ColumnName", dtGlobalSheet)` | `td.get("DataKey").fieldName` |
| `Datatable.Import "path\to\file.xlsx"` | Pre-loaded — JSON already in `testdata/ftd_testdata.json` |
| `EnvironmentGetValue("varName")` | `process.env.VAR_NAME` or `settings.environment` |
| Hardcoded test value inline | ⛔ Move to `ftd_testdata.json` and reference via `td.get()` |

---

## 5. UFT Run Settings → Jasmine/settings.js Mapping

| UFT Setting | LeanFT JavaScript equivalent |
|---|---|
| `SystemUtil.Run "emulator.exe"` | ⛔ **MANUAL_REQUIRED** – emulator must be running before tests start |
| `UFT.QuickTest.RunResultsOptions.AutoExportReportConfig` | `settings.reporting.reportName` + LeanFT auto-report |
| `Application timeout` | `settings.terminal.screenTimeout` |
| `UFT timeout per step` | `settings.execution.defaultTimeout` (Jasmine `DEFAULT_TIMEOUT_INTERVAL`) |
| `UFT screenshot on error` | `settings.execution.screenshotOnFailure = true` |
| `RunAllTests` → `ExecutionEngine` | `beforeAll(async () => runner.setup())` |
| `CleanupAfterRun` | `afterAll(async () => runner.teardown())` |

---

## 6. Flag Codes (used in Migration Delta Report)

| Code | Meaning | Agent Action |
|---|---|---|
| `✅ AUTO` | Fully automated — direct or composite mapping available | Generate code |
| `⚠️ PARTIAL` | Partially automated — some steps generated, some require review | Generate with TODO comments |
| `🔴 LOCATOR_MANUAL_REQUIRED` | Screen/field not in `screens.js` — `attachedText` capture needed | Emit comment + stub |
| `🔴 TESTDATA_MANUAL_REQUIRED` | Test data key/field not in `ftd_testdata.json` | Emit comment |
| `🔴 KEYWORD_MANUAL_REQUIRED` | No equivalent in `terminalHelper.js` | Emit comment + describe intent |
| `⛔ NOT_APPLICABLE` | UFT object type doesn't exist in 3270 TE context (e.g. Browser, WinEdit) | Emit comment explaining why |
