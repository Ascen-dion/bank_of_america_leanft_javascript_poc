/**
 * Report Helper Library
 * Wraps the LeanFT Reporting SDK (leanft.report) to provide
 * structured, step-level logging aligned with the Jarvis E2E Report layer.
 *
 * Usage:
 *   const reporter = require("../libraries/reportHelper");
 *   reporter.logStep("Login to mainframe", "PASS");
 *   reporter.attachSnapshot(image, "Login screen");
 */

"use strict";

const LFT      = require("leanft");
const Report   = require("leanft.report");
const settings = require("../config/settings");

/**
 * Log a general informational message to the LeanFT report.
 * @param {string} message
 * @param {string} [detail]
 */
function log(message, detail) {
    const text = detail ? `${message} | ${detail}` : message;
    Report.log(Report.Status.Info, text);
    console.log(`[INFO]  ${text}`);
}

/**
 * Log a test step with pass/fail status to the LeanFT report.
 * @param {string} stepName
 * @param {"PASS"|"FAIL"|"WARNING"|"INFO"} [status]
 * @param {string} [detail]
 */
function logStep(stepName, status, detail) {
    const lftStatus = _mapStatus(status || "INFO");
    const text = detail ? `${stepName} | ${detail}` : stepName;
    Report.logEvent(lftStatus, stepName, text);
    console.log(`[${(status || "INFO").padEnd(7)}]  ${text}`);
}

/**
 * Attach a screenshot image to the current report step.
 * @param {object} imageObj  – snapshot object returned by LeanFT
 * @param {string} description
 */
function attachSnapshot(imageObj, description) {
    try {
        Report.logSnapshot(description, imageObj);
        console.log(`[SNAP]   Attached screenshot: ${description}`);
    } catch (e) {
        console.warn(`[WARN]   Could not attach snapshot: ${e.message}`);
    }
}

/**
 * Start a named report section (maps to a test case block).
 * @param {string} testCaseId
 * @param {string} description
 */
function startTestCase(testCaseId, description) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`  TEST CASE: ${testCaseId} – ${description}`);
    console.log(`${"=".repeat(60)}`);
    Report.logEvent(Report.Status.Info, `START: ${testCaseId}`, description);
}

/**
 * End a named report section.
 * @param {string} testCaseId
 * @param {"PASS"|"FAIL"} result
 */
function endTestCase(testCaseId, result) {
    const status = result === "FAIL" ? Report.Status.Failed : Report.Status.Passed;
    Report.logEvent(status, `END: ${testCaseId}`, `Result: ${result}`);
    console.log(`  RESULT: ${result}`);
    console.log(`${"=".repeat(60)}\n`);
}

// ─────────────────────────────────────────────
//  Private Helpers
// ─────────────────────────────────────────────

function _mapStatus(status) {
    switch (status.toUpperCase()) {
        case "PASS":    return Report.Status.Passed;
        case "FAIL":    return Report.Status.Failed;
        case "WARNING": return Report.Status.Warning;
        default:        return Report.Status.Info;
    }
}

module.exports = {
    log,
    logStep,
    attachSnapshot,
    startTestCase,
    endTestCase
};
