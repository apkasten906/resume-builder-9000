'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/toaster';
import { resumeDataToMarkdown } from '@rb9k/core';
import { API } from '@/lib/api-client';
import type {
  ParsedResumeFieldsPayload,
  ParsedResumeUpdateRequest,
  ParsedResumeExperience,
  ParsedResumeEducation,
  ResumeDetailsApiResponse,
  StoredResumeResponse,
} from '@/types/resume-details';

interface ResumeDetailsClientProps {
  readonly uploadId: string;
}

type FormState = ParsedResumeFieldsPayload;

type SelectionTarget = 'summary' | 'skill' | 'experience' | 'education' | 'award';

function getSelectionText(root: HTMLDivElement | null): string {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return '';
  }
  const range = selection.getRangeAt(0);
  if (!root || !root.contains(range.commonAncestorContainer)) {
    return '';
  }
  return selection.toString().trim();
}

function parseMultiline(value: string): string[] {
  return value
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

function serializeMultiline(values: readonly string[]): string {
  return values.join('\n');
}

function mapExperienceToState(experience: readonly ParsedResumeExperience[]): ParsedResumeExperience[] {
  return experience.map(entry => ({ ...entry }));
}

function mapEducationToState(education: readonly ParsedResumeEducation[]): ParsedResumeEducation[] {
  return education.map(entry => ({ ...entry }));
}

export function ResumeDetailsClient({ uploadId }: ResumeDetailsClientProps): React.ReactElement {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState | null>(null);
  const [resumeData, setResumeData] = useState<StoredResumeResponse | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadDetails(): Promise<void> {
      setLoading(true);
      setError(null);
      try {
        const response = await API.resumeDetails.get<ResumeDetailsApiResponse>(`?id=${uploadId}`);
        setFormState({
          ...response.parsedFields,
          experience: mapExperienceToState(response.parsedFields.experience),
          education: mapEducationToState(response.parsedFields.education),
          skills: [...response.parsedFields.skills],
          certifications: [...response.parsedFields.certifications],
          awards: [...response.parsedFields.awards],
          hobbies: [...response.parsedFields.hobbies],
          personalInfo: {
            ...response.parsedFields.personalInfo,
            emails: [...response.parsedFields.personalInfo.emails],
            phones: [...response.parsedFields.personalInfo.phones],
            addresses: [...response.parsedFields.personalInfo.addresses],
            websites: [...response.parsedFields.personalInfo.websites],
          },
        });
        setResumeData(response.resume);
      } catch (err) {
        console.error('Failed to load resume details', err);
        setError('Unable to load resume details. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    if (uploadId) {
      void loadDetails();
    }
  }, [uploadId]);

  const previewMarkdown = useMemo(() => {
    if (!resumeData) {
      return '';
    }
    try {
      return resumeDataToMarkdown(resumeData.resumeData);
    } catch (err) {
      console.error('Failed to render resume markdown', err);
      return '';
    }
  }, [resumeData]);

  async function handleSave(): Promise<void> {
    if (!formState) {
      return;
    }

    setSaving(true);
    setSelectionError(null);
    setError(null);

    const payload: ParsedResumeUpdateRequest = {
      parsedSummary: formState.parsedSummary,
      personalInfo: {
        name: formState.personalInfo.name,
        emails: [...formState.personalInfo.emails],
        phones: [...formState.personalInfo.phones],
        addresses: [...formState.personalInfo.addresses],
        websites: [...formState.personalInfo.websites],
      },
      experience: mapExperienceToState(formState.experience),
      skills: [...formState.skills],
      education: mapEducationToState(formState.education),
      certifications: [...formState.certifications],
      awards: [...formState.awards],
      hobbies: [...formState.hobbies],
    };

    try {
      const updated = await API.resumeDetails.put<ParsedResumeUpdateRequest, ParsedResumeFieldsPayload>(
        payload,
        `?id=${uploadId}`
      );
      setFormState({
        ...updated,
        experience: mapExperienceToState(updated.experience),
        education: mapEducationToState(updated.education),
        skills: [...updated.skills],
        certifications: [...updated.certifications],
        awards: [...updated.awards],
        hobbies: [...updated.hobbies],
        personalInfo: {
          ...updated.personalInfo,
          emails: [...updated.personalInfo.emails],
          phones: [...updated.personalInfo.phones],
          addresses: [...updated.personalInfo.addresses],
          websites: [...updated.personalInfo.websites],
        },
      });
      toast({ title: 'Changes saved', description: 'Parsed resume details updated successfully.' });
    } catch (err) {
      console.error('Failed to save parsed resume details', err);
      setError('Unable to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function updatePersonalInfo(field: keyof FormState['personalInfo'], value: string[]): void {
    if (!formState) {
      return;
    }
    setFormState({
      ...formState,
      personalInfo: {
        ...formState.personalInfo,
        [field]: value,
      },
    });
  }

  function updateExperience(index: number, patch: Partial<ParsedResumeExperience>): void {
    if (!formState) {
      return;
    }
    const nextExperience = formState.experience.map((item, idx) =>
      idx === index ? { ...item, ...patch } : item
    );
    setFormState({ ...formState, experience: nextExperience });
  }

  function addExperience(description: string): void {
    if (!formState) {
      return;
    }
    const newEntry: ParsedResumeExperience = {
      id: `${formState.id}-exp-${formState.experience.length}`,
      title: 'New Experience',
      company: undefined,
      description,
    };
    setFormState({ ...formState, experience: [...formState.experience, newEntry] });
  }

  function removeExperience(index: number): void {
    if (!formState) {
      return;
    }
    const nextExperience = formState.experience.filter((_, idx) => idx !== index);
    setFormState({ ...formState, experience: nextExperience });
  }

  function updateEducation(index: number, patch: Partial<ParsedResumeEducation>): void {
    if (!formState) {
      return;
    }
    const nextEducation = formState.education.map((item, idx) =>
      idx === index ? { ...item, ...patch } : item
    );
    setFormState({ ...formState, education: nextEducation });
  }

  function addEducation(note: string): void {
    if (!formState) {
      return;
    }
    const newEntry: ParsedResumeEducation = {
      id: `${formState.id}-edu-${formState.education.length}`,
      institution: 'New Institution',
      degree: note || 'New Degree',
    };
    setFormState({ ...formState, education: [...formState.education, newEntry] });
  }

  function removeEducation(index: number): void {
    if (!formState) {
      return;
    }
    const nextEducation = formState.education.filter((_, idx) => idx !== index);
    setFormState({ ...formState, education: nextEducation });
  }

  function addSkill(skill: string): void {
    if (!formState || !skill) {
      return;
    }
    if (formState.skills.includes(skill)) {
      return;
    }
    setFormState({ ...formState, skills: [...formState.skills, skill] });
  }

  function addAward(award: string): void {
    if (!formState || !award) {
      return;
    }
    if (formState.awards.includes(award)) {
      return;
    }
    setFormState({ ...formState, awards: [...formState.awards, award] });
  }

  function handleSelection(target: SelectionTarget): void {
    if (!formState) {
      return;
    }
    const text = getSelectionText(previewRef.current);
    if (!text) {
      setSelectionError('Select text in the preview to map it to a category.');
      return;
    }
    setSelectionError(null);

    if (target === 'summary') {
      setFormState({
        ...formState,
        parsedSummary: formState.parsedSummary
          ? `${formState.parsedSummary}\n${text}`
          : text,
      });
      return;
    }

    if (target === 'skill') {
      addSkill(text);
      return;
    }

    if (target === 'experience') {
      addExperience(text);
      return;
    }

    if (target === 'education') {
      addEducation(text);
      return;
    }

    if (target === 'award') {
      addAward(text);
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
            <p className="text-gray-600 dark:text-gray-400">Loading resume details...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Resume Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600" role="alert">
                {error}
              </p>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  if (!formState) {
    return (
      <ProtectedRoute>
        <div className="mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Resume Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p>No parsed data available.</p>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary & Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                label="Summary"
                value={formState.parsedSummary ?? ''}
                onChange={event =>
                  setFormState({ ...formState, parsedSummary: event.currentTarget.value })
                }
              />

              <Input
                label="Name"
                value={formState.personalInfo.name ?? ''}
                onChange={event =>
                  setFormState({
                    ...formState,
                    personalInfo: { ...formState.personalInfo, name: event.currentTarget.value },
                  })
                }
              />

              <Textarea
                label="Emails"
                helperText="One address per line"
                value={serializeMultiline(formState.personalInfo.emails)}
                onChange={event => updatePersonalInfo('emails', parseMultiline(event.currentTarget.value))}
              />

              <Textarea
                label="Phone Numbers"
                helperText="One number per line"
                value={serializeMultiline(formState.personalInfo.phones)}
                onChange={event => updatePersonalInfo('phones', parseMultiline(event.currentTarget.value))}
              />

              <Textarea
                label="Addresses"
                helperText="One address per line"
                value={serializeMultiline(formState.personalInfo.addresses)}
                onChange={event => updatePersonalInfo('addresses', parseMultiline(event.currentTarget.value))}
              />

              <Textarea
                label="Websites"
                helperText="One URL per line"
                value={serializeMultiline(formState.personalInfo.websites)}
                onChange={event => updatePersonalInfo('websites', parseMultiline(event.currentTarget.value))}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <CardTitle>Experience</CardTitle>
              <Button type="button" onClick={() => addExperience('New responsibility')}>
                Add Experience
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {formState.experience.length === 0 && (
                <p className="text-sm text-muted-foreground">No experience entries yet.</p>
              )}
              {formState.experience.map((item, index) => (
                <div key={item.id ?? `exp-${index}`} className="rounded-xl border p-4 space-y-3">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <Input
                      label="Title"
                      value={item.title}
                      onChange={event => updateExperience(index, { title: event.currentTarget.value })}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => removeExperience(index)}
                    >
                      Remove
                    </Button>
                  </div>
                  <Input
                    label="Company"
                    value={item.company ?? ''}
                    onChange={event => updateExperience(index, { company: event.currentTarget.value })}
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label="Start Date"
                      value={item.startDate ?? ''}
                      onChange={event => updateExperience(index, { startDate: event.currentTarget.value })}
                    />
                    <Input
                      label="End Date"
                      value={item.endDate ?? ''}
                      onChange={event => updateExperience(index, { endDate: event.currentTarget.value })}
                    />
                  </div>
                  <Textarea
                    label="Description"
                    value={item.description ?? ''}
                    onChange={event => updateExperience(index, { description: event.currentTarget.value })}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <CardTitle>Education</CardTitle>
              <Button type="button" onClick={() => addEducation('New Education')}>Add Education</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {formState.education.length === 0 && (
                <p className="text-sm text-muted-foreground">No education entries yet.</p>
              )}
              {formState.education.map((item, index) => (
                <div key={item.id ?? `edu-${index}`} className="rounded-xl border p-4 space-y-3">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <Input
                      label="Institution"
                      value={item.institution}
                      onChange={event => updateEducation(index, { institution: event.currentTarget.value })}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => removeEducation(index)}
                    >
                      Remove
                    </Button>
                  </div>
                  <Input
                    label="Degree"
                    value={item.degree}
                    onChange={event => updateEducation(index, { degree: event.currentTarget.value })}
                  />
                  <Input
                    label="Field of Study"
                    value={item.fieldOfStudy ?? ''}
                    onChange={event => updateEducation(index, { fieldOfStudy: event.currentTarget.value })}
                  />
                  <Input
                    label="Graduation Date"
                    value={item.graduationDate ?? ''}
                    onChange={event => updateEducation(index, { graduationDate: event.currentTarget.value })}
                  />
                  <Textarea
                    label="Notes"
                    value={item.notes ?? ''}
                    onChange={event => updateEducation(index, { notes: event.currentTarget.value })}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skills & Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                label="Skills"
                helperText="One skill per line"
                value={serializeMultiline(formState.skills)}
                onChange={event =>
                  setFormState({ ...formState, skills: parseMultiline(event.currentTarget.value) })
                }
              />
              <Textarea
                label="Certifications"
                helperText="One certification per line"
                value={serializeMultiline(formState.certifications)}
                onChange={event =>
                  setFormState({ ...formState, certifications: parseMultiline(event.currentTarget.value) })
                }
              />
              <Textarea
                label="Awards"
                helperText="One award per line"
                value={serializeMultiline(formState.awards)}
                onChange={event =>
                  setFormState({ ...formState, awards: parseMultiline(event.currentTarget.value) })
                }
              />
              <Textarea
                label="Hobbies"
                helperText="One hobby per line"
                value={serializeMultiline(formState.hobbies)}
                onChange={event =>
                  setFormState({ ...formState, hobbies: parseMultiline(event.currentTarget.value) })
                }
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="button" onClick={() => void handleSave()} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resume Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                ref={previewRef}
                className="prose max-h-[540px] overflow-auto rounded-lg border p-4 text-sm"
              >
                <pre className="whitespace-pre-wrap break-words">{previewMarkdown}</pre>
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-muted-foreground">
                  Highlight text in the preview, then choose where to map it.
                </p>
                {selectionError && (
                  <p className="text-sm text-red-600" role="alert">
                    {selectionError}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" onClick={() => handleSelection('summary')}>
                    Add to Summary
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => handleSelection('skill')}>
                    Add Skill
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => handleSelection('experience')}>
                    Add Experience Entry
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => handleSelection('education')}>
                    Add Education Entry
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => handleSelection('award')}>
                    Add Award
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {resumeData && (
            <Card>
              <CardHeader>
                <CardTitle>Upload Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">File:</span> {resumeData.content}
                </p>
                <p>
                  <span className="font-medium">Uploaded:</span> {new Date(resumeData.createdAt).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
