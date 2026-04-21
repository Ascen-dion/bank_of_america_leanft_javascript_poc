package data;

import org.testng.annotations.DataProvider;

/**
 * Replaces testDataManager.js. 
 * In production, this reads directly from BofA Excel sheets via Apache POI.
 * Here, we mock the 2D array representation of that Excel data.
 */
public class TestDataProvider {

    @DataProvider(name = "ValidLoginData")
    public static Object[][] getValidLoginData() {
        return new Object[][] {
            { "TC001", "Valid login to mainframe", "BOAUSER1", "P@ssword1", "MAIN MENU" }
        };
    }

    @DataProvider(name = "InvalidLoginData")
    public static Object[][] getInvalidLoginData() {
        return new Object[][] {
            { "TC002", "Invalid login – wrong password", "BOAUSER1", "WRONGPWD", "INVALID" }
        };
    }

    @DataProvider(name = "AccountInquiryData")
    public static Object[][] getAccountInquiryData() {
        return new Object[][] {
            { "TC003", "Account inquiry for checking", "BOAUSER1", "P@ssword1", "1234567890", "CHK", "5000.00", "ACTIVE" }
        };
    }

    @DataProvider(name = "FundsTransferData")
    public static Object[][] getFundsTransferData() {
        return new Object[][] {
            { "TC005", "Transfer funds between accounts", "BOAUSER1", "P@ssword1", "1234567890", "0987654321", "500.00", "USD", "SUCCESSFUL" }
        };
    }
}
