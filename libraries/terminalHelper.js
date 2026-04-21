/**
 * Terminal Helper Library
 * Mirrors the reusable Action Layer (.qfl keyword libraries) from Jarvis.
 *
 * Wraps LeanFT Terminal Emulator (leanft.sdk.te) SDK calls into
 * named, reusable keyword functions so test scripts stay readable
 * and technology-agnostic.
 *
 * All functions return Promises – use with async/await in test specs.
 */

"use strict";

const LFT      = require("leanft");
const TE       = require("leanft.sdk.te");
const settings = require("../config/settings");
const screens  = require("../objectrepository/screens");
const reporter = require("./reportHelper");

// ─────────────────────────────────────────────
//  Session Management
// ─────────────────────────────────────────────

/**
 * Open a new Terminal Emulator session to the mainframe host.
 * @returns {Promise<TeSession>}
 */
async function openSession() {
    reporter.log("Opening TE session", `Host: ${settings.terminal.host}:${settings.terminal.port}`);
    const session = await TE.TeSession.open({
        host: settings.terminal.host,
        port: settings.terminal.port,
        sessionType: settings.terminal.sessionType,
        codePage: settings.terminal.codePage,
        timeout: settings.terminal.connectionTimeout
    });
    reporter.log("TE session opened successfully");
    return session;
}

/**
 * Close an active Terminal Emulator session.
 * @param {TeSession} session
 */
async function closeSession(session) {
    if (session) {
        reporter.log("Closing TE session");
        await session.close();
    }
}

// ─────────────────────────────────────────────
//  Screen Navigation
// ─────────────────────────────────────────────

/**
 * Wait for and return a named screen from the Object Repository.
 * Throws if the screen does not appear within screenTimeout.
 *
 * @param {string} screenName  – key from objectrepository/screens.js
 * @returns {Promise<TeScreen>}
 */
async function waitForScreen(screenName) {
    const screenDef = _getScreenDef(screenName);
    reporter.log(`Waiting for screen: ${screenName}`);

    const screen = await TE.TeScreen.find({
        text: screenDef.identifiers,
        timeout: settings.terminal.screenTimeout
    });

    reporter.logStep(`Screen verified: ${screenName}`, "PASS");
    return screen;
}

/**
 * Send a named key (Enter, PF3, Clear, etc.) on the current screen.
 * @param {TeScreen} screen
 * @param {string}   keyName  – logical key name (e.g. "PF3", "Enter", "Clear")
 */
async function sendKey(screen, keyName) {
    reporter.log(`Sending key: ${keyName}`);
    const keyMap = {
        "Enter": TE.TeKey.Enter,
        "Clear": TE.TeKey.Clear,
        "PF1":   TE.TeKey.F1,
        "PF2":   TE.TeKey.F2,
        "PF3":   TE.TeKey.F3,
        "PF4":   TE.TeKey.F4,
        "PF5":   TE.TeKey.F5,
        "PF6":   TE.TeKey.F6,
        "PF7":   TE.TeKey.F7,
        "PF8":   TE.TeKey.F8,
        "PF9":   TE.TeKey.F9,
        "PF10":  TE.TeKey.F10,
        "PF11":  TE.TeKey.F11,
        "PF12":  TE.TeKey.F12
    };
    const teKey = keyMap[keyName];
    if (!teKey) throw new Error(`Unknown key: ${keyName}`);
    await screen.sendKey(teKey);
}

// ─────────────────────────────────────────────
//  Field Operations
// ─────────────────────────────────────────────

/**
 * Type a value into a named field on a screen.
 * @param {TeScreen} screen
 * @param {string}   screenName  – key from screens.js
 * @param {string}   fieldName   – field key within that screen definition
 * @param {string}   value
 */
async function typeInField(screen, screenName, fieldName, value) {
    const fieldDef = _getFieldDef(screenName, fieldName);
    reporter.log(`Typing into field [${fieldName}]`, `Value: "${value}"`);

    const field = await screen.getField({ label: fieldDef.label });
    await field.setValue(value);
}

/**
 * Read the text value of a named field on a screen.
 * @param {TeScreen} screen
 * @param {string}   screenName
 * @param {string}   fieldName
 * @returns {Promise<string>}
 */
async function readField(screen, screenName, fieldName) {
    const fieldDef = _getFieldDef(screenName, fieldName);
    const field = await screen.getField({ label: fieldDef.label });
    const value = await field.getValue();
    reporter.log(`Read field [${fieldName}]`, `Value: "${value}"`);
    return value ? value.trim() : "";
}

/**
 * Clear a field then type a new value.
 */
