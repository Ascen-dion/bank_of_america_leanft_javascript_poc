"""
External Configuration Settings
Mirrors the ConfigTemplates layer from the Jarvis framework.

All environment-specific values are read from environment variables first,
then fall back to defaults. This makes CI/CD integration trivial:
  set TEST_ENV=SIT && pytest
  set TEST_ENV=UAT && pytest

HOW py3270 WORKS:
  py3270 wraps s3270 (the headless x3270 terminal emulator binary).
  It opens a direct TN3270 TCP socket connection to the mainframe host/port.
  No separate emulator install is needed beyond s3270/wc3270.

PREREQUISITES:
  1. Install wc3270 (includes s3270.exe):
       https://x3270.miraheze.org/wiki/Downloads
  2. Add C:\\Program Files\\wc3270 to your PATH
  3. pip install py3270
  4. Set environment variables (or edit defaults below)
  5. Run: pytest tests/
"""

import os

# ─── Terminal / Connection ─────────────────────────────────────────────────────
HOST             = os.getenv("TE_HOST",    "localhost")   # TN3270 host
PORT             = int(os.getenv("TE_PORT", "3270"))      # TN3270 port
SCREEN_TIMEOUT   = int(os.getenv("SCREEN_TIMEOUT", "15")) # seconds to wait for screen
CONNECT_TIMEOUT  = int(os.getenv("CONNECT_TIMEOUT", "30")) # seconds for initial connect
VISIBLE          = os.getenv("TE_VISIBLE", "false").lower() == "true"  # show wc3270 window

# ─── Test Execution ────────────────────────────────────────────────────────────
TEST_ENV         = os.getenv("TEST_ENV", "SIT")           # SIT or UAT
DEFAULT_TIMEOUT  = int(os.getenv("DEFAULT_TIMEOUT", "60")) # pytest timeout (seconds)

# ─── Reporting ────────────────────────────────────────────────────────────────
RESULTS_PATH     = os.getenv("RESULTS_PATH", "./results")
REPORT_NAME      = "BOA_FTD_TestReport"
SCREENSHOT_ON_FAILURE = True
