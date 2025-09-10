"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResumeById = getResumeById;
exports.generateResume = generateResume;
exports.saveResume = saveResume;
const core_1 = require("@rb9k/core");
const resume_generator_1 = require("../services/resume-generator");
const db_1 = require("../db");
const logger_1 = require("../utils/logger");
async function getResumeById(req, res) {
    try {
        const { id } = req.params;
        const resume = await (0, db_1.getResumeFromDb)(id);
        if (!resume) {
            res.status(404).json({ error: 'Resume not found' });
            return;
        }
        res.json(resume);
        return;
    }
    catch (error) {
        logger_1.logger.error('Error retrieving resume', { error, resumeId: req.params.id });
        res.status(500).json({ error: 'Failed to retrieve resume' });
    }
}
async function generateResume(resumeData, jobDetails) {
    // Create service with default generator
    const generator = new resume_generator_1.DefaultResumeGenerator();
    const resumeService = new core_1.ResumeService(generator);
    // Generate the resume content
    let resumeContent = await resumeService.createResume(resumeData, jobDetails);
    if (Buffer.isBuffer(resumeContent)) {
        resumeContent = resumeContent.toString('utf-8');
    }
    // Return the result
    return {
        content: resumeContent,
        resumeData,
        jobDetails,
        createdAt: new Date().toISOString(),
    };
}
async function saveResume(resumeData) {
    // Save to database and return with ID
    const id = await (0, db_1.insertResume)(resumeData);
    return { id, ...resumeData };
}
