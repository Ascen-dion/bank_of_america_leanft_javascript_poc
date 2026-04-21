# BOA Mainframe Migration Agent — Usage Guide

## What This Agent Does

The **BOA Mainframe Migration Agent** is a context-aware, deterministic VS Code Copilot agent that:

1. **Migrates** UFT/Jarvis VBScript test scripts → LeanFT JavaScript (Jasmine)
2. **Accelerates** migration by automating all construct translations that have a known equivalent
3. **Flags** manual-only steps (locator capture, missing test data) explicitly — never guesses
4. **Enforces** project guardrails on every generated file
5. **Reports** a Migration Delta Report with full traceability of what was automated vs what needs manual action

---

## How the Agent Works — Phase Architecture

```
PHASE 0  →  Load all context files (mandatory gate)
PHASE 1  →  Intake & Analysis — parse the VBScript, list all constructs
PHASE 2  →  Construct Mapping — map each construct to its JS equivalent + assign flags
PHASE 3  →  Skeleton Generation — produce Jasmine spec file structure (no logic yet)
PHASE 4  →  Keyword Translation — translate each test step to LeanFT JS
PHASE 5  →  Guardrail Check — validate the output against all project rules
PHASE 6  →  Output + Migration Delta Report
```

Each phase presents output and pauses for your review. This is intentional — it keeps you in control of the migration.

---

## Context Folder

```
context/
  01-mainframe-app-knowledge.md   ← TN3270/HLLAPI, GBS screen inventory, HLLAPI key map
  02-domain-knowledge.md          ← BOA banking domain, FTD workflows, test data structure
  03-framework-knowledge.md       ← LeanFT SDK API, Jasmine patterns, all layer APIs
  04-project-guardrails.md        ← Coding rules, anti-patterns, naming conventions
  05-vbscript-to-js-migration-map.md  ← Complete VBScript → JS keyword/construct mapping table
```

The agent reads **all 5 files at PHASE 0** before doing anything. This is the source of truth — if you update any framework API or add a new keyword to `terminalHelper.js`, update the relevant context file.

---

## How to Use the Agent

### Scenario 1: Migrate a VBScript test file

**Prompt the agent**:
```
Migrate this VBScript test file to LeanFT JavaScript:
[paste or attach the VBScript file content]
```

The agent will:
- PHASE 0: confirm context loaded
- PHASE 1: show analysis report — ask you to confirm before continuing
- PHASE 2: show construct mapping — ask you to confirm before continuing
- PHASE 3: show spec file skeleton — ask you to confirm before continuing
- PHASE 4: fill in all translated test steps
- PHASE 5: run guardrail check and fix any violations
- PHASE 6: show final migrated file + Migration Delta Report

---

### Scenario 2: Add a new screen to `objectrepository/screens.js`

**Prompt the agent**:
```
Add a new screen called PAYMENT_HISTORY to screens.js. It shows "PAYMENT HISTORY" and "ACCOUNT SUMMARY" headers and has fields: Account Number, Date From, Date To, Transaction Count.
```

The agent will:
- PHASE 0: load context
- Generate the `screens.js` stub with `LOCATOR_MANUAL_REQUIRED` on all `attachedText` fields
- Remind you to run LeanFT OIC to capture exact label text against the live mainframe session

---

### Scenario 3: Add a new keyword to `terminalHelper.js`

**Prompt the agent**:
```
Add a new keyword called viewPaymentHistory(win, accountNumber) to terminalHelper.js.
```

The agent will:
- PHASE 0: load context
- Generate the async function using the established pattern (`waitForScreen`, `typeInField`, `sendKey`, `reporter.logStep`)
- Flag any unknown screen locators as `LOCATOR_MANUAL_REQUIRED`

---

### Scenario 4: Add a single new test case to an existing spec

**Prompt the agent**:
```
Add a new test case "should view payment history for account" to ftdtest_jasmine_spec.js.
```

The agent will:
- PHASE 0 → PHASE 4 (translate) → PHASE 5 (guardrail) → PHASE 6 (output)

---

## Migration Flag Codes Reference

| Code | Meaning | What you need to do |
|---|---|---|
| `✅ AUTO` | Fully automated — code is ready | None — review and approve |
| `⚠️ PARTIAL` | Mostly automated but has TODO comments | Review TODO comments and complete manually |
| `🔴 LOCATOR_MANUAL_REQUIRED` | Field or screen not in `screens.js` | Use LeanFT OIC to capture `attachedText`; add to `screens.js` |
| `🔴 TESTDATA_MANUAL_REQUIRED` | Test data key missing from `ftd_testdata.json` | Add the data key to `ftd_testdata.json` |
| `🔴 KEYWORD_MANUAL_REQUIRED` | No equivalent keyword in `terminalHelper.js` | Implement the keyword in `terminalHelper.js` |
| `⛔ NOT_APPLICABLE` | UFT construct has no 3270 equivalent (e.g. Browser) | Remove from scope — 3270 only tests |

---

## What the Agent Will NOT Do (Manual Steps You Own)

| Manual Step | Reason | Tool to use |
|---|---|---|
| Capture `attachedText` for screen fields | Requires live mainframe session + LeanFT OIC | LeanFT Object Identification Center |
| Verify screen `identifiers[]` strings against SIT/UAT | Exact text is env-specific | Run test in target env and observe |
| Add credentials to `testdata/ftd_testdata.json` | Security — no agent should write real credentials | Edit file manually |
| Configure TE emulator (PCOMM) and connect to mainframe | Infrastructure | DevOps / tester setup |
| Update CI pipeline `TE_SHORT_NAME` / `TEST_ENV` | Pipeline config | Jenkins / DevOps |

---

## Keeping Context Files Up to Date

When the framework evolves, update the corresponding context file:

| Change | Update this file |
|---|---|
| New keyword added to `terminalHelper.js` | `context/03-framework-knowledge.md` Section 3 |
| New screen added to `screens.js` | `context/01-mainframe-app-knowledge.md` Section 3 |
| New test data key added | `context/02-domain-knowledge.md` Section 3 |
| New project coding rule | `context/04-project-guardrails.md` |
| New VBScript construct discovered during migration | `context/05-vbscript-to-js-migration-map.md` |

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────┐
│                  VS Code Copilot Agent                   │
│                                                          │
│  .github/copilot-instructions.md  ← Agent brain         │
│                                                          │
│  context/                         ← Agent knowledge     │
│    01-mainframe-app-knowledge.md                         │
│    02-domain-knowledge.md                                │
│    03-framework-knowledge.md                             │
│    04-project-guardrails.md                              │
│    05-vbscript-to-js-migration-map.md                    │
└──────────────────────────────────────────────────────────┘
                          │
              Reads at PHASE 0 (mandatory)
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│              Deterministic Migration Pipeline            │
│                                                          │
│  PHASE 0 → PHASE 1 → PHASE 2 → PHASE 3                  │
│  (context)  (parse)  (map)    (skeleton)                 │
│                                          │               │
│  PHASE 6 ← PHASE 5 ←── PHASE 4          │               │
│  (output)  (check)     (translate)       │               │
└──────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│               LeanFT JavaScript Framework                │
│                                                          │
│  spec/        driver/    libraries/    objectrepository/ │
│  testdata/    config/    results/                        │
└──────────────────────────────────────────────────────────┘
```
