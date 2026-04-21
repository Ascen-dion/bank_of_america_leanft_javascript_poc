/**
 * Driver / Runner – Central Execution Controller
 * Mirrors the Driver/Runner (ExecutionEngine) from the Jarvis framework.
 *
 * Responsibilities:
 *   - Initialize / teardown LeanFT SDK
 *   - Manage the TE session lifecycle
 *   - Provide a shared session handle to all test specs
 *   - Apply execution settings (timeouts, screenshots on failure)
 *
 * Jasmine test specs use this runner via beforeAll / afterAll hooks
 * rather than managing SDK lifecycle themselves.
 *
 * Usage (in a spec file):
 *   const runner = require("../driver/runner");
 *   beforeAll(runner.setup);
 *   afterAll(runner.teardown);
 *   it("...", async () => { const session = runner.getSession(); });
 */

"use strict";

const LFT      = require("leanft");
const settings = require("../config/settings");
const terminal = require("../libraries/terminalHelper");
const reporter = require("../libraries/reportHelper");

let _session = null;

/**
 * Initialize LeanFT and open a mainframe TE session.
 * Bind to Jasmine beforeAll.
 */
async function setup() {
    // Init LeanFT SDK
    await LFT.init({
        host: settings.agent.host,
        port: settings.agent.port
    });

    reporter.log("LeanFT SDK initialized");
    reporter.log(`Environment: ${settings.environment}`);

    // Open mainframe session
    _session = await terminal.openSession();
}

/**
 * Sign off, close session, and cleanup LeanFT.
 * Bind to Jasmine afterAll.
 */
async function teardown() {
    try {
        if (_session) {
            await terminal.closeSession(_session);
        }
    } catch (e) {
        reporter.log(`Teardown warning: ${e.message}`);
    } finally {
        await LFT.cleanup();
        reporter.log("LeanFT SDK cleaned up");
    }
}

/**
 * Hook to run before each test.
 * Captures screenshot on failure if configured.
 */
async function beforeEachTest() {
    await LFT.beforeTest();
}

/**
 * Hook to run after each test.
 * Captures screenshot on failure if configured.
 */
async function afterEachTest() {
    await LFT.afterTest();
}

/**
 * Returns the active TE session for use in test steps.
 * @returns {TeSession}
 */
function getSession() {
    if (!_session) {
        throw new Error("No active TE session. Ensure runner.setup() completed successfully.");
    }
    return _session;
}

module.exports = {
    setup,
    teardown,
    beforeEachTest,
    afterEachTest,
    getSession
};
