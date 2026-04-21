/**
 * Object Repository – Terminal Emulator Screen & Field Definitions
 * Mirrors the ObjectRepository layer from the Jarvis framework.
 *
 * Centralizes all 3270 mainframe screen identifiers and field locators
 * so tests never contain hard-coded screen text or field positions.
 *
 * Each screen entry contains:
 *   screenId   – logical name used in tests
 *   identifiers– text strings that uniquely identify the screen (used by TeScreen.find)
 *   fields     – named field descriptors with row/column positions or labels
 */

"use strict";

const screens = {

    /**
     * Mainframe Logon Screen
     */
    LOGON_SCREEN: {
        screenId: "LOGON_SCREEN",
        identifiers: ["BANK OF AMERICA", "LOGON"],
        fields: {
            userId:   { label: "USER ID", row: 10, col: 20, maxLen: 8 },
            password: { label: "PASSWORD", row: 12, col: 20, maxLen: 8 }
        },
        keys: {
            submit: "Enter",
            clear:  "Clear"
        }
    },

    /**
     * Main Menu
     */
    MAIN_MENU: {
        screenId: "MAIN_MENU",
        identifiers: ["MAIN MENU", "SELECT OPTION"],
        fields: {
            option: { label: "OPTION", row: 20, col: 2, maxLen: 2 }
        },
        menuOptions: {
            accountInquiry:  "01",
            fundsTransfer:   "02",
            statementView:   "03",
            signOff:         "99"
        },
        keys: {
            submit: "Enter",
            pfBack: "PF3"
        }
    },

    /**
     * Account Inquiry Screen
     */
    ACCOUNT_INQUIRY: {
        screenId: "ACCOUNT_INQUIRY",
        identifiers: ["ACCOUNT INQUIRY", "ENTER ACCOUNT NUMBER"],
        fields: {
            accountNumber: { label: "ACCOUNT NUMBER", row: 8,  col: 25, maxLen: 10 },
            accountType:   { label: "ACCOUNT TYPE",   row: 9,  col: 25, maxLen: 3  },
            balance:       { label: "BALANCE",        row: 14, col: 25, maxLen: 15, readOnly: true },
            status:        { label: "STATUS",         row: 15, col: 25, maxLen: 10, readOnly: true },
            holderName:    { label: "ACCOUNT HOLDER", row: 16, col: 25, maxLen: 30, readOnly: true }
        },
        keys: {
            submit: "Enter",
            pfBack: "PF3",
            pfClear:"PF12"
        }
    },

    /**
     * Funds Transfer – Input Screen
     */
    FUNDS_TRANSFER_INPUT: {
        screenId: "FUNDS_TRANSFER_INPUT",
        identifiers: ["FUNDS TRANSFER", "FROM ACCOUNT"],
        fields: {
            fromAccount: { label: "FROM ACCOUNT", row: 8,  col: 25, maxLen: 10 },
            toAccount:   { label: "TO ACCOUNT",   row: 10, col: 25, maxLen: 10 },
            amount:      { label: "AMOUNT",        row: 12, col: 25, maxLen: 12 },
            currency:    { label: "CURRENCY",      row: 14, col: 25, maxLen: 3  }
        },
        keys: {
            submit: "Enter",
            pfBack: "PF3",
            confirm:"PF6"
        }
    },

    /**
     * Funds Transfer – Confirmation Screen
     */
    FUNDS_TRANSFER_CONFIRM: {
        screenId: "FUNDS_TRANSFER_CONFIRM",
        identifiers: ["TRANSFER SUCCESSFUL", "CONFIRMATION NUMBER"],
        fields: {
            confirmationNumber: { label: "CONFIRMATION NUMBER", row: 10, col: 25, maxLen: 20, readOnly: true },
            message:            { label: "MESSAGE",             row: 12, col: 25, maxLen: 60, readOnly: true }
        },
        keys: {
            pfBack: "PF3",
            pfHome: "PF1"
        }
    },

    /**
     * Error / Message Screen (generic)
     */
    ERROR_SCREEN: {
        screenId: "ERROR_SCREEN",
        identifiers: ["ERROR", "INVALID"],
        fields: {
            errorMessage: { label: "MESSAGE", row: 20, col: 2, maxLen: 79, readOnly: true }
        },
        keys: {
            pfBack: "PF3",
            clear:  "Clear"
        }
    }
};

module.exports = screens;
