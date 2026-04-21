/**
 * FTD Test Suite â€“ Bank of America Mainframe Automation POC
 * Framework: LeanFT (OpenText Functional Testing for Developers) + Jasmine
 * Technology: JavaScript / Node.js
 * Target:     IBM Mainframe via TN3270 Terminal Emulator (leanft.sdk.te / HLLAPI)
 *
 * HOW IT WORKS:
 *   LeanFT controls an ALREADY-RUNNING terminal emulator (IBM PCOMM,
 *   Attachmate Reflection, etc.) via HLLAPI â€“ the IBM standard for
 *   green screen automation. It does NOT open TN3270 sockets itself.
 *
 * BEFORE RUNNING:
 *   1. Open your terminal emulator and connect to the mainframe
 *   2. Set TE_SHORT_NAME env var to your session name (default: "A")
 *   3. Start the LeanFT Agent
 *   4. Run: npm test
 *
 * Architecture mirrors the Jarvis framework layers:
 *   Driver/Runner   â†’ driver/runner.js
 *   Action Layer    â†’ libraries/terminalHelper.js
 *   Object Repo     â†’ objectrepository/screens.js
 *   Test Data       â†’ testdata/ftd_testdata.json
 *   Configuration   â†’ config/settings.js
 *   Reporting       â†’ libraries/reportHelper.js  (LeanFT report)
 */

"use strict";

const expect   = require("leanft/expect");
const settings = require("../config/settings");
const runner   = require("../driver/runner");
const terminal = require("../libraries/terminalHelper");
const reporter = require("../libraries/reportHelper");
const td       = require("../testdata/testDataManager");
const screens  = require("../objectrepository/screens");

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  Suite: FTD Mainframe Automation
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
describe("FTD â€“ BOA Mainframe Automation POC", function () {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = settings.execution.defaultTimeout;

    // â”€â”€ SDK & Session Lifecycle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    //  TC001 â€“ Valid Login
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    it("TC001 â€“ Should successfully login with valid credentials", async function () {
        const data = td.get("FTD_Login", "TC001");
        const win  = runner.getWindow();

        reporter.startTestCase(data.testCaseId, data.description);

        await terminal.login(win, data.userId, data.password);

        // Verify Main Menu is displayed after successful login
        const screen     = await terminal.waitForScreen(win, "MAIN_MENU");
        const screenText = await terminal.getScreenText(screen);

        expect(screenText).toContain(data.expectedScreen);
        reporter.logStep("Main Menu displayed after login", "PASS");

        reporter.endTestCase(data.testCaseId, "PASS");
    });

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    //  TC002 â€“ Invalid Login
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    it("TC002 â€“ Should display error message for invalid credentials", async function () {
        const data = td.get("FTD_Login", "TC002");
        const win  = runner.getWindow();

        reporter.startTestCase(data.testCaseId, data.description);

        await terminal.login(win, data.userId, data.password);

        // Verify error screen is shown
        const screen    = await terminal.waitForScreen(win, "ERROR_SCREEN");
        const errorText = await terminal.readField(win, "ERROR_SCREEN", "errorMessage");

        expect(errorText.toUpperCase()).toContain("INVALID");
        reporter.logStep("Error message verified for invalid login", "PASS");

        reporter.endTestCase(data.testCaseId, "PASS");
    });

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    //  TC003 â€“ Account Inquiry (Checking)
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    it("TC003 â€“ Should retrieve correct balance for checking account", async function () {
        const data      = td.get("FTD_AccountInquiry", "TC003");
        const loginData = td.get("FTD_Login", "TC001");
        const win       = runner.getWindow();

        reporter.startTestCase(data.testCaseId, data.description);

        // Login
        await terminal.login(win, loginData.userId, loginData.password);
        const menuScreen = await terminal.waitForScreen(win, "MAIN_MENU");

        // Navigate to Account Inquiry
        await terminal.selectMenuOption(
            win, menuScreen,
            screens.MAIN_MENU.menuOptions.accountInquiry
        );

        // Perform inquiry and capture results
        const result = await terminal.accountInquiry(
            win, menuScreen,
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

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    //  TC005 â€“ Funds Transfer
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    it("TC005 â€“ Should successfully transfer funds between accounts", async function () {
        const data      = td.get("FTD_FundsTransfer", "TC005");
        const loginData = td.get("FTD_Login", "TC001");
        const win       = runner.getWindow();

        reporter.startTestCase(data.testCaseId, data.description);

        // Login
        await terminal.login(win, loginData.userId, loginData.password);
        const menuScreen = await terminal.waitForScreen(win, "MAIN_MENU");

        // Navigate to Funds Transfer
        await terminal.selectMenuOption(
            win, menuScreen,
            screens.MAIN_MENU.menuOptions.fundsTransfer
        );

        // Execute transfer
        const confirmationNumber = await terminal.fundsTransfer(
            win, menuScreen,
            data.fromAccount,
            data.toAccount,
            data.amount,
            data.currency
        );

        // Verify confirmation screen message
        const confirmScreen = await terminal.waitForScreen(win, "FUNDS_TRANSFER_CONFIRM");
        const message       = await terminal.readField(win, "FUNDS_TRANSFER_CONFIRM", "message");

        expect(message.toUpperCase()).toContain(data.expectedConfirmation);
        expect(confirmationNumber).toBeTruthy();

        reporter.logStep(`Transfer confirmed. Reference: ${confirmationNumber}`, "PASS");

        // Sign off
        await terminal.signOff(win, menuScreen);

        reporter.endTestCase(data.testCaseId, "PASS");
    });

});
