/**
 * Terminal Helper Library
 * Mirrors the reusable Action Layer (.qfl keyword libraries) from Jarvis.
 *
 * Uses LeanFT Terminal Emulator SDK (leanft.sdk.te) via HLLAPI.
 *
 * â”€â”€â”€ HOW LeanFT TE WORKS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 *  LeanFT does NOT open a TN3270 TCP connection itself.
 *  It controls an ALREADY-RUNNING terminal emulator (IBM PCOMM, Attachmate
 *  Reflection, Micro Focus Rumba, etc.) that is connected to the mainframe.
 *  LeanFT communicates with the emulator via HLLAPI â€“ the IBM standard for
 *  mainframe green screen automation.
 *
 *  PREREQUISITES before running tests:
 *    1. Install a HLLAPI-capable emulator (e.g. IBM Personal Communications)
 *    2. Connect it to the mainframe (TN3270 host configured in the emulator)
 *    3. Start the OpenText LeanFT Agent (system tray)
 *    4. Run: npm test
 *
 *  LeanFT then:
 *    â€¢ Finds the emulator Window by shortName (session ID e.g. "A")
 *    â€¢ Finds Screen / Field objects within it
 *    â€¢ Sends keystrokes via HLLAPI key strings (@E=Enter, @3=PF3, @C=Clear)
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 *
 * All functions return Promises â€“ use with async/await in test specs.
 */

"use strict";

const LFT      = require("leanft");
const TE       = require("leanft.sdk.te");
const settings = require("../config/settings");
const screens  = require("../objectrepository/screens");
const reporter = require("./reportHelper");

// HLLAPI key constants from the TE SDK
const Keys = TE.DescriptionsAndEnums.Keys;

// Description constructors
const Window    = TE.DescriptionsAndEnums.Window;
const Screen    = TE.DescriptionsAndEnums.Screen;
const Field     = TE.DescriptionsAndEnums.Field;

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  Window (Session) Management
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Find and return the running terminal emulator window.
 * The terminal emulator must already be running and connected to the mainframe.
 * @returns {Promise<WindowTO>}
 */
