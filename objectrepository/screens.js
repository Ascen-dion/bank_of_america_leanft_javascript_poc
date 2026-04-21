/**
 * Object Repository â€“ Terminal Emulator Screen & Field Definitions
 * Mirrors the ObjectRepository layer from the Jarvis framework.
 *
 * Centralizes all 3270 mainframe screen identifiers and field locators
 * so tests never contain hard-coded screen text or field positions.
 *
 * HOW FIELDS ARE IDENTIFIED (LeanFT TE SDK):
 *   LeanFT finds fields by their "attached text" â€“ the protected label text
 *   that appears immediately to the left of an input field on the 3270 screen.
 *   This is the standard HLLAPI field identification mechanism.
 *
 *   Use the LeanFT Object Identification Center (OIC) with your live
 *   terminal emulator connected to the mainframe to capture exact
 *   attachedText values for each field.
 *
 * Each screen entry contains:
 *   screenId    â€“ logical name used in tests
 *   identifiers â€“ text strings that appear on screen (used with waitForText)
 *   fields      â€“ named field descriptors with their attachedText (label)
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
            userId:   { attachedText: "USER ID"  },
            password: { attachedText: "PASSWORD" }
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
            option: { attachedText: "OPTION" }
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
            accountNumber: { attachedText: "ACCOUNT NUMBER" },
            accountType:   { attachedText: "ACCOUNT TYPE"   },
            balance:       { attachedText: "BALANCE"        },
            status:        { attachedText: "STATUS"         },
            holderName:    { attachedText: "ACCOUNT HOLDER" }
        },
        keys: {
            submit: "Enter",
            pfBack: "PF3",
            pfClear:"PF12"
        }
    },

    /**
     * Funds Transfer â€“ Input Screen
     */
    FUNDS_TRANSFER_INPUT: {
        screenId: "FUNDS_TRANSFER_INPUT",
        identifiers: ["FUNDS TRANSFER", "FROM ACCOUNT"],
        fields: {
            fromAccount: { attachedText: "FROM ACCOUNT" },
            toAccount:   { attachedText: "TO ACCOUNT"   },
            amount:      { attachedText: "AMOUNT"       },
            currency:    { attachedText: "CURRENCY"     }
        },
        keys: {
            submit: "Enter",
            pfBack: "PF3",
            confirm:"PF6"
        }
    },

    /**
     * Funds Transfer â€“ Confirmation Screen
     */
    FUNDS_TRANSFER_CONFIRM: {
        screenId: "FUNDS_TRANSFER_CONFIRM",
        identifiers: ["TRANSFER SUCCESSFUL", "CONFIRMATION NUMBER"],
        fields: {
            confirmationNumber: { attachedText: "CONFIRMATION NUMBER" },
            message:            { attachedText: "MESSAGE"             }
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
            errorMessage: { attachedText: "MESSAGE" }
        },
        keys: {
            pfBack: "PF3",
            clear:  "Clear"
        }
    }
};

module.exports = screens;
