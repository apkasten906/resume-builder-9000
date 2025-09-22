'use client';
import React, { useState } from 'react';
import type { ReactElement, FormEvent } from 'react';

export default function ResumeBuilderPage(): ReactElement {
  const [form, setForm] = useState({
    name: '',
    address: '',
    email: '',
    phone: '',
    experience: '',
    education: '',
    skills: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Create Your Resume</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          name="name"
          type="text"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          className="border rounded px-3 py-2"
          required
        />
        <input
          name="address"
          type="text"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
          className="border rounded px-3 py-2"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="border rounded px-3 py-2"
        />
        <input
          name="phone"
          type="tel"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
          className="border rounded px-3 py-2"
        />
        <textarea
          name="experience"
          placeholder="Experience (one per line)"
          value={form.experience}
          onChange={handleChange}
          className="border rounded px-3 py-2"
          rows={3}
        />
        <textarea
          name="education"
          placeholder="Education (one per line)"
          value={form.education}
          onChange={handleChange}
          className="border rounded px-3 py-2"
          rows={2}
        />
        <input
          name="skills"
          type="text"
          placeholder="Skills (comma separated)"
          value={form.skills}
          onChange={handleChange}
          className="border rounded px-3 py-2"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mt-2"
        >
          Save Resume
        </button>
      </form>
      {submitted && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Preview</h2>
          <div>
            <strong>Name:</strong> {form.name}
          </div>
          <div>
            <strong>Address:</strong> {form.address}
          </div>
          <div>
            <strong>Email:</strong> {form.email}
          </div>
          <div>
            <strong>Phone:</strong> {form.phone}
          </div>
          <div>
            <strong>Experience:</strong>
            <ul className="list-disc ml-6">
              {form.experience
                .split('\n')
                .filter(Boolean)
                .map((exp, i) => (
                  <li key={i}>{exp}</li>
                ))}
            </ul>
          </div>
          <div>
            <strong>Education:</strong>
            <ul className="list-disc ml-6">
              {form.education
                .split('\n')
                .filter(Boolean)
                .map((edu, i) => (
                  <li key={i}>{edu}</li>
                ))}
            </ul>
          </div>
          <div>
            <strong>Skills:</strong> {form.skills}
          </div>
        </section>
      )}
    </main>
  );
}
