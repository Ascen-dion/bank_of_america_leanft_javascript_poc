"""
Object Repository — Terminal Emulator Screen & Field Definitions
Mirrors the ObjectRepository layer from the Jarvis framework.

Centralizes all 3270 mainframe screen identifiers and row/column field
positions so tests never hard-code any screen text or coordinates.

HOW FIELDS ARE IDENTIFIED (py3270 / s3270):
  py3270 uses row/column coordinates (1-based) to locate fields.
  The 'row' and 'col' values here are the INPUT field start position —
  the first writable character position on the 3270 screen.

  To find exact row/col values:
    1. Connect wc3270 to your mainframe
    2. Move cursor to the input field
    3. Check the status bar — it shows cursor row/col
    OR use: em.string_get(row, col, length) and scan for blank (input) areas

Each screen entry contains:
  screen_id   — logical name used in tests
  identifiers — list of text strings present on this screen (used for detection)
  fields      — named fields with row, col, max_len
  keys        — logical key names mapped to s3270 action strings
"""

SCREENS = {

    # ─── Mainframe Logon Screen ────────────────────────────────────────────────
    "LOGON_SCREEN": {
        "screen_id":   "LOGON_SCREEN",
        "identifiers": ["BANK OF AMERICA", "LOGON"],
        "fields": {
            "userId":   {"row": 10, "col": 28, "max_len": 8},
            "password": {"row": 12, "col": 28, "max_len": 8},
        },
        "keys": {
            "submit": "Enter",
            "clear":  "Clear",
        },
    },

    # ─── Main Menu ─────────────────────────────────────────────────────────────
    "MAIN_MENU": {
        "screen_id":   "MAIN_MENU",
        "identifiers": ["MAIN MENU", "SELECT OPTION"],
        "fields": {
            "option": {"row": 20, "col": 15, "max_len": 2},
        },
        "menu_options": {
            "accountInquiry": "01",
            "fundsTransfer":  "02",
            "statementView":  "03",
            "signOff":        "99",
        },
        "keys": {
            "submit":  "Enter",
            "pf_back": "PF3",
        },
    },

    # ─── Account Inquiry Screen ───────────────────────────────────────────────
    "ACCOUNT_INQUIRY": {
        "screen_id":   "ACCOUNT_INQUIRY",
        "identifiers": ["ACCOUNT INQUIRY", "ENTER ACCOUNT NUMBER"],
        "fields": {
            "accountNumber": {"row": 8,  "col": 28, "max_len": 10},
            "accountType":   {"row": 9,  "col": 28, "max_len": 3},
            "balance":       {"row": 14, "col": 28, "max_len": 15, "read_only": True},
            "status":        {"row": 15, "col": 28, "max_len": 10, "read_only": True},
            "holderName":    {"row": 16, "col": 28, "max_len": 30, "read_only": True},
        },
        "keys": {
            "submit":   "Enter",
            "pf_back":  "PF3",
            "pf_clear": "PF12",
        },
    },

    # ─── Funds Transfer — Input ───────────────────────────────────────────────
    "FUNDS_TRANSFER_INPUT": {
        "screen_id":   "FUNDS_TRANSFER_INPUT",
        "identifiers": ["FUNDS TRANSFER", "FROM ACCOUNT"],
        "fields": {
            "fromAccount": {"row": 8,  "col": 28, "max_len": 10},
            "toAccount":   {"row": 10, "col": 28, "max_len": 10},
            "amount":      {"row": 12, "col": 28, "max_len": 12},
            "currency":    {"row": 14, "col": 28, "max_len": 3},
        },
        "keys": {
            "submit":  "Enter",
            "pf_back": "PF3",
            "confirm": "PF6",
        },
    },

    # ─── Funds Transfer — Confirmation ────────────────────────────────────────
    "FUNDS_TRANSFER_CONFIRM": {
        "screen_id":   "FUNDS_TRANSFER_CONFIRM",
        "identifiers": ["TRANSFER SUCCESSFUL", "CONFIRMATION NUMBER"],
        "fields": {
            "confirmationNumber": {"row": 10, "col": 28, "max_len": 20, "read_only": True},
            "message":            {"row": 12, "col": 28, "max_len": 60, "read_only": True},
        },
        "keys": {
            "pf_back": "PF3",
            "pf_home": "PF1",
        },
    },

    # ─── Error / Message Screen (generic) ────────────────────────────────────
    "ERROR_SCREEN": {
        "screen_id":   "ERROR_SCREEN",
        "identifiers": ["ERROR", "INVALID"],
        "fields": {
            "errorMessage": {"row": 20, "col": 2, "max_len": 79, "read_only": True},
        },
        "keys": {
            "pf_back": "PF3",
            "clear":   "Clear",
        },
    },
}


def get_screen(screen_name: str) -> dict:
    """Return screen definition or raise KeyError."""
    if screen_name not in SCREENS:
        raise KeyError(f'Screen definition not found: "{screen_name}"')
    return SCREENS[screen_name]


def get_field(screen_name: str, field_name: str) -> dict:
    """Return field definition or raise KeyError."""
    screen = get_screen(screen_name)
    fields = screen.get("fields", {})
    if field_name not in fields:
        raise KeyError(f'Field "{field_name}" not found on screen "{screen_name}"')
    return fields[field_name]
