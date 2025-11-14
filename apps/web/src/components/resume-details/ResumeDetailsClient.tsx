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
  ParsedResumeHistoryEntry,
  ParsedResumeRestoreRequest,
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

function mapExperienceToState(
  experience: readonly ParsedResumeExperience[]
): ParsedResumeExperience[] {
  return experience.map(entry => ({ ...entry }));
}

function mapEducationToState(education: readonly ParsedResumeEducation[]): ParsedResumeEducation[] {
  return education.map(entry => ({ ...entry }));
}

function cloneParsedFields(payload: ParsedResumeFieldsPayload): FormState {
  return {
    ...payload,
    experience: mapExperienceToState(payload.experience),
    education: mapEducationToState(payload.education),
    skills: [...payload.skills],
    certifications: [...payload.certifications],
    awards: [...payload.awards],
    hobbies: [...payload.hobbies],
    personalInfo: {
      ...payload.personalInfo,
      emails: [...payload.personalInfo.emails],
      phones: [...payload.personalInfo.phones],
      addresses: [...payload.personalInfo.addresses],
      websites: [...payload.personalInfo.websites],
    },
  };
}

function buildUpdatePayload(state: FormState): ParsedResumeUpdateRequest {
  return {
    parsedSummary: state.parsedSummary ?? undefined,
    personalInfo: {
      name: state.personalInfo.name ?? undefined,
      emails: [...state.personalInfo.emails],
      phones: [...state.personalInfo.phones],
      addresses: [...state.personalInfo.addresses],
      websites: [...state.personalInfo.websites],
    },
    experience: mapExperienceToState(state.experience),
    skills: [...state.skills],
    education: mapEducationToState(state.education),
    certifications: [...state.certifications],
    awards: [...state.awards],
    hobbies: [...state.hobbies],
  };
}

function fingerprintPayload(payload: ParsedResumeUpdateRequest): string {
  return JSON.stringify(payload, (_, value) => (value === undefined ? null : value));
}

function cloneHistoryEntry(entry: ParsedResumeHistoryEntry): ParsedResumeHistoryEntry {
  return {
    ...entry,
    snapshot: cloneParsedFields(entry.snapshot),
  };
}

function formatSummaryPreview(entry: ParsedResumeHistoryEntry): string {
  const summary = entry.snapshot.parsedSummary ?? '';
  if (!summary) {
    return 'No summary recorded in this snapshot.';
  }
  const normalized = summary.replace(/\s+/g, ' ').trim();
  return normalized.length > 140 ? `${normalized.slice(0, 137)}…` : normalized;
}

