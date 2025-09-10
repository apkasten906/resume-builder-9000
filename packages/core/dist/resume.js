"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeService = void 0;
class ResumeService {
    generator;
    formatter;
    constructor(generator, formatter) {
        this.generator = generator;
        this.formatter = formatter;
    }
    async createResume(resumeData, jobDetails) {
        const resumeContent = await this.generator.generateResume(resumeData, jobDetails);
        if (this.formatter) {
            return this.formatter.format(resumeContent);
        }
        return resumeContent;
    }
}
exports.ResumeService = ResumeService;
