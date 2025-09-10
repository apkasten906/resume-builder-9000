"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const core_1 = require("@rb9k/core");
const resume_1 = require("../controllers/resume");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
// Get a resume by ID
router.get('/:id', (req, res) => {
    (0, resume_1.getResumeById)(req, res).catch((error) => {
        logger_1.logger.error('Error fetching resume in route handler', {
            error,
            method: req.method,
            url: req.originalUrl,
            resumeId: req.params.id
        });
        res.status(500).json({ error: 'Failed to fetch resume' });
    });
});
// Type guard for ZodError
function isZodError(error) {
    return (typeof error === 'object' &&
        error !== null &&
        'name' in error &&
        error.name === 'ZodError' &&
        'errors' in error);
}
router.post('/', (req, res) => {
    void (async () => {
        try {
            const { resumeData, jobDetails } = req.body;
            // Validate input data
            const validResumeData = core_1.ResumeDataSchema.parse(resumeData);
            const validJobDetails = core_1.JobDetailsSchema.parse(jobDetails);
            // Generate resume
            const result = await (0, resume_1.generateResume)(validResumeData, validJobDetails);
            // Save resume to database
            const savedResume = await (0, resume_1.saveResume)(result);
            res.status(201).json(savedResume);
        }
        catch (error) {
            logger_1.logger.error('Error generating resume', {
                error,
                method: req.method,
                url: req.originalUrl
            });
            if (isZodError(error)) {
                logger_1.logger.warn('Validation error in resume generation', {
                    validationErrors: error.errors
                });
                return res.status(400).json({ error: 'Invalid input data', details: error.errors });
            }
            res.status(500).json({ error: 'Failed to generate resume' });
        }
    })();
});
exports.default = router;
