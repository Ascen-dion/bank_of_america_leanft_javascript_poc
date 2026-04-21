package tests;

import com.hp.lft.report.Status;
import com.hp.lft.sdk.Keys; // THE CORRECT IMPORT
import com.hp.lft.sdk.te.Screen;
import driver.BaseTest;
import libraries.ReportHelper;
import libraries.TerminalHelper;
import objectrepository.Screens;
import org.testng.Assert;
import org.testng.annotations.Test;
import java.util.Map;

public class FtdMainframeTest extends BaseTest {

    @Test(dataProvider = "ValidLoginData", dataProviderClass = data.TestDataProvider.class)
    public void TC001_ValidLogin(String tcId, String desc, String userId, String pwd, String expScreen)
            throws Exception {
        ReportHelper.log("STARTING TEST: " + tcId + " - " + desc);
        Screen menuScreen = TerminalHelper.login(teWindow, userId, pwd);

        String screenText = menuScreen.getText();
        Assert.assertTrue(screenText.contains(expScreen), "Main Menu not displayed.");
        ReportHelper.logStep("Validation", "Main Menu displayed after login", Status.Passed);
    }

    @Test(dataProvider = "InvalidLoginData", dataProviderClass = data.TestDataProvider.class)
    public void TC002_InvalidLogin(String tcId, String desc, String userId, String pwd, String expError)
            throws Exception {
        ReportHelper.log("STARTING TEST: " + tcId + " - " + desc);
        TerminalHelper.login(teWindow, userId, pwd);

        String errorText = TerminalHelper.readField(
                teWindow.describe(Screen.class, Screens.ERROR_SCREEN),
                Screens.ERROR_MSG);

        Assert.assertTrue(errorText.toUpperCase().contains(expError), "Error message missing.");
        ReportHelper.logStep("Validation", "Error message verified", Status.Passed);
    }

    @Test(dataProvider = "AccountInquiryData", dataProviderClass = data.TestDataProvider.class)
    public void TC003_AccountInquiry(String tcId, String desc, String user, String pwd, String accNum, String type,
            String expBal, String expStatus) throws Exception {
        ReportHelper.log("STARTING TEST: " + tcId + " - " + desc);
        Screen menuScreen = TerminalHelper.login(teWindow, user, pwd);

        TerminalHelper.selectMenuOption(teWindow, menuScreen, "01");
        Map<String, String> result = TerminalHelper.accountInquiry(teWindow, accNum, type);

        Assert.assertEquals(result.get("balance"), expBal, "Balance mismatch.");
        Assert.assertEquals(result.get("status"), expStatus, "Status mismatch.");

        // FIX: Standard sendKeys with Keys.F3
        menuScreen.sendTEKeys(Keys.F3);
    }

    @Test(dataProvider = "FundsTransferData", dataProviderClass = data.TestDataProvider.class)
    public void TC005_FundsTransfer(String tcId, String desc, String user, String pwd, String from, String to,
            String amt, String curr, String expMsg) throws Exception {
        ReportHelper.log("STARTING TEST: " + tcId + " - " + desc);
        Screen menuScreen = TerminalHelper.login(teWindow, user, pwd);

        TerminalHelper.selectMenuOption(teWindow, menuScreen, "02");
        String confNum = TerminalHelper.fundsTransfer(teWindow, from, to, amt, curr);

        String actualMessage = TerminalHelper.readField(
                teWindow.describe(Screen.class, Screens.FUNDS_TRANSFER_CONFIRM),
                Screens.MESSAGE);

        Assert.assertTrue(actualMessage.toUpperCase().contains(expMsg), "Confirmation failed.");
        Assert.assertNotNull(confNum, "Confirmation number is null.");

        TerminalHelper.signOff(teWindow);
    }
}