"""
Terminal Helper Library
Mirrors the Action Layer (.qfl keyword libraries) from the Jarvis framework.

Uses py3270 (wraps s3270) to drive TN3270 mainframe sessions directly
over a TCP socket — no HLLAPI emulator required.

HOW py3270 WORKS:
  py3270 launches s3270 as a subprocess and communicates via stdin/stdout.
  s3270 opens a raw TN3270 socket to HOST:PORT, sending and receiving
  IBM 3270 data stream bytes directly.

  Field positions: row/col are 1-based. Row 1 Col 1 = top-left corner.
  Keyboard input: em.move_to(row, col) positions the cursor, then
                  em.send_string("text") types the value.

PREREQUISITES:
  • wc3270 installed (includes s3270.exe) — https://x3270.miraheze.org/wiki/Downloads
  • s3270.exe must be on your system PATH
  • pip install py3270
"""

import time
import shutil
from py3270 import Emulator

from config import settings
from objectrepository.screens import get_screen, get_field
from libraries import report_helper as reporter

# ─── Key mapping — py3270 / s3270 action strings ──────────────────────────────
_KEY_MAP = {
    "Enter":  "Enter",
    "Clear":  "Clear",
    "PF1":    "PF(1)",
    "PF2":    "PF(2)",
    "PF3":    "PF(3)",
    "PF4":    "PF(4)",
    "PF5":    "PF(5)",
    "PF6":    "PF(6)",
    "PF7":    "PF(7)",
    "PF8":    "PF(8)",
    "PF9":    "PF(9)",
    "PF10":   "PF(10)",
    "PF11":   "PF(11)",
    "PF12":   "PF(12)",
    "Tab":    "Tab",
    "BackTab":"BackTab",
    "PA1":    "PA(1)",
    "PA2":    "PA(2)",
}


def check_s3270() -> None:
    """Verify s3270 is on PATH before attempting to create an Emulator."""
    if not shutil.which("s3270"):
        raise EnvironmentError(
            "s3270 not found on PATH.\n"
            "  Download wc3270 (includes s3270) from:\n"
            "  https://x3270.miraheze.org/wiki/Downloads\n"
            "  Then add its install folder (e.g. C:\\Program Files\\wc3270) to PATH."
        )


# ─── Connection / Session Management ──────────────────────────────────────────

def open_session() -> Emulator:
    """
    Open a TN3270 session to the configured host/port.
    Returns the Emulator instance to pass to all subsequent calls.

    Mirrors Jarvis ExecutionEngine.openSession()
    """
    check_s3270()
    reporter.log(
        "Opening TN3270 session",
        f"Host: {settings.HOST}:{settings.PORT}  Env: {settings.TEST_ENV}"
    )
    em = Emulator(visible=settings.VISIBLE)
    em.connect(f"{settings.HOST}:{settings.PORT}")
    reporter.log("TN3270 session connected")
    return em


def close_session(em: Emulator) -> None:
    """
    Terminate the TN3270 session.
    Mirrors Jarvis ExecutionEngine.closeSession()
    """
    if em:
        reporter.log("Closing TN3270 session")
        try:
            em.terminate()
        except Exception:
            pass


# ─── Screen Navigation ─────────────────────────────────────────────────────────

def wait_for_screen(em: Emulator, screen_name: str) -> str:
    """
    Wait until any identifier text for the named screen appears.
    Returns the full screen text (1920 chars = 24 rows × 80 cols).
    Raises TimeoutError if the screen does not appear within SCREEN_TIMEOUT.

    Mirrors Jarvis waitForScreen() keyword.
    """
    screen_def = get_screen(screen_name)
    identifiers = screen_def["identifiers"]
    reporter.log(f"Waiting for screen: {screen_name}", f"Identifiers: {identifiers}")

    deadline = time.time() + settings.SCREEN_TIMEOUT
    while time.time() < deadline:
        em.wait_for_field()
        screen_text = em.string_get(1, 1, 1920)
        for ident in identifiers:
            if ident.upper() in screen_text.upper():
                reporter.log_step(f"Screen detected: {screen_name}", "PASS")
                return screen_text
        time.sleep(0.3)

    # Capture what was actually on screen for the error message
    current = em.string_get(1, 1, 1920)
    raise TimeoutError(
        f'Screen "{screen_name}" did not appear within {settings.SCREEN_TIMEOUT}s.\n'
        f'Expected one of: {identifiers}\n'
        f'Screen row 1: {current[:80].strip()}'
    )


def get_screen_text(em: Emulator) -> str:
    """Return the full current screen text (24 rows × 80 cols)."""
    return em.string_get(1, 1, 1920)


def get_row(em: Emulator, row: int, col: int = 1, length: int = 79) -> str:
    """Read a single row from the screen and return stripped text."""
    return em.string_get(row, col, length).strip()


# ─── Key Operations ────────────────────────────────────────────────────────────

def send_key(em: Emulator, key_name: str) -> None:
    """
    Send a named key to the mainframe.
    key_name: "Enter", "PF3", "Clear", "Tab", etc.

    Mirrors Jarvis sendKey() keyword.
    """
    action = _KEY_MAP.get(key_name)
    if not action:
        raise ValueError(f'Unknown key: "{key_name}". Valid keys: {list(_KEY_MAP.keys())}')
    reporter.log(f"Sending key: {key_name}")
    em.send_key(action)
    em.wait_for_field()


# ─── Field Operations ──────────────────────────────────────────────────────────