async function getTeWindow() {
    reporter.log("Locating terminal emulator window", `ShortName: ${settings.terminal.shortName}`);
    const win = await LFT.find(Window({
        shortName: settings.terminal.shortName
    }));
    reporter.log("Terminal emulator window found");
    return win;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  Screen Operations
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Wait for a named screen to appear by checking for its identifier text.
 * Uses screen.waitForText() â€“ the correct LeanFT TE API.
 *
 * @param {WindowTO} win         â€“ the TE window object
 * @param {string}   screenName  â€“ key from objectrepository/screens.js
 * @returns {Promise<ScreenTO>}
 */
async function waitForScreen(win, screenName) {
    const screenDef = _getScreenDef(screenName);
    reporter.log(`Waiting for screen: ${screenName}`);

    // Find the screen object (there is typically one screen per TE window)
    const screen = await win.find(Screen());

    // Wait for ANY of the screen identifier strings to appear
    const identifierText = screenDef.identifiers[0];
    const appeared = await screen.waitForText(identifierText, settings.terminal.screenTimeout);

    if (!appeared) {
        throw new Error(`Screen "${screenName}" did not appear within ${settings.terminal.screenTimeout}ms. Expected text: "${identifierText}"`);
    }

    reporter.logStep(`Screen verified: ${screenName}`, "PASS");
    return screen;
}

/**
 * Read the full text content of the current screen.
 * @param {ScreenTO} screen
 * @returns {Promise<string>}
 */
async function getScreenText(screen) {
    return await screen.getText();
}

/**
 * Send a named key using HLLAPI key strings.
 * @param {ScreenTO} screen
 * @param {string}   keyName  â€“ logical key name e.g. "Enter", "PF3", "Clear"
 */
async function sendKey(screen, keyName) {
    reporter.log(`Sending key: ${keyName}`);
    const keyMap = {
        "Enter": Keys.enter,   // "@E"
        "Clear": Keys.clear,   // "@C"
        "PF1":   Keys.pf1,
        "PF2":   Keys.pf2,
        "PF3":   Keys.pf3,
        "PF4":   Keys.pf4,
        "PF5":   Keys.pf5,
        "PF6":   Keys.pf6,
        "PF7":   Keys.pf7,
        "PF8":   Keys.pf8,
        "PF9":   Keys.pf9,
        "PF10":  Keys.pf10,
        "PF11":  Keys.pf11,
        "PF12":  Keys.pf12,
        "Tab":   Keys.tab,
        "BackTab": Keys.backtab
    };
    const teKey = keyMap[keyName];
    if (!teKey) throw new Error(`Unknown key: "${keyName}"`);
    await screen.sendTEKeys(teKey);
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  Field Operations
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Find a field on the TE window by its attached text (label next to the field).
 * @param {WindowTO} win
 * @param {string}   screenName
 * @param {string}   fieldName
 * @returns {Promise<FieldTO>}
 */
async function findField(win, screenName, fieldName) {
    const fieldDef = _getFieldDef(screenName, fieldName);
    return await win.find(Field({ attachedText: fieldDef.attachedText }));
}

/**
 * Type a value into a named field.
 * @param {WindowTO} win
 * @param {string}   screenName
 * @param {string}   fieldName
 * @param {string}   value
 */
async function typeInField(win, screenName, fieldName, value) {
    const fieldDef = _getFieldDef(screenName, fieldName);
    reporter.log(`Typing into field [${fieldName}]`, `Value: "${value}"`);
    const field = await win.find(Field({ attachedText: fieldDef.attachedText }));
    await field.setText(value);
}

/**
 * Type into a hidden/password field securely.
 * @param {WindowTO} win
 * @param {string}   screenName
 * @param {string}   fieldName
 * @param {string}   value
 */
async function typeSecure(win, screenName, fieldName, value) {
    const fieldDef = _getFieldDef(screenName, fieldName);
    reporter.log(`Typing securely into field [${fieldName}]`);
    const field = await win.find(Field({ attachedText: fieldDef.attachedText }));
    await field.setSecure(value);
}

/**
 * Read the text value of a named field.
 * @param {WindowTO} win
 * @param {string}   screenName
 * @param {string}   fieldName
 * @returns {Promise<string>}
 */
async function readField(win, screenName, fieldName) {
    const fieldDef = _getFieldDef(screenName, fieldName);
    const field = await win.find(Field({ attachedText: fieldDef.attachedText }));
    const value = await field.text();
    reporter.log(`Read field [${fieldName}]`, `Value: "${value}"`);
    return value ? value.trim() : "";
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  Screenshot
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Capture a screenshot of the current screen and attach to the LeanFT report.
 * @param {ScreenTO} screen
 * @param {string}   description
 */
async function captureScreen(screen, description) {
    try {
        const img = await screen.getSnapshot();
        reporter.attachSnapshot(img, description);
    } catch (e) {
        reporter.log(`Screenshot failed: ${e.message}`);
    }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  Composite Keyword Actions (Business-level)
//  These map to Jarvis high-level keywords
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * KEYWORD: Login to mainframe application
 * @param {WindowTO} win
 * @param {string}   userId
 * @param {string}   password
 */
async function login(win, userId, password) {
    reporter.logStep("KEYWORD: Login", `User: ${userId}`);
    const screen = await waitForScreen(win, "LOGON_SCREEN");
    await typeInField(win, "LOGON_SCREEN", "userId", userId);
    // Password is a hidden field â€“ use setSecure
    await typeSecure(win, "LOGON_SCREEN", "password", password);
    await sendKey(screen, "Enter");
    // Wait for host to respond
    await screen.sync(settings.terminal.screenTimeout);
}

/**
 * KEYWORD: Navigate to a Main Menu option
 * @param {WindowTO} win
 * @param {ScreenTO} screen
 * @param {string}   optionCode  â€“ e.g. "01" for Account Inquiry
 */
async function selectMenuOption(win, screen, optionCode) {
    reporter.logStep("KEYWORD: Select Menu Option", `Option: ${optionCode}`);
    await waitForScreen(win, "MAIN_MENU");
    await typeInField(win, "MAIN_MENU", "option", optionCode);
    await sendKey(screen, "Enter");
    await screen.sync(settings.terminal.screenTimeout);
}

/**
 * KEYWORD: Perform Account Inquiry
 * @param {WindowTO} win
 * @param {ScreenTO} screen
 * @param {string}   accountNumber
 * @param {string}   accountType
 * @returns {Promise<{balance: string, status: string}>}
 */
async function accountInquiry(win, screen, accountNumber, accountType) {
    reporter.logStep("KEYWORD: Account Inquiry", `Account: ${accountNumber}`);
    await waitForScreen(win, "ACCOUNT_INQUIRY");
    await typeInField(win, "ACCOUNT_INQUIRY", "accountNumber", accountNumber);
    await typeInField(win, "ACCOUNT_INQUIRY", "accountType", accountType);
    await sendKey(screen, "Enter");
    await screen.sync(settings.terminal.screenTimeout);
    await captureScreen(screen, `Account Inquiry result for ${accountNumber}`);
    const balance = await readField(win, "ACCOUNT_INQUIRY", "balance");
    const status  = await readField(win, "ACCOUNT_INQUIRY", "status");
    return { balance, status };
}

/**
 * KEYWORD: Perform Funds Transfer
 * @param {WindowTO} win
 * @param {ScreenTO} screen
 * @param {string}   fromAccount
 * @param {string}   toAccount
 * @param {string}   amount
 * @param {string}   currency
 * @returns {Promise<string>} confirmation number
 */
async function fundsTransfer(win, screen, fromAccount, toAccount, amount, currency) {
    reporter.logStep("KEYWORD: Funds Transfer", `From: ${fromAccount} To: ${toAccount} Amt: ${amount}`);
    await waitForScreen(win, "FUNDS_TRANSFER_INPUT");
    await typeInField(win, "FUNDS_TRANSFER_INPUT", "fromAccount", fromAccount);
    await typeInField(win, "FUNDS_TRANSFER_INPUT", "toAccount",   toAccount);
    await typeInField(win, "FUNDS_TRANSFER_INPUT", "amount",      amount);
    await typeInField(win, "FUNDS_TRANSFER_INPUT", "currency",    currency);
    await sendKey(screen, "Enter");
    await screen.sync(settings.terminal.screenTimeout);
    await captureScreen(screen, "Funds Transfer confirmation");
    const confirmationNumber = await readField(win, "FUNDS_TRANSFER_CONFIRM", "confirmationNumber");
    return confirmationNumber;
}

/**
 * KEYWORD: Sign off from mainframe
 * @param {WindowTO} win
 * @param {ScreenTO} screen
 */
async function signOff(win, screen) {
    reporter.logStep("KEYWORD: Sign Off");
    const menuDef = screens["MAIN_MENU"];
    await waitForScreen(win, "MAIN_MENU");
    await typeInField(win, "MAIN_MENU", "option", menuDef.menuOptions.signOff);
    await sendKey(screen, "Enter");
    reporter.log("Signed off successfully");
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  Private Helpers
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function _getScreenDef(screenName) {
    const def = screens[screenName];
    if (!def) throw new Error(`Screen definition not found: "${screenName}"`);
    return def;
}

function _getFieldDef(screenName, fieldName) {
    const screenDef = _getScreenDef(screenName);
    const fieldDef  = screenDef.fields && screenDef.fields[fieldName];
    if (!fieldDef) throw new Error(`Field "${fieldName}" not found on screen "${screenName}"`);
    return fieldDef;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  Exports
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
module.exports = {
    getTeWindow,
    waitForScreen,
    getScreenText,
    sendKey,
    typeInField,
    typeSecure,
    readField,
    captureScreen,
    // Business-level keywords
    login,
    selectMenuOption,
    accountInquiry,
    fundsTransfer,
    signOff
};
