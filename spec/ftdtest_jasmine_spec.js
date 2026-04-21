/**
 * FTD Test Suite – Bank of America Mainframe Automation POC
 * Framework: LeanFT (OpenText Functional Testing for Developers) + Jasmine
 * Technology: JavaScript / Node.js
 * Target:     IBM Mainframe via TN3270 Terminal Emulator (leanft.sdk.te)
 *
 * Architecture mirrors the Jarvis framework layers:
 *   Driver/Runner   → driver/runner.js
 *   Action Layer    → libraries/terminalHelper.js
 *   Object Repo     → objectrepository/screens.js
 *   Test Data       → testdata/ftd_testdata.json
 *   Configuration   → config/settings.js
 *   Reporting       → libraries/reportHelper.js  (LeanFT report)
 */

"use strict";

const expect   = require("leanft/expect");
const settings = require("../config/settings");
const runner   = require("../driver/runner");
const terminal = require("../libraries/terminalHelper");
const reporter = require("../libraries/reportHelper");
const td       = require("../testdata/testDataManager");
const screens  = require("../objectrepository/screens");

// ─────────────────────────────────────────────
//  Suite: FTD Mainframe Automation
// ─────────────────────────────────────────────
describe("FTD – BOA Mainframe Automation POC", function () {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = settings.execution.defaultTimeout;

    // ── SDK & Session Lifecycle ──────────────────
    beforeAll(async function () {
        await runner.setup();
    });

    beforeEach(async function () {
        await runner.beforeEachTest();
    });

    afterEach(async function () {
        await runner.afterEachTest();
    });

    afterAll(async function () {
        await runner.teardown();
    });

    // ────────────────────────────────────────────
    //  TC001 – Valid Login
    // ────────────────────────────────────────────
    it("TC001 – Should successfully login with valid credentials", async function () {
        const data    = td.get("FTD_Login", "TC001");
        const session = runner.getSession();

        reporter.startTestCase(data.testCaseId, data.description);

        await terminal.login(session, data.userId, data.password);

        // Verify Main Menu is displayed after successful login
        const mainMenuScreen = await terminal.waitForScreen("MAIN_MENU");
        const screenText = await mainMenuScreen.getText();

        expect(screenText).toContain(data.expectedScreen);
        reporter.logStep("Main Menu displayed after login", "PASS");

        reporter.endTestCase(data.testCaseId, "PASS");
    });

    // ────────────────────────────────────────────
    //  TC002 – Invalid Login
    // ────────────────────────────────────────────
    it("TC002 – Should display error message for invalid credentials", async function () {
        const data    = td.get("FTD_Login", "TC002");
        const session = runner.getSession();

        reporter.startTestCase(data.testCaseId, data.description);

        await terminal.login(session, data.userId, data.password);

        // Verify error screen is shown
        const errorScreen = await terminal.waitForScreen("ERROR_SCREEN");
        const errorText   = await terminal.readField(errorScreen, "ERROR_SCREEN", "errorMessage");

        expect(errorText.toUpperCase()).toContain("INVALID");
        reporter.logStep("Error message verified for invalid login", "PASS");

        reporter.endTestCase(data.testCaseId, "PASS");
    });

    // ────────────────────────────────────────────
    //  TC003 – Account Inquiry (Checking)
    // ────────────────────────────────────────────
    it("TC003 – Should retrieve correct balance for checking account", async function () {
        const data       = td.get("FTD_AccountInquiry", "TC003");
        const loginData  = td.get("FTD_Login", "TC001");
        const session    = runner.getSession();

        reporter.startTestCase(data.testCaseId, data.description);

        // Login
        await terminal.login(session, loginData.userId, loginData.password);
        const menuScreen = await terminal.waitForScreen("MAIN_MENU");

        // Navigate to Account Inquiry
        await terminal.selectMenuOption(
            menuScreen,
            screens.MAIN_MENU.menuOptions.accountInquiry
        );

        // Perform inquiry and capture results
        const result = await terminal.accountInquiry(
            menuScreen,
            data.accountNumber,
            data.accountType
        );

        expect(result.balance).toBe(data.expectedBalance);
        expect(result.status).toBe(data.expectedStatus);

        reporter.logStep(
            `Balance verified: ${result.balance} | Status: ${result.status}`,
            "PASS"
        );

        // Return to menu
        await terminal.sendKey(menuScreen, "PF3");

        reporter.endTestCase(data.testCaseId, "PASS");
    });

    // ────────────────────────────────────────────
    //  TC005 – Funds Transfer
    // ────────────────────────────────────────────
    it("TC005 – Should successfully transfer funds between accounts", async function () {
        const data      = td.get("FTD_FundsTransfer", "TC005");
        const loginData = td.get("FTD_Login", "TC001");
        const session   = runner.getSession();

        reporter.startTestCase(data.testCaseId, data.description);

        // Login
        await terminal.login(session, loginData.userId, loginData.password);
        const menuScreen = await terminal.waitForScreen("MAIN_MENU");

        // Navigate to Funds Transfer
        await terminal.selectMenuOption(
            menuScreen,
            screens.MAIN_MENU.menuOptions.fundsTransfer
        );

        // Execute transfer
        const confirmationNumber = await terminal.fundsTransfer(
            menuScreen,
            data.fromAccount,
            data.toAccount,
            data.amount,
            data.currency
        );

        // Verify confirmation screen message
        const confirmScreen = await terminal.waitForScreen("FUNDS_TRANSFER_CONFIRM");
        const message       = await terminal.readField(confirmScreen, "FUNDS_TRANSFER_CONFIRM", "message");

        expect(message.toUpperCase()).toContain(data.expectedConfirmation);
        expect(confirmationNumber).toBeTruthy();

        reporter.logStep(`Transfer confirmed. Reference: ${confirmationNumber}`, "PASS");

        // Sign off
        await terminal.signOff(menuScreen);

        reporter.endTestCase(data.testCaseId, "PASS");
    });

});