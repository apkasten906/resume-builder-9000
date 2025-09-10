"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const core_1 = require("@rb9k/core");
const resume_1 = require("../controllers/resume");
const logger_1 = require("../utils/logger");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// Get a resume by ID
router.get('/:id', (req, res) => {
    (0, resume_1.getResumeById)(req, res).catch((error) => {
        logger_1.logger.error('Error fetching resume in route handler', {
            error: String(error),
            method: req.method,
            url: req.originalUrl,
            resumeId: req.params.id,
        });
        res.status(500).json({ error: 'Failed to fetch resume' });
    });
});
// Generate a new resume
// Type guard for ZodError
function isZodError(error) {
    return error instanceof zod_1.ZodError;
}
router.post('/', (req, res) => {
    async function handleRequest() {
        try {
            const { resumeData, jobDetails } = req.body;
            try {
                // Generate resume with validated data directly
                const result = await (0, resume_1.generateResume)(
                // TypeScript will infer the correct types from the parse method
                core_1.ResumeDataSchema.parse(resumeData), core_1.JobDetailsSchema.parse(jobDetails));
                // Save resume to database
                const savedResume = await (0, resume_1.saveResume)(result);
                res.status(201).json(savedResume);
            }
            catch (validationError) {
                if (isZodError(validationError)) {
                    logger_1.logger.warn('Validation error in resume generation', {
                        validationErrors: validationError.errors,
                    });
                    res.status(400).json({ error: 'Invalid input data', details: validationError.errors });
                }
                else {
                    throw validationError; // Re-throw for the outer catch to handle
                }
            }
            // No code here - we already sent response in the try-catch block
        }
        catch (error) {
            logger_1.logger.error('Error generating resume', {
                error: String(error),
                method: req.method,
                url: req.originalUrl,
            });
            if (isZodError(error)) {
                logger_1.logger.warn('Validation error in resume generation', {
                    validationErrors: error.errors,
                });
                res.status(400).json({ error: 'Invalid input data', details: error.errors });
                return;
            }
            res.status(500).json({ error: 'Failed to generate resume' });
        }
    }
    void handleRequest();
});
exports.default = router;