async function clearAndType(screen, screenName, fieldName, value) {
    const fieldDef = _getFieldDef(screenName, fieldName);
    const field = await screen.getField({ label: fieldDef.label });
    await field.clear();
    await field.setValue(value);
    reporter.log(`Cleared and typed into [${fieldName}]`, `Value: "${value}"`);
}

// ─────────────────────────────────────────────
//  Screenshot
// ─────────────────────────────────────────────

/**
 * Capture a screenshot of the current screen and attach to LeanFT report.
 * @param {TeScreen} screen
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

// ─────────────────────────────────────────────
//  Composite Keyword Actions (Business-level)
//  These map to Jarvis high-level keywords
// ─────────────────────────────────────────────

/**
 * KEYWORD: Login to mainframe application
 * @param {TeSession} session
 * @param {string}    userId
 * @param {string}    password
 * @returns {Promise<TeScreen>} the screen after login
 */
async function login(session, userId, password) {
    reporter.logStep("KEYWORD: Login", `User: ${userId}`);
    const screen = await waitForScreen("LOGON_SCREEN");
    await typeInField(screen, "LOGON_SCREEN", "userId", userId);
    await typeInField(screen, "LOGON_SCREEN", "password", password);
    await sendKey(screen, "Enter");
    return screen;
}

/**
 * KEYWORD: Navigate to a Main Menu option
 * @param {TeScreen} screen
 * @param {string}   optionCode  – e.g. "01" for Account Inquiry
 */
async function selectMenuOption(screen, optionCode) {
    reporter.logStep("KEYWORD: Select Menu Option", `Option: ${optionCode}`);
    await waitForScreen("MAIN_MENU");
    await typeInField(screen, "MAIN_MENU", "option", optionCode);
    await sendKey(screen, "Enter");
}

/**
 * KEYWORD: Perform Account Inquiry
 * @param {TeScreen} screen
 * @param {string}   accountNumber
 * @param {string}   accountType
 * @returns {Promise<{balance: string, status: string}>}
 */
async function accountInquiry(screen, accountNumber, accountType) {
    reporter.logStep("KEYWORD: Account Inquiry", `Account: ${accountNumber}`);
    await waitForScreen("ACCOUNT_INQUIRY");
    await typeInField(screen, "ACCOUNT_INQUIRY", "accountNumber", accountNumber);
    await typeInField(screen, "ACCOUNT_INQUIRY", "accountType", accountType);
    await sendKey(screen, "Enter");
    await captureScreen(screen, `Account Inquiry result for ${accountNumber}`);
    const balance = await readField(screen, "ACCOUNT_INQUIRY", "balance");
    const status  = await readField(screen, "ACCOUNT_INQUIRY", "status");
    return { balance, status };
}

/**
 * KEYWORD: Perform Funds Transfer
 * @param {TeScreen} screen
 * @param {string}   fromAccount
 * @param {string}   toAccount
 * @param {string}   amount
 * @param {string}   currency
 * @returns {Promise<string>} confirmation number
 */
async function fundsTransfer(screen, fromAccount, toAccount, amount, currency) {
    reporter.logStep("KEYWORD: Funds Transfer", `From: ${fromAccount} To: ${toAccount} Amt: ${amount}`);
    await waitForScreen("FUNDS_TRANSFER_INPUT");
    await typeInField(screen, "FUNDS_TRANSFER_INPUT", "fromAccount", fromAccount);
    await typeInField(screen, "FUNDS_TRANSFER_INPUT", "toAccount",   toAccount);
    await typeInField(screen, "FUNDS_TRANSFER_INPUT", "amount",      amount);
    await typeInField(screen, "FUNDS_TRANSFER_INPUT", "currency",    currency);
    await sendKey(screen, "Enter");
    await captureScreen(screen, "Funds Transfer confirmation");
    const confirmationNumber = await readField(screen, "FUNDS_TRANSFER_CONFIRM", "confirmationNumber");
    return confirmationNumber;
}

/**
 * KEYWORD: Sign off from mainframe
 * @param {TeScreen} screen
 */
async function signOff(screen) {
    reporter.logStep("KEYWORD: Sign Off");
    const menuScreen = await waitForScreen("MAIN_MENU");
    const menuDef = screens["MAIN_MENU"];
    await typeInField(menuScreen, "MAIN_MENU", "option", menuDef.menuOptions.signOff);
    await sendKey(menuScreen, "Enter");
    reporter.log("Signed off successfully");
}

// ─────────────────────────────────────────────
//  Private Helpers
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
//  Exports
// ─────────────────────────────────────────────
module.exports = {
    openSession,
    closeSession,
    waitForScreen,
    sendKey,
    typeInField,
    readField,
    clearAndType,
    captureScreen,
    // Business-level keywords
    login,
    selectMenuOption,
    accountInquiry,
    fundsTransfer,
    signOff
};
