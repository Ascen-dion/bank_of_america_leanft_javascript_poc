"""
FTD Mainframe Test Suite — pytest
Mirrors the Jasmine spec (ftdtest_jasmine_spec.js) from the Jarvis/LeanFT framework.

Test case IDs match the original Jarvis suite:
  TC001  Valid login
  TC002  Invalid login
  TC003  Account Inquiry — checking account
  TC005  Funds Transfer

HOW IT WORKS:
  • `em` fixture  → shared Emulator from conftest.py (session-scoped)
  • Test data     → loaded from testdata/ftd_testdata.json via test_data_manager
  • Keywords      → called from libraries/terminal_helper.py
  • Reports       → written to results/ as HTML by report_helper
"""

import pytest
from libraries import terminal_helper as terminal
from testdata import test_data_manager as tdm


# ─── TC001: Valid Login ────────────────────────────────────────────────────────

class TestLogin:

    def test_TC001_valid_login(self, em):
        """
        TC001: Valid credentials should land on MAIN_MENU screen.
        Mirrors Jarvis TC001_ValidLogin.
        """
        td = tdm.get("FTD_Login", "TC001")

        # Action
        terminal.login(em, td["userId"], td["password"])

        # Assert
        screen_text = terminal.wait_for_screen(em, "MAIN_MENU")
        assert td["expectedScreen"].upper() in screen_text.upper(), (
            f"TC001 FAIL: Expected '{td['expectedScreen']}' on screen after login.\n"
            f"Screen content: {screen_text[:160]}"
        )

    def test_TC002_invalid_login(self, em):
        """
        TC002: Invalid password should show error on LOGON_SCREEN.
        Mirrors Jarvis TC002_InvalidLogin.
        """
        td = tdm.get("FTD_Login", "TC002")

        # Action
        terminal.login(em, td["userId"], td["password"])

        # Assert — error should appear on logon screen
        screen_text = terminal.get_screen_text(em)
        assert td["expectedScreen"].upper() in screen_text.upper(), (
            f"TC002 FAIL: Expected error message '{td['expectedScreen']}'.\n"
            f"Screen content: {screen_text[:160]}"
        )

        # Return to a clean state for subsequent tests — go back to logon
        # (PF3 or Clear typically dismisses the error on most mainframe apps)
        terminal.send_key(em, "PF3")


# ─── TC003–TC004: Account Inquiry ─────────────────────────────────────────────

class TestAccountInquiry:

    @pytest.fixture(autouse=True)
    def navigate_to_inquiry(self, em):
        """Navigate to Account Inquiry screen before each test in this class."""
        terminal.select_menu_option(em, "01")   # "01" = Account Inquiry
        yield
        # Return to main menu via PF3 after each inquiry test
        terminal.send_key(em, "PF3")

    def test_TC003_checking_account_inquiry(self, em):
        """
        TC003: Account inquiry for a checking account should return balance and status.
        Mirrors Jarvis TC003_AccountInquiry.
        """
        td = tdm.get("FTD_AccountInquiry", "TC003")

        result = terminal.account_inquiry(em, td["accountNumber"], td["accountType"])

        assert td["expectedBalance"] in result["balance"], (
            f"TC003 FAIL: Expected balance {td['expectedBalance']}, got '{result['balance']}'"
        )
        assert td["expectedStatus"].upper() in result["status"].upper(), (
            f"TC003 FAIL: Expected status {td['expectedStatus']}, got '{result['status']}'"
        )


# ─── TC005: Funds Transfer ─────────────────────────────────────────────────────

class TestFundsTransfer:

    @pytest.fixture(autouse=True)
    def navigate_to_transfer(self, em):
        """Navigate to Funds Transfer screen before each test in this class."""
        terminal.select_menu_option(em, "02")   # "02" = Funds Transfer
        yield
        terminal.send_key(em, "PF3")

    def test_TC005_funds_transfer(self, em):
        """
        TC005: Funds transfer between two accounts should return a confirmation number.
        Mirrors Jarvis TC005_FundsTransfer.
        """
        td = tdm.get("FTD_FundsTransfer", "TC005")

        confirmation = terminal.funds_transfer(
            em,
            from_account=td["fromAccount"],
            to_account=td["toAccount"],
            amount=td["amount"],
            currency=td["currency"],
        )

        assert confirmation, (
            "TC005 FAIL: Confirmation number was empty. Transfer may have failed."
        )
        assert td["expectedConfirmation"].upper() in terminal.get_screen_text(em).upper(), (
            f"TC005 FAIL: Expected '{td['expectedConfirmation']}' on confirmation screen."
        )
