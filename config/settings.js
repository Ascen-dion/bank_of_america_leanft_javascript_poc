/**
 * External Configuration Settings
 * Mirrors the ConfigTemplates layer from the Jarvis framework.
 * All environment-specific values are externalized here.
 */

"use strict";

const settings = {
    // LeanFT Agent connection
    agent: {
        host: "localhost",
        port: 54345
    },

    // Mainframe Terminal Emulator host connection
    terminal: {
        host: process.env.TE_HOST || "mainframe.bankofamerica.internal",
        port: parseInt(process.env.TE_PORT) || 23,
        sessionType: "TN3270",            // 3270 protocol for IBM mainframe
        codePage: "037",                  // EBCDIC US English
        connectionTimeout: 30000,         // ms
        screenTimeout: 15000              // ms – max wait for screen to stabilize
    },

    // Test execution settings
    execution: {
        defaultTimeout: 30000,            // Jasmine default timeout (ms)
        screenshotOnFailure: true,
        screenshotPath: "./results/screenshots",
        retryCount: 0                     // retries per failed step
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
