import type { ReactElement } from 'react';
export default function Home(): ReactElement {
  return (
    <div className="space-y-8">
      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold mb-4">Welcome to Resume Builder 9000</h2>
        <p className="text-lg mb-6">
          Create tailored, ATS-friendly resumes that help you stand out from the crowd and land your
          dream job.
        </p>
        <div className="flex gap-4">
          <a
            href="/build"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Your Resume
          </a>
          <a
            href="/about"
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Learn More
          </a>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-2">Tailored Content</h3>
          <p>
            Our engine analyzes job descriptions and optimizes your resume for each application.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-2">ATS Friendly</h3>
          <p>
            Designed to pass through Applicant Tracking Systems with the right keywords and
            formatting.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-2">Beautiful Design</h3>
          <p>Professional templates that highlight your experience and skills effectively.</p>
        </div>
      </section>
    </div>
  );
}
