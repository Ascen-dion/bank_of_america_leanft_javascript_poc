package objectrepository;

import com.hp.lft.sdk.te.ScreenDescription;
import com.hp.lft.sdk.te.FieldDescription;

public class Screens {

        // FIX: Using .label() instead of .text() for Screen
        public static final ScreenDescription LOGON_SCREEN = new ScreenDescription.Builder()
                        .label("LOGON").build();

        // FIX: Removed .startRow()/.startColumn() entirely. LeanFT can identify fields
        // by attached text alone.
        public static final FieldDescription USER_ID = new FieldDescription.Builder()
                        .attachedText("USER ID").build();
        public static final FieldDescription PASSWORD = new FieldDescription.Builder()
                        .attachedText("PASSWORD").build();

        public static final ScreenDescription MAIN_MENU = new ScreenDescription.Builder()
                        .label("MAIN MENU").build();
        public static final FieldDescription OPTION = new FieldDescription.Builder()
                        .attachedText("OPTION").build();

        public static final ScreenDescription ACCOUNT_INQUIRY = new ScreenDescription.Builder()
                        .label("ACCOUNT INQUIRY").build();
        public static final FieldDescription ACC_NUMBER = new FieldDescription.Builder()
                        .attachedText("ACCOUNT NUMBER").build();
        public static final FieldDescription ACC_TYPE = new FieldDescription.Builder()
                        .attachedText("ACCOUNT TYPE").build();
        public static final FieldDescription BALANCE = new FieldDescription.Builder()
                        .attachedText("BALANCE").build();
        public static final FieldDescription STATUS = new FieldDescription.Builder()
                        .attachedText("STATUS").build();

        public static final ScreenDescription FUNDS_TRANSFER_INPUT = new ScreenDescription.Builder()
                        .label("FUNDS TRANSFER").build();
        public static final FieldDescription FROM_ACC = new FieldDescription.Builder()
                        .attachedText("FROM ACCOUNT").build();
        public static final FieldDescription TO_ACC = new FieldDescription.Builder()
                        .attachedText("TO ACCOUNT").build();
        public static final FieldDescription AMOUNT = new FieldDescription.Builder()
                        .attachedText("AMOUNT").build();
        public static final FieldDescription CURRENCY = new FieldDescription.Builder()
                        .attachedText("CURRENCY").build();

        public static final ScreenDescription FUNDS_TRANSFER_CONFIRM = new ScreenDescription.Builder()
                        .label("TRANSFER SUCCESSFUL").build();
        public static final FieldDescription CONFIRM_NUM = new FieldDescription.Builder()
                        .attachedText("CONFIRMATION NUMBER").build();
        public static final FieldDescription MESSAGE = new FieldDescription.Builder()
                        .attachedText("MESSAGE").build();

        public static final ScreenDescription ERROR_SCREEN = new ScreenDescription.Builder()
                        .label("INVALID").build();
        public static final FieldDescription ERROR_MSG = new FieldDescription.Builder()
                        .attachedText("MESSAGE").build();
}