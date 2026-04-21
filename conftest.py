"""
pytest conftest.py — Session & Test Lifecycle Fixtures
Mirrors the beforeAll / afterAll / beforeEach / afterEach hooks from Jasmine/Jarvis.

All fixtures here are automatically discovered by pytest — no imports needed in test files.
"""

import pytest
from driver import runner
from libraries import report_helper as reporter


# ─── Session-scoped: runs ONCE for the whole test session ─────────────────────

@pytest.fixture(scope="session", autouse=True)
def mainframe_session():
    """
    Open the TN3270 session before any tests run.
    Close it and write the HTML report after all tests finish.
    Mirrors Jarvis ExecutionEngine setup/teardown.
    """
    runner.session_setup()
    yield
    runner.session_teardown()


@pytest.fixture(scope="session")
def em():
    """Provide the shared Emulator instance to all tests that need it."""
    return runner.get_emulator()


# ─── Function-scoped: runs before/after EACH test ─────────────────────────────

@pytest.fixture(autouse=True)
def test_lifecycle(request):
    """
    Log test start/end and capture screen on failure.
    Mirrors Jarvis beforeEach / afterEach hooks.
    """
    test_name = request.node.name
    reporter.log(f"--- BEFORE: {test_name} ---")

    yield  # test runs here

    passed = request.node.rep_call.passed if hasattr(request.node, "rep_call") else True
    runner.after_each_test(test_name, passed)


@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """Attach the test result to the node so test_lifecycle fixture can read it."""
    outcome = yield
    rep = outcome.get_result()
    setattr(item, f"rep_{rep.when}", rep)
