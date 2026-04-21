"""
Report Helper
Mirrors the reportHelper layer from the Jarvis framework.

Provides structured, timestamped console logging and writes a simple
HTML report to results/. No third-party dependencies — uses Python stdlib only.

The HTML report is deliberately lightweight so it works without a browser plugin.
For richer reports, see pytest-html (add to requirements.txt).
"""

import os
import datetime
from config import settings

# Ensure results directory exists
os.makedirs(settings.RESULTS_PATH, exist_ok=True)

# In-memory log for current run (flushed to HTML at end)
_log_entries: list[dict] = []
_current_test: str = ""


def _now() -> str:
    return datetime.datetime.now().strftime("%H:%M:%S.%f")[:-3]


def _record(level: str, message: str, detail: str = "") -> None:
    entry = {
        "time":    _now(),
        "level":   level,
        "test":    _current_test,
        "message": message,
        "detail":  detail,
    }
    _log_entries.append(entry)
    detail_str = f" | {detail}" if detail else ""
    print(f"[{entry['time']}] [{level:5s}] {message}{detail_str}")


def start_test_case(test_case_id: str, description: str = "") -> None:
    global _current_test
    _current_test = test_case_id
    _record("START", f"=== {test_case_id} === {description}")


def end_test_case(test_case_id: str, status: str) -> None:
    _record(status, f"=== {test_case_id} ENDED: {status} ===")


def log(message: str, detail: str = "") -> None:
    _record("INFO", message, detail)


def log_step(message: str, status: str = "INFO", detail: str = "") -> None:
    _record(status, message, detail)


def log_screen_content(screen_text: str, label: str = "Screen") -> None:
    """Log a full screen capture to the report."""
    _record("SCRN", label)
    # Print screen content formatted as a 3270 terminal (80 chars wide)
    lines = [screen_text[i:i+80] for i in range(0, min(len(screen_text), 1920), 80)]
    for i, line in enumerate(lines[:24], 1):
        if line.strip():
            print(f"  [{i:02d}] {line}")


def write_html_report() -> str:
    """Write the HTML report to results/ and return the file path."""
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    report_path = os.path.join(
        settings.RESULTS_PATH,
        f"{settings.REPORT_NAME}_{timestamp}.html"
    )

    rows = []
    for e in _log_entries:
        colour = {
            "PASS": "#d4edda", "FAIL": "#f8d7da", "ERROR": "#f8d7da",
            "START": "#d1ecf1", "INFO": "#ffffff", "SCRN": "#fff3cd",
        }.get(e["level"], "#ffffff")
        rows.append(
            f'<tr style="background:{colour}">'
            f'<td>{e["time"]}</td>'
            f'<td><b>{e["level"]}</b></td>'
            f'<td>{e["test"]}</td>'
            f'<td>{e["message"]}</td>'
            f'<td>{e["detail"]}</td>'
            f'</tr>'
        )

    html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{settings.REPORT_NAME}</title>
  <style>
    body {{ font-family: Arial, sans-serif; font-size: 13px; margin: 20px; }}
    h1   {{ color: #333; }}
    table{{ border-collapse: collapse; width: 100%; }}
    th,td{{ border: 1px solid #ccc; padding: 6px 10px; text-align: left; }}
    th   {{ background: #343a40; color: white; }}
  </style>
</head>
<body>
  <h1>BOA Mainframe Automation POC — Test Report</h1>
  <p>Environment: <b>{settings.TEST_ENV}</b> &nbsp;|&nbsp;
     Generated: <b>{datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</b> &nbsp;|&nbsp;
     Framework: <b>py3270 + pytest (Python)</b></p>
  <table>
    <tr><th>Time</th><th>Level</th><th>Test Case</th><th>Message</th><th>Detail</th></tr>
    {''.join(rows)}
  </table>
</body>
</html>"""

    with open(report_path, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"\n[REPORT] Written to: {report_path}")
    return report_path
