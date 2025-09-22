import { ResumeData, JobDetails, Experience, Education, Skill } from '@rb9k/core';
import { ResumeGenerator } from '@rb9k/core/dist/resume.js';

export class DefaultResumeGenerator implements ResumeGenerator {
  async generateResume(
    resumeData: ResumeData,
    _jobDetails: JobDetails
  ): Promise<string | ResumeData> {
    await new Promise(resolve => setTimeout(resolve, 0)); // Simulate async operation

    const { personalInfo, experience, education, skills } = resumeData;

    // Basic HTML template for the resume
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Resume for ${personalInfo.fullName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1, h2, h3 { color: #2c3e50; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 30px; }
          .job { margin-bottom: 20px; }
          .job-header { display: flex; justify-content: space-between; }
          .skills { display: flex; flex-wrap: wrap; }
          .skill { background: #f0f0f0; padding: 5px 10px; margin: 5px; border-radius: 3px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${personalInfo.fullName}</h1>
          <p>${personalInfo.email} | ${personalInfo.phone || ''} | ${personalInfo.location || ''}</p>
          ${personalInfo.linkedIn ? `<p>LinkedIn: <a href="${personalInfo.linkedIn}">${personalInfo.linkedIn}</a></p>` : ''}
          ${personalInfo.github ? `<p>GitHub: <a href="${personalInfo.github}">${personalInfo.github}</a></p>` : ''}
        </div>

        <div class="section">
          <h2>Professional Summary</h2>
          <p>${resumeData.summary || 'Experienced professional seeking the ' + jobDetails.title + ' position.'}</p>
        </div>

        <div class="section">
          <h2>Work Experience</h2>
          ${experience
            .map(
              (job: Experience) => `
            <div class="job">
              <div class="job-header">
                <h3>${job.title} at ${job.company}</h3>
                <span>${job.startDate || 'N/A'} - ${job.current ? 'Present' : job.endDate || 'N/A'}</span>
              </div>
              <p>${job.location || ''}</p>
            </div>
          `
            )
            .join('')}
        </div>

        <div class="section">
          <h2>Education</h2>
          ${education
            .map(
              (edu: Education) => `
            <div class="education">
              <h3>${edu.degree} at ${edu.institution}</h3>
              <span>${edu.graduationDate || 'N/A'}</span>
            </div>
          `
            )
            .join('')}
        </div>

        <div class="section">
          <h2>Skills</h2>
          <div class="skills">
            ${skills?.map((skill: Skill) => `<span class="skill">${skill.name || 'Unknown Skill'}</span>`).join('') || ''}
          </div>
        </div>
      </body>
      </html>
    `;

    return html;
  }
}
