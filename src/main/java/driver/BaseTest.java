package driver;

import com.hp.lft.sdk.*;
import com.hp.lft.sdk.te.Window;
import com.hp.lft.sdk.te.WindowDescription;
import config.Settings;
import libraries.ReportHelper;
import org.testng.annotations.*;
import java.net.URI;

public class BaseTest {
    // FIX: Using the correct Java class name 'Window' instead of 'TeWindow'
    protected Window teWindow;

    @BeforeSuite
    public void setupSuite() throws Exception {
        ModifiableSDKConfiguration config = new ModifiableSDKConfiguration();
        config.setServerAddress(new URI("ws://" + Settings.AGENT_HOST + ":" + Settings.AGENT_PORT));
        SDK.init(config);
        ReportHelper.log("LeanFT SDK Initialized for Environment: " + Settings.ENVIRONMENT);
    }

    @BeforeMethod
    public void setupTest() throws Exception {
        // FIX: Explicitly target Session ID "A" to prevent memory leaks
        teWindow = Desktop.describe(Window.class, new WindowDescription.Builder().shortName("A").build());
        ReportHelper.log("TE Window attached to Session A.");
    }

    @AfterMethod
    public void teardownTest() throws Exception {
        // No explicit session close needed for Desktop attachment
    }

    @AfterSuite
    public void teardownSuite() throws Exception {
        SDK.cleanup();
    }
}