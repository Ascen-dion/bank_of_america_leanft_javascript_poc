# Framework Comparison – Jarvis (Current) vs Python/py3270 (New)

> **Audience**: shows a direct component-by-component mapping between the existing Jarvis framework and the new open-source Python/py3270 POC, demonstrating continuity while eliminating the VBScript/UFT/LeanFT dependency entirely.

---

## Side-by-Side Comparison Diagram

```mermaid
flowchart LR
    subgraph JARVIS["Current State – Jarvis  (UFT / VBScript)"]
        direction TB
        J1["Test Suite\n📄 Spreadsheet (.xlsx)"]
        J2["Test Flows\n📋 XML"]
        J3["Test Data\n📄 Spreadsheet (.xlsx)"]
        J4["ExecutionEngine\nDriver/Runner"]
        J5["Libraries\n.qfl VBScript files"]
        J6["ObjectRepository\nUFT .tsr / .mtr"]
        J7["ConfigTemplates"]
        J8["E2E Report / Results"]
        J9["Jenkinsfile"]
    end

    subgraph NEW["New State – Python / py3270 (POC)"]
        direction TB
        N1["Test Suite\n🧪 pytest spec (.py)"]
        N2["Test Flow\n🔀 TestClass / test_ functions"]
        N3["Test Data\n📊 JSON (ftd_testdata.json)"]
        N4["driver/runner.py\nSession lifecycle + fixtures"]
        N5["libraries/terminal_helper.py\nPython keyword functions"]
        N6["objectrepository/screens.py\nPlain Python dict — no binary format"]
        N7["config/settings.py\nEnv vars — no proprietary config"]
        N8["results/report.html\npytest-html report"]
        N9["Jenkinsfile (Python/pytest)"]
    end

    J1 -- "Modern equivalent" --> N1
    J2 -- "Modern equivalent" --> N2
    J3 -- "Modern equivalent" --> N3
    J4 -- "Modern equivalent" --> N4
    J5 -- "Replaces VBScript" --> N5
    J6 -- "Open format" --> N6
    J7 -- "Externalised" --> N7
    J8 -- "Richer report" --> N8
    J9 -- "Enhanced pipeline" --> N9

    style JARVIS fill:#fff1f2,stroke:#e11d48,color:#881337
    style NEW    fill:#f0fdf4,stroke:#16a34a,color:#14532d
```

---

## Component Mapping Table

| # | Jarvis Component | Jarvis Technology | New Component | New Technology |
|---|---|---|---|---|
| 1 | Test Suite | Excel Spreadsheet (`.xlsx`) | `tests/test_ftd_mainframe.py` | pytest (Python) |
| 2 | Test Flows | XML | `class Test…` / `def test_…` | Native Python class structure |
| 3 | Test Data | Excel Spreadsheet (`.xlsx`) | `testdata/ftd_testdata.json` | JSON via stdlib `json` module |
| 4 | Driver / ExecutionEngine | UFT proprietary runner | `driver/runner.py` | pytest fixtures + py3270 |
| 5 | Libraries | `.qfl` VBScript files | `libraries/terminal_helper.py` | Plain Python functions |
| 6 | Object Repository | UFT `.tsr` / `.mtr` (binary) | `objectrepository/screens.py` | Plain Python dict |
| 7 | ConfigTemplates | UFT config files | `config/settings.py` | Python + environment variables |
| 8 | E2E Report / Results | UFT HTML report | `results/report.html` | pytest-html (open source) |
| 9 | Jenkinsfile | Basic pipeline | `Jenkinsfile` | Parameterised (SIT/UAT/filter) |

---

## Key Technology Differences

| Concern | Jarvis (Current) | Python / py3270 (New) |
|---|---|---|
| **Language** | VBScript (deprecated) | Python 3.10+ (industry standard) |
| **Tooling** | UFT + LeanFT (proprietary, licensed) | py3270 + pytest (open source, free) |
| **Test runner** | UFT built-in | pytest (industry-standard, plugin ecosystem) |
| **TN3270 driver** | HLLAPI via emulator (UFT TE add-in) | Direct TN3270 TCP socket via s3270 binary |
| **Async model** | Synchronous, sequential | Synchronous (py3270 is blocking — safe for mainframe) |
| **Object Repo format** | Binary UFT format | Plain Python dict (readable, diffable in Git) |
| **Test data format** | Excel only | JSON (default); easily extended to Excel via openpyxl |
| **Licensing cost** | HIGH — UFT + LeanFT per-seat licenses | **ZERO** — all open source |
| **VBScript risk** | **HIGH** – VBScript is being phased out of Windows | **NONE** – Python has long-term support |
| **CI/CD maturity** | Limited (Litmus POC incomplete) | Jenkins pipeline ready (SIT + UAT) |
| **Source control** | Limited visibility into binary files | Full Git diff visibility (all text files) |

---

## What is Retained from Jarvis

- ✅ Modular, layered architecture (same conceptual structure)
- ✅ Data-driven approach (test data separate from test logic)
- ✅ Keyword-driven action layer (reusable functions/keywords)
- ✅ Centralised Object Repository
- ✅ External configuration
- ✅ Jenkins-based CI/CD pipeline
- ✅ HTML test reports with step-level logging
- ✅ TN3270 mainframe application support

## What Changes

- ❌ VBScript → ✅ Python
- ❌ UFT + LeanFT proprietary runner → ✅ py3270 + pytest (open source)
- ❌ Binary object files → ✅ Plain Python dict (Git-friendly)
- ❌ XML Test Flows → ✅ Native Python `class/def` structure
- ❌ HLLAPI emulator dependency → ✅ Direct TN3270 TCP socket (s3270)
- ❌ Per-seat licensing cost → ✅ Zero cost (all open source)
