# Mainframe Application Knowledge
> **Agent Rule**: Read this file at PHASE 0 before any analysis or code generation action.

---

## 1. Protocol & Connectivity

| Concern | Detail |
|---|---|
| **Protocol** | TN3270 (IBM 3270 data stream over TCP) |
| **Session standard** | HLLAPI (High Level Language Application Programming Interface) — IBM standard for green-screen automation |
| **LeanFT role** | LeanFT does **NOT** open a TN3270 TCP socket. It controls an **already-running** terminal emulator via HLLAPI |
| **Required emulator** | IBM Personal Communications (PCOMM), Attachmate Reflection, Micro Focus Rumba, or any HLLAPI-capable emulator |
| **Session identifier** | Each emulator session has a single-letter shortName (e.g. `"A"`). Configured in `config/settings.js` via `TE_SHORT_NAME` env var |

---

## 2. Screen Interaction Model

### How LeanFT finds objects
1. **Window** — matched by `shortName` (the emulator session letter)
2. **Screen** — there is exactly ONE screen per TE window at any time
3. **Field** — matched by `attachedText` (the protected label immediately to the left of the input area on the 3270 screen)

### Key facts about 3270 fields
- Fields are **unprotected** (input) or **protected** (label/display). LeanFT only interacts with unprotected fields.
- `attachedText` is the exact text of the protected label character-adjacent to the field — it is the ONLY reliable locator on a 3270 screen.
- Field positions are **row/column** based (24 rows × 80 columns standard). LeanFT abstracts this via `attachedText` so row/column hardcoding is avoided.
- **Locator capture is a MANUAL step** — the tester must use the LeanFT Object Identification Center (OIC) with a live emulator connected to the mainframe to capture exact `attachedText` values. The agent MUST flag this explicitly.

### Waiting for screens
- Use `screen.waitForText(identifierString, timeout)` — checks that a known label/title string appears on screen before proceeding.
- Screen identifiers (`screens.js` `identifiers[]` array) should be reliable static header text that uniquely identifies the screen.

### Sending keys (HLLAPI key strings)
| Key | HLLAPI string | LeanFT constant |
|---|---|---|
| Enter | `@E` | `Keys.Enter` |
| Clear | `@C` | `Keys.Clear` |
| PF3 (Back) | `@3` | `Keys.PF3` |
| PF12 | `@l` | `Keys.PF12` |
| Tab | `@T` | `Keys.Tab` |
| PA1 | `@x` | `Keys.PA1` |

---

## 3. GBS Application – Known Screen Inventory

> ⚠️ `attachedText` values below are **placeholders from the POC**. The actual values MUST be verified against a live mainframe session using the LeanFT OIC. Flag any new screen as `LOCATOR_MANUAL_REQUIRED`.

| Screen ID | identifiers (waitForText targets) | Key Input Fields |
|---|---|---|
| `LOGON_SCREEN` | `"BANK OF AMERICA"`, `"LOGON"` | `USER ID`, `PASSWORD` |
| `MAIN_MENU` | `"MAIN MENU"`, `"SELECT OPTION"` | `OPTION` |
| `ACCOUNT_INQUIRY` | `"ACCOUNT INQUIRY"`, `"ENTER ACCOUNT NUMBER"` | `ACCOUNT NUMBER`, `ACCOUNT TYPE`, `BALANCE`, `STATUS`, `ACCOUNT HOLDER` |
| `FUNDS_TRANSFER` | `"FUNDS TRANSFER"`, `"TRANSFER DETAILS"` | `FROM ACCOUNT`, `TO ACCOUNT`, `AMOUNT`, `CURRENCY`, `REFERENCE` |
| `CONFIRMATION` | `"CONFIRMATION"`, `"TRANSACTION REFERENCE"` | `TRANSACTION REF` (read-only display) |

### Main Menu Option Codes
| Option | Code |
|---|---|
| Account Inquiry | `01` |
| Funds Transfer | `02` |
| Statement View | `03` |
| Sign Off | `99` |

---

## 4. Navigation Patterns

### Standard Flow
```
LOGON_SCREEN  →  [enter credentials + Enter]
MAIN_MENU     →  [enter menu option + Enter]
TARGET_SCREEN →  [perform action + PF3 to go back]
MAIN_MENU     →  [option 99 + Enter]
LOGON_SCREEN  →  [session signed off]
```

### Error Handling on Screen
- Error messages appear in a fixed row near the bottom of 3270 screens (typically row 24).
- Check for error text after each `sendKey(Enter)` by calling `waitForScreen` with the expected next screen; a timeout indicates a navigation failure.

---

## 5. HLLAPI Automation Constraints

- **No dynamic locators** — there are no XPath/CSS selectors on 3270. Every field must be identified by `attachedText`.
- **Timing sensitivity** — mainframe host response time varies. Always use `waitForScreen` / `waitForText` before interacting with fields. Never use `sleep()`.
- **Single screen at a time** — there is only one screen in the 3270 session window. Multi-screen parallel interaction is not supported.
- **Copy/paste** — Use LeanFT `field.sendKeys()` not clipboard paste; clipboard is unreliable in HLLAPI.
- **Read field value** — Use `field.getValue()` (async) to read back displayed data for assertions.

---

## 6. Manual Steps (Agent Must Flag)

The following actions **cannot be automated by the migration agent** and require human intervention:

| Step | Reason | Action Required |
|---|---|---|
| Capturing `attachedText` for a new screen | Requires live emulator + OIC | Tester runs OIC against live mainframe session |
| Verifying screen `identifiers[]` strings | Exact text depends on mainframe environment (SIT/UAT) | Tester validates text against each env |
| Adding a new screen to `objectrepository/screens.js` | Locator values unknown until manual capture | Tester fills in `attachedText` values post-capture |
| Emulator session shortName | Environment-specific | DevOps/tester configures `TE_SHORT_NAME` in CI |