export function ResumeDetailsClient({ uploadId }: ResumeDetailsClientProps): React.ReactElement {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState | null>(null);
  const [resumeData, setResumeData] = useState<StoredResumeResponse | null>(null);
  const [history, setHistory] = useState<ParsedResumeHistoryEntry[]>([]);
  const [restoringHistoryId, setRestoringHistoryId] = useState<string | null>(null);
  const [lastSavedFingerprint, setLastSavedFingerprint] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadDetails(): Promise<void> {
      setLoading(true);
      setLoadError(null);
      setSaveError(null);
      try {
        const response = await API.resumeDetails.get<ResumeDetailsApiResponse>(`?id=${uploadId}`);
        const cloned = cloneParsedFields(response.parsedFields);
        setFormState(cloned);
        setLastSavedFingerprint(fingerprintPayload(buildUpdatePayload(cloned)));
        setResumeData(response.resume);
        setHistory(response.history.map(cloneHistoryEntry));
      } catch (err) {
        console.error('Failed to load resume details', err);
        setLoadError('Unable to load resume details. Please try again later.');
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
    setSaveError(null);

    const payload = buildUpdatePayload(formState);
    const optimisticFingerprint = fingerprintPayload(payload);
    const previousFingerprint = lastSavedFingerprint;

    setLastSavedFingerprint(optimisticFingerprint);

    try {
      const updated = await API.resumeDetails.put<
        ParsedResumeUpdateRequest,
        ResumeDetailsApiResponse
      >(payload, `?id=${uploadId}`);
      const normalized = cloneParsedFields(updated.parsedFields);
      setFormState(normalized);
      setLastSavedFingerprint(fingerprintPayload(buildUpdatePayload(normalized)));
      setHistory(updated.history.map(cloneHistoryEntry));
      toast({ title: 'Changes saved', description: 'Parsed resume details updated successfully.' });
    } catch (err) {
      console.error('Failed to save parsed resume details', err);
      setSaveError('Unable to save changes. Please try again.');
      setLastSavedFingerprint(previousFingerprint ?? null);
    } finally {
      setSaving(false);
    }
  }

  async function handleRestore(historyId: string): Promise<void> {
    setRestoringHistoryId(historyId);
    setSelectionError(null);
    setSaveError(null);

    try {
      const restored = await API.resumeDetails.post<
        ParsedResumeRestoreRequest,
        ResumeDetailsApiResponse
      >({ uploadId, historyId }, '/history/restore');
      const normalized = cloneParsedFields(restored.parsedFields);
      setFormState(normalized);
      setLastSavedFingerprint(fingerprintPayload(buildUpdatePayload(normalized)));
      setHistory(restored.history.map(cloneHistoryEntry));
      toast({
        title: 'Snapshot restored',
        description: 'Parsed resume fields reverted successfully.',
      });
    } catch (err) {
      console.error('Failed to restore parsed resume snapshot', err);
      setSaveError('Unable to restore this snapshot. Please try again.');
    } finally {
      setRestoringHistoryId(null);
    }
  }

  function handleDownload(): void {
    if (!formState) {
      toast({
        title: 'Download unavailable',
        description: 'Resume details are still loading. Please try again shortly.',
      });
      return;
    }

    try {
      const exportBlob = new Blob([JSON.stringify(formState, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(exportBlob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `parsed-resume-${uploadId}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 0);
    } catch (err) {
      console.error('Failed to download parsed resume fields', err);
      toast({
        title: 'Download failed',
        description: 'Unable to export parsed resume fields. Please try again.',
      });
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
        parsedSummary: formState.parsedSummary ? `${formState.parsedSummary}\n${text}` : text,
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

  const currentPayload = useMemo(
    () => (formState ? buildUpdatePayload(formState) : null),
    [formState]
  );

  const currentFingerprint = useMemo(
    () => (currentPayload ? fingerprintPayload(currentPayload) : null),
    [currentPayload]
  );

  const restoring = restoringHistoryId !== null;

  const hasUnsavedChanges = useMemo(() => {
    if (!currentFingerprint) {
      return false;
    }
    if (!lastSavedFingerprint) {
      return true;
    }
    return currentFingerprint !== lastSavedFingerprint;
  }, [currentFingerprint, lastSavedFingerprint]);

  const statusMessage = restoring
    ? 'Restoring snapshot...'
    : hasUnsavedChanges
      ? 'Unsaved changes'
      : saving
        ? 'All changes saved • Syncing...'
        : 'All changes saved';

  const statusClassName = restoring
    ? 'text-blue-600 dark:text-blue-400'
    : hasUnsavedChanges
      ? 'text-amber-600 dark:text-amber-400'
      : saving
        ? 'text-blue-600 dark:text-blue-400'
        : 'text-emerald-600 dark:text-emerald-400';

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

  if (loadError) {
    return (
      <ProtectedRoute>
        <div className="mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Resume Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600" role="alert">
                {loadError}
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
                data-testid="parsed-summary-input"
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
                onChange={event =>
                  updatePersonalInfo('emails', parseMultiline(event.currentTarget.value))
                }
              />

              <Textarea
                label="Phone Numbers"
                helperText="One number per line"
                value={serializeMultiline(formState.personalInfo.phones)}
                onChange={event =>
                  updatePersonalInfo('phones', parseMultiline(event.currentTarget.value))
                }
              />

              <Textarea
                label="Addresses"
                helperText="One address per line"
                value={serializeMultiline(formState.personalInfo.addresses)}
                onChange={event =>
                  updatePersonalInfo('addresses', parseMultiline(event.currentTarget.value))
                }
              />

              <Textarea
                label="Websites"
                helperText="One URL per line"
                value={serializeMultiline(formState.personalInfo.websites)}
                onChange={event =>
                  updatePersonalInfo('websites', parseMultiline(event.currentTarget.value))
                }
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
                      onChange={event =>
                        updateExperience(index, { title: event.currentTarget.value })
                      }
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
                    onChange={event =>
                      updateExperience(index, { company: event.currentTarget.value })
                    }
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label="Start Date"
                      value={item.startDate ?? ''}
                      onChange={event =>
                        updateExperience(index, { startDate: event.currentTarget.value })
                      }
                    />
                    <Input
                      label="End Date"
                      value={item.endDate ?? ''}
                      onChange={event =>
                        updateExperience(index, { endDate: event.currentTarget.value })
                      }
                    />
                  </div>
                  <Textarea
                    label="Description"
                    value={item.description ?? ''}
                    onChange={event =>
                      updateExperience(index, { description: event.currentTarget.value })
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <CardTitle>Education</CardTitle>
              <Button type="button" onClick={() => addEducation('New Education')}>
                Add Education
              </Button>
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
                      onChange={event =>
                        updateEducation(index, { institution: event.currentTarget.value })
                      }
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
                    onChange={event =>
                      updateEducation(index, { degree: event.currentTarget.value })
                    }
                  />
                  <Input
                    label="Field of Study"
                    value={item.fieldOfStudy ?? ''}
                    onChange={event =>
                      updateEducation(index, { fieldOfStudy: event.currentTarget.value })
                    }
                  />
                  <Input
                    label="Graduation Date"
                    value={item.graduationDate ?? ''}
                    onChange={event =>
                      updateEducation(index, { graduationDate: event.currentTarget.value })
                    }
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
                data-testid="skills-textarea"
                onChange={event =>
                  setFormState({ ...formState, skills: parseMultiline(event.currentTarget.value) })
                }
              />
              <Textarea
                label="Certifications"
                helperText="One certification per line"
                value={serializeMultiline(formState.certifications)}
                onChange={event =>
                  setFormState({
                    ...formState,
                    certifications: parseMultiline(event.currentTarget.value),
                  })
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

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleDownload}
              disabled={restoring}
              data-testid="download-parsed-json-button"
            >
              Download JSON
            </Button>
            <Button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || restoring || !hasUnsavedChanges}
              data-testid="save-changes-button"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
          <div className="space-y-2">
            <p
              className={`text-sm font-medium ${statusClassName}`}
              data-testid="save-status-message"
            >
              {statusMessage}
            </p>
            {saveError && (
              <p className="text-sm text-red-600" role="alert" data-testid="save-error-message">
                {saveError}
              </p>
            )}
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
                data-testid="resume-preview"
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
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleSelection('summary')}
                  >
                    Add to Summary
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleSelection('skill')}
                  >
                    Add Skill
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleSelection('experience')}
                  >
                    Add Experience Entry
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleSelection('education')}
                  >
                    Add Education Entry
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleSelection('award')}
                  >
                    Add Award
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="parsed-history-card">
            <CardHeader>
              <CardTitle>Change History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">No edits have been saved yet.</p>
              ) : (
                <ul className="space-y-3" data-testid="parsed-history-list">
                  {history.slice(0, 5).map(entry => (
                    <li
                      key={entry.id}
                      className="rounded-lg border p-3"
                      data-testid="parsed-history-entry"
                    >
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleString()}
                      </p>
                      <p className="text-sm font-medium">
                        {entry.snapshot.personalInfo.name || 'Unnamed candidate'}
                      </p>
                      <p className="text-sm text-muted-foreground">{formatSummaryPreview(entry)}</p>
                      <div className="mt-2 flex justify-end">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => void handleRestore(entry.id)}
                          disabled={restoring}
                          data-testid="parsed-history-restore-button"
                        >
                          {restoringHistoryId === entry.id ? 'Restoring…' : 'Restore snapshot'}
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {history.length > 5 && (
                <p className="text-xs text-muted-foreground">
                  Showing the 5 most recent updates out of {history.length} snapshots.
                </p>
              )}
            </CardContent>
          </Card>

          {resumeData && (
            <Card>
              <CardHeader>
                <CardTitle>Upload Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="break-all">
                  <span className="font-medium">File:</span>{' '}
                  <span className="break-all">{resumeData.content}</span>
                </p>
                <p>
                  <span className="font-medium">Uploaded:</span>{' '}
                  {new Date(resumeData.createdAt).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
