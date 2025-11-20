import app from "./app.js";
import dotenv from "dotenv";
import { initializeMonitoring } from "./utils/monitorScheduler.js";
import { ensureDefaultUser } from "./utils/defaultUser.js";
import { logger } from "./utils/logger.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    logger.info(`Server started on port ${PORT}`);

    // Ensure default user exists
    try {
        await ensureDefaultUser();
        logger.info("Default user ensured");
    } catch (error) {
        logger.error("Failed to ensure default user:", error.message);
    }

    // Initialize monitoring system
    try {
        await initializeMonitoring();
    } catch (error) {
        logger.error("Failed to initialize monitoring system:", error.message);
    }
});