def type_in_field(em: Emulator, screen_name: str, field_name: str, value: str) -> None:
    """
    Move cursor to the named field and type a value.
    Mirrors Jarvis typeInField() keyword.
    """
    field = get_field(screen_name, field_name)
    reporter.log(f"Typing into [{field_name}]", f'Value: "{value}"')
    em.move_to(field["row"], field["col"])
    em.send_string(value)


def read_field(em: Emulator, screen_name: str, field_name: str) -> str:
    """
    Read the value of a named field from the screen.
    Mirrors Jarvis readField() keyword.
    """
    field = get_field(screen_name, field_name)
    value = em.string_get(field["row"], field["col"], field["max_len"]).strip()
    reporter.log(f"Read field [{field_name}]", f'Value: "{value}"')
    return value


def clear_field(em: Emulator, screen_name: str, field_name: str) -> None:
    """Move to a field and clear its content with spaces."""
    field = get_field(screen_name, field_name)
    em.move_to(field["row"], field["col"])
    em.send_string(" " * field["max_len"])
    em.move_to(field["row"], field["col"])


# ─── Screenshot ────────────────────────────────────────────────────────────────

def capture_screen(em: Emulator, description: str = "Screen") -> str:
    """
    Capture current screen text and log it to the report.
    Returns the screen text.
    """
    screen_text = em.string_get(1, 1, 1920)
    reporter.log_screen_content(screen_text, description)
    return screen_text


# ─── Composite Keyword Actions (Business-level) ────────────────────────────────
# These map directly to Jarvis high-level keywords (.qfl functions)

def login(em: Emulator, user_id: str, password: str) -> None:
    """
    KEYWORD: Login to mainframe application.
    Mirrors Jarvis login() keyword.

    Waits for LOGON_SCREEN, types credentials, sends Enter.
    """
    reporter.log_step("KEYWORD: Login", "INFO", f"User: {user_id}")
    wait_for_screen(em, "LOGON_SCREEN")
    type_in_field(em, "LOGON_SCREEN", "userId",   user_id)
    type_in_field(em, "LOGON_SCREEN", "password", password)
    send_key(em, "Enter")


def select_menu_option(em: Emulator, option_code: str) -> None:
    """
    KEYWORD: Navigate to a Main Menu option.
    Mirrors Jarvis selectMenuOption() keyword.

    option_code: "01" = Account Inquiry, "02" = Funds Transfer, "99" = Sign Off
    """
    reporter.log_step("KEYWORD: Select Menu Option", "INFO", f"Option: {option_code}")
    wait_for_screen(em, "MAIN_MENU")
    type_in_field(em, "MAIN_MENU", "option", option_code)
    send_key(em, "Enter")


def account_inquiry(
    em: Emulator, account_number: str, account_type: str
) -> dict:
    """
    KEYWORD: Perform Account Inquiry.
    Mirrors Jarvis accountInquiry() keyword.

    Returns: {"balance": str, "status": str, "holderName": str}
    """
    reporter.log_step("KEYWORD: Account Inquiry", "INFO", f"Account: {account_number}")
    wait_for_screen(em, "ACCOUNT_INQUIRY")
    type_in_field(em, "ACCOUNT_INQUIRY", "accountNumber", account_number)
    type_in_field(em, "ACCOUNT_INQUIRY", "accountType",   account_type)
    send_key(em, "Enter")
    wait_for_screen(em, "ACCOUNT_INQUIRY")  # wait for result to populate
    capture_screen(em, f"Account Inquiry result — {account_number}")
    return {
        "balance":    read_field(em, "ACCOUNT_INQUIRY", "balance"),
        "status":     read_field(em, "ACCOUNT_INQUIRY", "status"),
        "holderName": read_field(em, "ACCOUNT_INQUIRY", "holderName"),
    }


def funds_transfer(
    em: Emulator,
    from_account: str,
    to_account: str,
    amount: str,
    currency: str,
) -> str:
    """
    KEYWORD: Perform Funds Transfer.
    Mirrors Jarvis fundsTransfer() keyword.

    Returns: confirmation number string
    """
    reporter.log_step(
        "KEYWORD: Funds Transfer", "INFO",
        f"From: {from_account}  To: {to_account}  Amt: {amount}"
    )
    wait_for_screen(em, "FUNDS_TRANSFER_INPUT")
    type_in_field(em, "FUNDS_TRANSFER_INPUT", "fromAccount", from_account)
    type_in_field(em, "FUNDS_TRANSFER_INPUT", "toAccount",   to_account)
    type_in_field(em, "FUNDS_TRANSFER_INPUT", "amount",      amount)
    type_in_field(em, "FUNDS_TRANSFER_INPUT", "currency",    currency)
    send_key(em, "Enter")
    wait_for_screen(em, "FUNDS_TRANSFER_CONFIRM")
    capture_screen(em, "Funds Transfer confirmation screen")
    return read_field(em, "FUNDS_TRANSFER_CONFIRM", "confirmationNumber")


def sign_off(em: Emulator) -> None:
    """
    KEYWORD: Sign off from mainframe.
    Mirrors Jarvis signOff() keyword.
    """
    reporter.log_step("KEYWORD: Sign Off")
    from objectrepository.screens import SCREENS
    option = SCREENS["MAIN_MENU"]["menu_options"]["signOff"]
    wait_for_screen(em, "MAIN_MENU")
    type_in_field(em, "MAIN_MENU", "option", option)
    send_key(em, "Enter")
    reporter.log("Signed off successfully")
