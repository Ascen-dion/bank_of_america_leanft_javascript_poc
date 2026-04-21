# BOA Mainframe Automation POC
### Python · py3270 · pytest — Open-Source Alternative to Jarvis / UFT / LeanFT

> **POC Objective**: Demonstrate a fully open-source, zero-license-cost automation framework for IBM Mainframe (TN3270) applications as a modernization path away from the Jarvis / UFT / VBScript stack.
>
> This branch (`python_based_open_source_poc`) uses **py3270** (a Python wrapper around the `s3270` binary) to drive TN3270 sessions directly over a TCP socket — no HLLAPI, no emulator license, no OpenText tools required.

---

## Project Documents

| # | Document | Description |
|---|---|---|
| 1 | [New Architecture](docs/01-new-architecture.md) | Python/py3270 layer architecture diagram |
| 2 | [Jarvis vs Python Comparison](docs/02-jarvis-vs-leanft-comparison.md) | Side-by-side component mapping: Jarvis → Python/py3270 |

---

## Why Python / py3270 Instead of LeanFT?

| Concern | LeanFT (main branch) | Python / py3270 (this branch) |
|---|---|---|
| **License cost** | OpenText per-seat license | **Free — all open source** |
| **Language** | JavaScript | Python 3.10+ |
| **TN3270 driver** | LeanFT TE SDK (proprietary) | py3270 → s3270 (open source) |
| **Test runner** | Jasmine | pytest (industry standard) |
| **Emulator required** | Yes (LeanFT agent) | No (s3270 is headless, no GUI) |
| **CI/CD** | Jenkins + Node.js | Jenkins + Python |

---

## Architecture

```
├── config/
│   └── settings.py          # All config from environment variables
├── driver/
│   └── runner.py            # Session lifecycle (setup/teardown)
├── libraries/
│   ├── terminal_helper.py   # TN3270 keywords (login, inquire, transfer)
│   └── report_helper.py     # HTML report + console logging
├── objectrepository/
│   └── screens.py           # Screen identifiers and field row/col positions
├── testdata/
│   ├── ftd_testdata.json    # Test inputs and expected values
│   └── test_data_manager.py # get(sheet, tc_id) data access layer
├── tests/
│   └── test_ftd_mainframe.py # pytest test suite (TC001–TC005)
├── results/                  # HTML report output (generated at runtime)
├── conftest.py               # pytest fixtures (session + per-test lifecycle)
├── requirements.txt
└── Jenkinsfile
```

---

## Jarvis → Python Component Mapping

| Jarvis Component | Jarvis Technology | Python POC Equivalent |
|---|---|---|
| Test Suite | Excel Spreadsheet | `tests/test_ftd_mainframe.py` (pytest) |
| Test Flows | XML | Python `class Test… / def test_…` |
| Test Data | Excel Spreadsheet | `testdata/ftd_testdata.json` (JSON) |
| Driver / ExecutionEngine | UFT proprietary runner | `driver/runner.py` + pytest fixtures |
| Libraries (.qfl) | VBScript keyword files | `libraries/terminal_helper.py` |
| Object Repository | UFT binary `.tsr/.mtr` | `objectrepository/screens.py` (plain Python dict) |
| ConfigTemplates | UFT config files | `config/settings.py` + env vars |
| E2E Report | UFT HTML report | `results/report.html` via pytest-html |
| Jenkinsfile | Basic pipeline | Parameterised Jenkins pipeline (SIT/UAT) |

---

## Prerequisites

### 1. Python 3.10 or later
```
python --version
```

### 2. wc3270 (includes s3270 — the headless TN3270 binary)
Download from: https://x3270.miraheze.org/wiki/Downloads

After installing, add the install folder to your system PATH.  
Verify: `s3270 -version`

### 3. Virtual environment + dependencies
```bash
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

---

## Configuration

All settings are driven by environment variables with sensible defaults:

| Variable | Default | Description |
|---|---|---|
| `TE_HOST` | `localhost` | TN3270 mainframe hostname |
| `TE_PORT` | `3270` | TN3270 port |
| `TEST_ENV` | `SIT` | Environment label (SIT / UAT) |
| `SCREEN_TIMEOUT` | `15` | Seconds to wait for a screen to appear |
| `RESULTS_PATH` | `./results` | HTML report output folder |

Set environment variables before running:
```powershell
$env:TE_HOST = "mainframe.boa.example.com"
$env:TE_PORT = "3270"
$env:TEST_ENV = "SIT"
```

> **No live mainframe?** Use [Hercules + MVS 3.8j Turnkey](http://wotho.ethz.ch/tk4-/) on `localhost:3270` (credentials: `HERC01` / `CUL8TR`) or IBM Z Xplore (free cloud z/OS).

---

## Running Tests

```bash
# Activate virtual environment
.venv\Scripts\activate

# Run full suite with HTML report
pytest tests/ -v --html=results/report.html --self-contained-html

# Run a single test case by keyword
pytest tests/ -v -k "TC001"

# Run all login tests
pytest tests/ -v -k "TestLogin"
```

---

## Test Cases

| ID | Class | Description |
|---|---|---|
| TC001 | `TestLogin` | Valid login → lands on MAIN MENU |
| TC002 | `TestLogin` | Invalid password → error on logon screen |
| TC003 | `TestAccountInquiry` | Checking account balance + status |
| TC005 | `TestFundsTransfer` | Transfer funds between two accounts |

---

## CI/CD (Jenkins)

The `Jenkinsfile` supports:
- **Parameters**: `TEST_ENV` (SIT/UAT), `TE_HOST`, `TE_PORT`, `SUITE_FILTER` (pytest -k)
- **Stages**: Checkout → Install Python deps → Pre-flight s3270 check → Run pytest → Archive HTML report
- **Report publishing**: `publishHTML` plugin archives `results/report.html`

---

## How py3270 Works

```
pytest
  └── conftest.py (session fixture)
        └── driver/runner.py
              └── terminal_helper.open_session()
                    └── py3270.Emulator()
                          └── s3270 subprocess
                                └── TN3270 TCP socket → HOST:PORT (IBM Mainframe)
```

py3270 launches `s3270` as a subprocess and communicates with it via stdin/stdout pipes.  
`s3270` opens a raw TN3270 session — **no GUI window, no HLLAPI, no emulator install beyond the binary itself**.

Field input: `em.move_to(row, col)` → `em.send_string("value")`  
Field read:  `em.string_get(row, col, length)`  
Keys:        `em.send_key("Enter")` / `em.send_key("PF(3)")`

---

## Branch Strategy

| Branch | Framework | Notes |
|---|---|---|
| `main` | LeanFT + JavaScript + Jasmine | Requires OpenText LeanFT license |
| `python_based_open_source_poc` | Python + py3270 + pytest | **This branch** — zero licensing cost |
