/**
 * Driver / Runner – Central Execution Controller
 * Mirrors the Driver/Runner (ExecutionEngine) from the Jarvis framework.
 *
 * Responsibilities:
 *   - Initialize / teardown LeanFT SDK
 *   - Locate the running terminal emulator window (via HLLAPI)
 *   - Provide a shared window handle to all test specs
 *   - Apply execution settings (timeouts, screenshots on failure)
 *
 * HOW IT WORKS:
 *   LeanFT does NOT open a TN3270 connection itself. It finds and controls
 *   an already-running terminal emulator (IBM PCOMM, Attachmate Reflection,
 *   Micro Focus Rumba, etc.) via HLLAPI.
 *
 *   BEFORE running tests:
 *     1. Open your terminal emulator and connect it to the mainframe
 *     2. Note the session short name (e.g. "A" in IBM PCOMM)
 *     3. Set TE_SHORT_NAME env var if not "A"
 *     4. Start the LeanFT Agent
 *     5. Run: npm test
 *
 * Usage (in a spec file):
 *   const runner = require("../driver/runner");
 *   beforeAll(runner.setup);
 *   afterAll(runner.teardown);
 *   it("...", async () => { const win = runner.getWindow(); });
 */

"use strict";

const LFT      = require("leanft");
const settings = require("../config/settings");
const terminal = require("../libraries/terminalHelper");
const reporter = require("../libraries/reportHelper");

let _window = null;

/**
 * Initialize LeanFT and locate the terminal emulator window.
 * Bind to Jasmine beforeAll.
 */
async function setup() {
    await LFT.init({
        host: settings.agent.host,
        port: settings.agent.port
    });

    reporter.log("LeanFT SDK initialized");
    reporter.log(`Environment: ${settings.environment}`);
    reporter.log(`Looking for TE session shortName: "${settings.terminal.shortName}"`);

    // Find the already-running terminal emulator window
    _window = await terminal.getTeWindow();
}

/**
 * Cleanup LeanFT SDK.
 * Bind to Jasmine afterAll.
 */
async function teardown() {
    try {
        await LFT.cleanup();
        reporter.log("LeanFT SDK cleaned up");
    } catch (e) {
        reporter.log(`Teardown warning: ${e.message}`);
    }
}

/**
 * Hook to run before each test.
 */
async function beforeEachTest() {
    await LFT.beforeTest();
}

/**
 * Hook to run after each test.
 */
async function afterEachTest() {
    await LFT.afterTest();
}

/**
 * Returns the active TE Window for use in test steps.
 * @returns {WindowTO}
 */
function getWindow() {
    if (!_window) {
        throw new Error("No TE window found. Ensure the terminal emulator is running and runner.setup() completed.");
    }
    return _window;
}

module.exports = {
    setup,
    teardown,
    beforeEachTest,
    afterEachTest,
    getWindow
};
