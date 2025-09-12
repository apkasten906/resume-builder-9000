import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About - Resume Builder 9000',
  description: 'Learn about Resume Builder 9000',
};

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">About Resume Builder 9000</h1>

      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
        <p className="text-lg">
          Resume Builder 9000 was created to help job seekers create highly tailored, ATS-friendly
          resumes that stand out from the competition and increase their chances of landing
          interviews and job offers.
        </p>
      </section>

      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
        <ol className="list-decimal pl-6 space-y-4">
          <li className="text-lg">
            <strong>Enter your information</strong> - Add your personal details, work experience,
            education, and skills.
          </li>
          <li className="text-lg">
            <strong>Target a job</strong> - Either paste a job description or select a job role
            you&apos;re interested in.
          </li>
          <li className="text-lg">
            <strong>Let our engine do the work</strong> - Our system analyzes the job requirements
            and tailors your resume to highlight the most relevant experience and skills.
          </li>
          <li className="text-lg">
            <strong>Download and apply</strong> - Get a professionally formatted, ATS-optimized
            resume ready to submit to your dream job.
          </li>
        </ol>
      </section>

      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Technology</h2>
        <p className="text-lg mb-4">Resume Builder 9000 is built using modern web technologies:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Next.js for the frontend with App Router</li>
          <li>Tailwind CSS for styling</li>
          <li>Node.js with Express for the backend API</li>
          <li>SQLite database (with plans to support more databases)</li>
        </ul>
      </section>
    </div>
  );
}
