package config;

public class Settings {
    public static final String AGENT_HOST = "localhost";
    public static final int AGENT_PORT = 5095;

    // Pull from System Properties (Jenkins) or default to SIT
    public static final String TE_HOST = System.getProperty("TE_HOST", "mainframe.bankofamerica.internal");
    public static final int TE_PORT = 23;

    public static final int SCREEN_TIMEOUT_MS = 15000;
    public static final String ENVIRONMENT = System.getProperty("env", "SIT");
}
