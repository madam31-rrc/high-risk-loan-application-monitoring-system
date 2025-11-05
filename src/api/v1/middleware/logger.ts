import morgan, { StreamOptions } from "morgan";
import fs from "fs";
import path from "path";

// Ensure logs directory exists
const logsDir = path.join(__dirname, "../../../logs");
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Create a write stream (in append mode) for access logs
const accessLogStream = fs.createWriteStream(path.join(logsDir, "access.log"), {
    flags: "a",
});

// Define custom stream options for error logging
const errorLogStream: StreamOptions = {
    write: (message) =>
        fs.appendFileSync(path.join(logsDir, "error.log"), message),
};

// Setup the logger for access logs (all requests)
const accessLogger = morgan("combined", { stream: accessLogStream });

// Setup the logger for error logs (4xx and 5xx status codes only)
const errorLogger = morgan("combined", {
    stream: errorLogStream,
    skip: (req, res) => res.statusCode < 400,
});

// Console logger for development
const consoleLogger = morgan("dev");

export { accessLogger, errorLogger, consoleLogger };