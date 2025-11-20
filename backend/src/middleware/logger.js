import morgan from "morgan";

// Tiny logger format (method, URL, response time)
export const logger = morgan(":method :url :status :response-time ms");
