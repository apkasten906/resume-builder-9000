"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorLogger = exports.httpLogger = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const morgan_1 = __importDefault(require("morgan"));
// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
// Define colors for each level
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
};
// Add colors to winston
winston_1.default.addColors(colors);
// Determine log level based on environment
const level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';
// Create format for console output
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf((info) => {
    const timestamp = typeof info.timestamp === 'string' ? info.timestamp : 'N/A';
    const level = typeof info.level === 'string' ? info.level : 'unknown';
    const message = typeof info.message === 'string' ? info.message : '';
    return `${timestamp} ${level}: ${message}`;
}));
// Create format for file output (JSON)
const fileFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.json());
// Create the logger instance
const logger = winston_1.default.createLogger({
    level,
    levels,
    transports: [
        // Console transport
        new winston_1.default.transports.Console({
            format: consoleFormat,
        }),
        // File transport for error logs
        new winston_1.default.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: fileFormat,
        }),
        // File transport for all logs
        new winston_1.default.transports.File({
            filename: 'logs/combined.log',
            format: fileFormat,
        }),
    ],
});
exports.logger = logger;
// Create HTTP request logger middleware
const httpLogger = (0, morgan_1.default)(
// Define the format string
':remote-addr :method :url :status :res[content-length] - :response-time ms', {
    // Log to winston
    stream: {
        write: (message) => {
            logger.http(message.trim());
        },
    },
});
exports.httpLogger = httpLogger;
// Create a custom error handler middleware
const errorLogger = (err, req, res, next) => {
    logger.error(`Error occurred: ${err.message}`, {
        url: req.originalUrl,
        method: req.method,
        stack: err.stack,
    });
    next();
};
exports.errorLogger = errorLogger;
