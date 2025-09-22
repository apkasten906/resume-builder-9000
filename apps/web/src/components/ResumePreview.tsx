import type { ResumeData } from '@rb9k/core';
import React from 'react';

interface ResumePreviewProps {
  resume: ResumeData;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ resume }) => {
  const { personalInfo, summary, experience, education, skills, certifications, projects } = resume;
  return (
    <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold">{personalInfo.fullName}</h1>
        <div className="text-gray-600">
          <span>{personalInfo.email}</span>
          {personalInfo.phone && <span> | {personalInfo.phone}</span>}
          {personalInfo.location && <span> | {personalInfo.location}</span>}
        </div>
        <div className="flex justify-center gap-4 mt-2">
          {personalInfo.linkedIn && (
            <a
              href={personalInfo.linkedIn}
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          )}
          {personalInfo.github && (
            <a
              href={personalInfo.github}
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          )}
          {personalInfo.website && (
            <a
              href={personalInfo.website}
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Website
            </a>
          )}
        </div>
      </header>
      {summary && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Professional Summary</h2>
          <p>{summary}</p>
        </section>
      )}
      {experience && experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Work Experience</h2>
          {experience.map(job => (
            <div key={`${job.company}-${job.title}-${job.startDate}`} className="mb-4">
              <div className="flex justify-between">
                <h3 className="font-bold">
                  {job.title} at {job.company}
                </h3>
                <span className="text-gray-500">
                  {job.startDate} - {job.current ? 'Present' : job.endDate || 'N/A'}
                </span>
              </div>
              {job.location && <div className="text-gray-500">{job.location}</div>}
              {job.responsibilities && job.responsibilities.length > 0 && (
                <ul className="list-disc pl-6 mt-1">
                  {job.responsibilities.map(resp => (
                    <li key={resp}>{resp}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}
      {education && education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Education</h2>
          {education.map(edu => (
            <div key={`${edu.institution}-${edu.degree}-${edu.graduationDate}`} className="mb-2">
              <div className="font-bold">
                {edu.degree} at {edu.institution}
              </div>
              <div className="text-gray-500">
                {edu.graduationDate || 'N/A'}
                {edu.location ? ` | ${edu.location}` : ''}
              </div>
              {edu.highlights && edu.highlights.length > 0 && (
                <ul className="list-disc pl-6 mt-1">
                  {edu.highlights.map(hl => (
                    <li key={hl}>{hl}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}
      {skills && skills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map(skill => (
              <span
                key={skill.name}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                {skill.name}
                {skill.level ? ` (${skill.level}/5)` : ''}
              </span>
            ))}
          </div>
        </section>
      )}
      {certifications && certifications.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Certifications</h2>
          <ul className="list-disc pl-6">
            {certifications.map(cert => (
              <li key={cert}>{cert}</li>
            ))}
          </ul>
        </section>
      )}
      {projects && projects.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Projects</h2>
          <ul className="list-disc pl-6">
            {projects.map(proj => (
              <li key={proj}>{proj}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};
