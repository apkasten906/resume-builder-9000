"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const resume_1 = __importDefault(require("./routes/resume"));
const db_1 = require("./db");
const logger_1 = require("./utils/logger");
// Load environment variables
dotenv_1.default.config();
// Create Express app
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
// Middleware
app.use(logger_1.httpLogger); // HTTP request logging
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/resumes', resume_1.default);
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Error handling middleware (must be after routes)
app.use(logger_1.errorLogger);
// Initialize database
(0, db_1.connectDatabase)()
    .then(() => {
    // Start server
    app.listen(port, () => {
        logger_1.logger.info(`API server running on http://localhost:${port}`);
    });
})
    .catch((err) => {
    logger_1.logger.error('Failed to connect to database:', { error: err });
    process.exit(1);
});
exports.default = app;
