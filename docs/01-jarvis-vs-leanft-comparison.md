```markdown
# Framework Comparison: Jarvis vs LeanFT Java

| Jarvis (Legacy) | LeanFT Java (Modern) | Advantage |
|---|---|---|
| **Test Suite:** Excel Sheets | **Test Suite:** `testng.xml` & `@Test` | CI/CD Native execution. |
| **Test Data:** Excel Sheets | **Test Data:** TestNG `@DataProvider` | Preserves existing data, separated from logic. |
| **Execution Engine:** VBScript Runner | **Execution Engine:** Maven + TestNG | Enables parallel execution and multi-threading. |
| **Libraries:** `.qfl` VBScript | **Libraries:** `TerminalHelper.java` | Object-Oriented, reusable, and strictly typed. |
| **Object Repo:** Binary `.tsr` | **Object Repo:** `Screens.java` | Text-based, Git-friendly, compile-time validation. |
