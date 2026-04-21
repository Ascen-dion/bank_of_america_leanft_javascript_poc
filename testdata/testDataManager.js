/**
 * Test Data Manager
 * Mirrors the Testdata / Excel layer from Jarvis.
 *
 * For the POC, test data is stored in JSON files.
 * In a production framework, replace loadFromJson() with an xlsx reader
 * (e.g. the 'xlsx' npm package) to keep full Excel compatibility with Jarvis.
 *
 * Usage:
 *   const td = require("../testdata/testDataManager");
 *   const data = td.get("FTD_Login", "TC001");
 */

"use strict";

const fs   = require("fs");
const path = require("path");

class TestDataManager {
    constructor() {
        this._cache = {};
    }

    /**
     * Load a JSON test-data file into memory.
     * @param {string} dataFile  – filename without extension, e.g. "ftd_testdata"
     */
    load(dataFile) {
        if (this._cache[dataFile]) return this._cache[dataFile];
        const filePath = path.join(__dirname, `${dataFile}.json`);
        if (!fs.existsSync(filePath)) {
            throw new Error(`Test data file not found: ${filePath}`);
        }
        this._cache[dataFile] = JSON.parse(fs.readFileSync(filePath, "utf8"));
        return this._cache[dataFile];
    }

    /**
     * Retrieve a specific test case row by sheetName and testCaseId.
     * @param {string} sheetName   – maps to the top-level key in the JSON
     * @param {string} testCaseId  – the "testCaseId" value within that sheet
     */
    get(sheetName, testCaseId) {
        const dataFile = "ftd_testdata";
        const data = this.load(dataFile);
        if (!data[sheetName]) {
            throw new Error(`Sheet "${sheetName}" not found in test data`);
        }
        const row = data[sheetName].find(r => r.testCaseId === testCaseId);
        if (!row) {
            throw new Error(`TestCase "${testCaseId}" not found in sheet "${sheetName}"`);
        }
        return row;
    }
}

module.exports = new TestDataManager();
