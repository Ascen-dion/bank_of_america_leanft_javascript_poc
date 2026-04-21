"""
Test Data Manager
Mirrors the Jarvis test data layer (Excel spreadsheets → JSON).

Loads ftd_testdata.json (or any JSON file with the same sheet structure)
and provides a clean get(sheet, test_case_id) API to tests.

Migration note:
  Jarvis used Excel files (.xlsx) as the test data source.
  This layer reads JSON by default, but can be extended to read .xlsx
  via openpyxl — the structure stays identical so tests don't change.
"""

import json
import os
from functools import lru_cache


_DATA_DIR = os.path.join(os.path.dirname(__file__))
_DEFAULT_FILE = os.path.join(_DATA_DIR, "ftd_testdata.json")


@lru_cache(maxsize=None)
def _load_file(file_path: str) -> dict:
    """Load and cache a JSON test data file."""
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


def get(sheet_name: str, test_case_id: str, file_path: str = _DEFAULT_FILE) -> dict:
    """
    Retrieve a single test case row from the given sheet.

    Args:
        sheet_name:   Top-level key in the JSON (e.g. "FTD_Login")
        test_case_id: Value of the "testCaseId" field (e.g. "TC001")
        file_path:    Path to the JSON file (defaults to ftd_testdata.json)

    Returns:
        dict with all fields for that test case

    Raises:
        KeyError  if the sheet or test case ID is not found
    """
    data = _load_file(file_path)

    if sheet_name not in data:
        available = list(data.keys())
        raise KeyError(
            f'Sheet "{sheet_name}" not found in {os.path.basename(file_path)}. '
            f'Available sheets: {available}'
        )

    rows = data[sheet_name]
    for row in rows:
        if row.get("testCaseId") == test_case_id:
            return row

    available_ids = [r.get("testCaseId") for r in rows]
    raise KeyError(
        f'Test case "{test_case_id}" not found in sheet "{sheet_name}". '
        f'Available IDs: {available_ids}'
    )


def get_all(sheet_name: str, file_path: str = _DEFAULT_FILE) -> list:
    """Return all rows from a sheet."""
    data = _load_file(file_path)
    if sheet_name not in data:
        raise KeyError(f'Sheet "{sheet_name}" not found.')
    return data[sheet_name]
