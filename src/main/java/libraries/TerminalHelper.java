package libraries;

import com.hp.lft.report.Status;
import com.hp.lft.sdk.te.*;
import com.hp.lft.sdk.Keys; // THE CORRECT IMPORT
import config.Settings;
import objectrepository.Screens;
import java.util.HashMap;
import java.util.Map;

public class TerminalHelper {

    public static Screen waitForScreen(Window window, ScreenDescription desc, String screenName) throws Exception {
        Screen screen = window.describe(Screen.class, desc);
        screen.waitUntilExists(Settings.SCREEN_TIMEOUT_MS);
        ReportHelper.logStep("Screen Verified", screenName, Status.Passed);
        return screen;
    }

    public static void typeInField(Screen screen, FieldDescription fieldDesc, String value) throws Exception {
        Field field = screen.describe(Field.class, fieldDesc);
        field.setText(value);
    }

    public static String readField(Screen screen, FieldDescription fieldDesc) throws Exception {
        Field field = screen.describe(Field.class, fieldDesc);
        return field.getText().trim();
    }

    // --- BUSINESS KEYWORDS ---

    public static Screen login(Window window, String userId, String password) throws Exception {
        ReportHelper.logStep("KEYWORD: Login", "User: " + userId, Status.Passed);
        Screen logonScreen = waitForScreen(window, Screens.LOGON_SCREEN, "Logon Screen");
        typeInField(logonScreen, Screens.USER_ID, userId);
        typeInField(logonScreen, Screens.PASSWORD, password);

        // FIX: Standard sendKeys with standard Keys.RETURN
        logonScreen.sendTEKeys(Keys.RETURN);
        return window.describe(Screen.class, Screens.MAIN_MENU);
    }

    public static void selectMenuOption(Window window, Screen menuScreen, String option) throws Exception {
        ReportHelper.logStep("KEYWORD: Select Menu Option", option, Status.Passed);
        typeInField(menuScreen, Screens.OPTION, option);
        menuScreen.sendTEKeys(Keys.RETURN);
    }

    public static Map<String, String> accountInquiry(Window window, String accNum, String accType) throws Exception {
        ReportHelper.logStep("KEYWORD: Account Inquiry", "Account: " + accNum, Status.Passed);
        Screen screen = waitForScreen(window, Screens.ACCOUNT_INQUIRY, "Account Inquiry");
        typeInField(screen, Screens.ACC_NUMBER, accNum);
        typeInField(screen, Screens.ACC_TYPE, accType);
        screen.sendTEKeys(Keys.RETURN);

        ReportHelper.attachSnapshot(screen, "Account Inquiry Result");

        Map<String, String> result = new HashMap<>();
        result.put("balance", readField(screen, Screens.BALANCE));
        result.put("status", readField(screen, Screens.STATUS));
        return result;
    }

    public static String fundsTransfer(Window window, String fromAcc, String toAcc, String amt, String curr)
            throws Exception {
        ReportHelper.logStep("KEYWORD: Funds Transfer", "From: " + fromAcc + " To: " + toAcc, Status.Passed);
        Screen screen = waitForScreen(window, Screens.FUNDS_TRANSFER_INPUT, "Funds Transfer Input");
        typeInField(screen, Screens.FROM_ACC, fromAcc);
        typeInField(screen, Screens.TO_ACC, toAcc);
        typeInField(screen, Screens.AMOUNT, amt);
        typeInField(screen, Screens.CURRENCY, curr);
        screen.sendTEKeys(Keys.RETURN);

        Screen confirmScreen = waitForScreen(window, Screens.FUNDS_TRANSFER_CONFIRM, "Confirmation");
        ReportHelper.attachSnapshot(confirmScreen, "Transfer Confirmation");
        return readField(confirmScreen, Screens.CONFIRM_NUM);
    }

    public static void signOff(Window window) throws Exception {
        ReportHelper.logStep("KEYWORD: Sign Off", "Executing Sign Off", Status.Passed);
        Screen menuScreen = window.describe(Screen.class, Screens.MAIN_MENU);
        typeInField(menuScreen, Screens.OPTION, "99");
        menuScreen.sendTEKeys(Keys.RETURN);
    }
}