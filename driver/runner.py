"""
Driver / Runner
Mirrors the ExecutionEngine / Driver/Runner layer from the Jarvis framework.

Manages the TN3270 session lifecycle for the entire pytest session:
  - session_setup()    → open TN3270 connection (runs once before all tests)
  - session_teardown() → close TN3270 connection (runs once after all tests)
  - before_each()      → log test start, capture initial screen state
  - after_each()       → log result, capture screen on failure

Used via the conftest.py pytest fixtures — tests never call this directly.
"""

from py3270 import Emulator
from libraries import terminal_helper as terminal
from libraries import report_helper as reporter
from config import settings

# Module-level reference to the active emulator (shared across all tests)
_emulator: Emulator | None = None


def get_emulator() -> Emulator:
    """Return the active Emulator instance. Raises if session is not open."""
    if _emulator is None:
        raise RuntimeError(
            "TN3270 session is not open. "
            "Ensure session_setup() has been called (check conftest.py fixtures)."
        )
    return _emulator


def session_setup() -> Emulator:
    """
    Open TN3270 session and store reference.
    Called once before the full test suite (session-scoped fixture).
    """
    global _emulator
    reporter.log("=== SESSION SETUP ===", f"ENV: {settings.TEST_ENV}  Host: {settings.HOST}:{settings.PORT}")
    _emulator = terminal.open_session()
    return _emulator


def session_teardown() -> None:
    """
    Close TN3270 session and write the HTML report.
    Called once after all tests complete (session-scoped fixture).
    """
    global _emulator
    reporter.log("=== SESSION TEARDOWN ===")
    terminal.close_session(_emulator)
    _emulator = None
    reporter.write_html_report()


def before_each_test(test_name: str) -> None:
    """Log test start. Called from pytest fixture before each test."""
    reporter.log(f"--- Before: {test_name} ---")


def after_each_test(test_name: str, passed: bool) -> None:
    """Capture screenshot on failure, log result. Called from pytest fixture."""
    em = _emulator
    if not passed and em and settings.SCREENSHOT_ON_FAILURE:
        try:
            terminal.capture_screen(em, f"FAILURE screenshot — {test_name}")
        except Exception:
            pass
    status = "PASS" if passed else "FAIL"
    reporter.log(f"--- After: {test_name} — {status} ---")
