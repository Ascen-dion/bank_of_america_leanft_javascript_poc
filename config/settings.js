/**
 * External Configuration Settings
 * Mirrors the ConfigTemplates layer from the Jarvis framework.
 * All environment-specific values are externalized here.
 *
 * HOW LeanFT TE WORKS:
 *   LeanFT does NOT open a direct TN3270 TCP connection itself.
 *   It controls an already-running terminal emulator application
 *   (IBM PCOMM, Attachmate Reflection, Micro Focus Rumba, etc.)
 *   via HLLAPI – the standard IBM mainframe automation interface.
 *
 * PREREQUISITE:
 *   1. Install a HLLAPI-capable terminal emulator (e.g. IBM PCOMM)
 *   2. Connect it to the mainframe (TN3270 host/port configured in the emulator)
 *   3. Start the LeanFT Agent
 *   4. Run the tests – LeanFT will find and control the emulator window
 */

"use strict";

const settings = {
    // LeanFT Agent connection
    agent: {
        host: "localhost",
        port: 54345
    },

    // Terminal Emulator identification
    // LeanFT finds the running TE window by its shortName (session name in the emulator)
    terminal: {
        // Short name / session name as configured in the terminal emulator (e.g. PCOMM session "A")
        shortName: process.env.TE_SHORT_NAME || "A",
        // Timeout (ms) for waitForText / screen stabilisation
        screenTimeout: 15000
    },

    // Test execution settings
    execution: {
        defaultTimeout: 60000,            // Jasmine default timeout (ms)
        screenshotOnFailure: true,
        screenshotPath: "./results/screenshots"
    },

    // Reporting
    reporting: {
        outputPath: "./results",
        reportName: "BOA_FTD_TestReport",
        openReportAfterRun: false
    },

    // Environment tag – driven by CI or local
    environment: process.env.TEST_ENV || "SIT"
};

module.exports = settings;
