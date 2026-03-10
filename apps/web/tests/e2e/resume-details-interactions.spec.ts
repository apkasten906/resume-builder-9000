import { test, expect } from '@playwright/test';
import type {
  ParsedResumeFieldsPayload,
  ParsedResumeHistoryEntry,
  ParsedResumeUpdateRequest,
  ResumeDetailsApiResponse,
} from '../../src/types/resume-details';

test.describe('Resume Details interactions', (): void => {
  test('maps highlighted preview text into skills and saves changes', async ({
    page,
    baseURL,
  }): Promise<void> => {
    const webUrl = baseURL?.toString() ?? '';
    const uploadId = 'upload-123';

    const resumeResponse: NonNullable<ResumeDetailsApiResponse['resume']> = {
      id: 'resume-1',
      content: 'SeniorEngineer.pdf',
      resumeData: {
        personalInfo: {
          fullName: 'Casey Candidate',
          email: 'casey@example.com',
          location: 'Remote',
        },
        summary: 'Seasoned engineer delivering resilient GraphQL APIs.',
        experience: [
          {
            title: 'Senior Software Engineer',
            company: 'Acme Corp',
            startDate: '2020',
            endDate: '2024',
            current: false,
            responsibilities: [
              'Designed GraphQL APIs for critical services',
              'Mentored engineering team members',
            ],
          },
        ],
        education: [
          {
            degree: 'BSc Computer Science',
            institution: 'Example University',
            graduationDate: '2015',
          },
        ],
        skills: [{ name: 'TypeScript' }, { name: 'GraphQL' }],
        certifications: ['AWS Solutions Architect'],
        projects: ['Realtime collaboration platform'],
      },
      jobDetails: {
        title: 'Backend Engineer',
        company: 'Acme Corp',
        description: 'Build and maintain backend services.',
        requirements: ['GraphQL', 'TypeScript'],
      },
      createdAt: new Date('2023-01-01T12:00:00Z').toISOString(),
    };

    const initialParsedFields: ParsedResumeFieldsPayload = {
      id: 'parsed-1',
      userId: 'user-1',
      uploadId,
      parsedSummary: 'Existing parsed summary',
      personalInfo: {
        name: 'Casey Candidate',
        emails: ['casey@example.com'],
        phones: ['555-0100'],
        addresses: ['123 Example Street'],
        websites: ['https://example.com'],
      },
      experience: [
        {
          id: 'parsed-exp-1',
          title: 'Senior Software Engineer',
          company: 'Acme Corp',
          startDate: '2020',
          endDate: '2024',
          description: 'Designed GraphQL APIs for critical services',
        },
      ],
      skills: ['React'],
      education: [
        {
          id: 'parsed-edu-1',
          institution: 'Example University',
          degree: 'BSc Computer Science',
          graduationDate: '2015',
        },
      ],
      certifications: ['AWS Solutions Architect'],
      awards: ['Employee of the Year'],
      hobbies: ['Cycling'],
      createdAt: new Date('2023-01-02T12:00:00Z').toISOString(),
      updatedAt: new Date('2023-01-03T12:00:00Z').toISOString(),
    };

    const cloneParsed = <T>(value: T): T => structuredClone(value);

    const initialHistory: ParsedResumeHistoryEntry[] = [
      {
        id: 'history-1',
        parsedResumeId: initialParsedFields.id,
        userId: initialParsedFields.userId,
        uploadId: initialParsedFields.uploadId,
        snapshot: cloneParsed(initialParsedFields),
        createdAt: new Date('2023-01-03T12:05:00Z').toISOString(),
      },
    ];

    let currentParsedFields: ParsedResumeFieldsPayload = cloneParsed(initialParsedFields);
    let currentHistory: ParsedResumeHistoryEntry[] = [...initialHistory];
    let historyCounter = currentHistory.length;
    let lastUpdatePayload: ParsedResumeUpdateRequest | null = null;

    const nextHistoryEntry = (snapshot: ParsedResumeFieldsPayload): ParsedResumeHistoryEntry => {
      historyCounter += 1;
      return {
        id: `history-${historyCounter}`,
        parsedResumeId: snapshot.id,
        userId: snapshot.userId,
        uploadId: snapshot.uploadId,
        snapshot: cloneParsed(snapshot),
        createdAt: new Date().toISOString(),
      };
    };

    const mergeParsedFields = (
      current: ParsedResumeFieldsPayload,
      update: ParsedResumeUpdateRequest
    ): ParsedResumeFieldsPayload => {
      const now = new Date().toISOString();
      const mergedExperience =
        update.experience?.map((entry, idx) => {
          const existing = current.experience[idx];
          return {
            ...existing,
            ...entry,
            id: entry.id ?? existing?.id ?? `generated-exp-${idx}`,
          };
        }) ?? current.experience;

      const mergedEducation =
        update.education?.map((entry, idx) => {
          const existing = current.education[idx];
          return {
            ...existing,
            ...entry,
            id: entry.id ?? existing?.id ?? `generated-edu-${idx}`,
          };
        }) ?? current.education;

      return {
        ...current,
        parsedSummary: update.parsedSummary ?? current.parsedSummary,
        personalInfo: {
          ...current.personalInfo,
          ...update.personalInfo,
          emails: update.personalInfo?.emails ?? current.personalInfo.emails,
          phones: update.personalInfo?.phones ?? current.personalInfo.phones,
          addresses: update.personalInfo?.addresses ?? current.personalInfo.addresses,
          websites: update.personalInfo?.websites ?? current.personalInfo.websites,
        },
        experience: mergedExperience,
        skills: update.skills ?? current.skills,
        education: mergedEducation,
        certifications: update.certifications ?? current.certifications,
        awards: update.awards ?? current.awards,
        hobbies: update.hobbies ?? current.hobbies,
        updatedAt: now,
      };
    };

    const buildDetailsResponse = (): ResumeDetailsApiResponse => ({
      parsedFields: currentParsedFields,
      history: currentHistory,
      resume: resumeResponse,
    });

    await page.route('**/api/auth/me', async (route): Promise<void> => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          authenticated: true,
          user: { id: 'user-1', email: 'casey@example.com' },
        }),
      });
    });

    await page.route('**/api/resume-details*', async (route): Promise<void> => {
      const url = new URL(route.request().url());
      if (url.searchParams.get('id') !== uploadId) {
        await route.continue();
        return;
      }

      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(buildDetailsResponse()),
        });
        return;
      }

      if (method === 'PUT') {
        const rawBody = route.request().postData() ?? '{}';
        const payload = JSON.parse(rawBody) as ParsedResumeUpdateRequest;
        lastUpdatePayload = payload;
        currentHistory = [nextHistoryEntry(currentParsedFields), ...currentHistory];
        currentParsedFields = mergeParsedFields(currentParsedFields, payload);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            parsedFields: currentParsedFields,
            history: currentHistory,
          }),
        });
        return;
      }

      await route.continue();
    });

    await page.route('**/api/resume-details/history/restore', async (route): Promise<void> => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }

      const rawBody = route.request().postData() ?? '{}';
      const payload = JSON.parse(rawBody) as { uploadId?: string; historyId?: string };
      if (payload.uploadId !== uploadId) {
        await route.continue();
        return;
      }

      const target = currentHistory.find(entry => entry.id === payload.historyId);
      if (!target) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'History entry not found' }),
        });
        return;
      }

      const snapshotBeforeRestore = nextHistoryEntry(currentParsedFields);

      const nextParsedFields: ParsedResumeFieldsPayload = {
        ...cloneParsed(target.snapshot),
        id: currentParsedFields.id,
        updatedAt: new Date().toISOString(),
      };

      currentHistory = [snapshotBeforeRestore, ...currentHistory];
      currentParsedFields = nextParsedFields;

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ parsedFields: currentParsedFields, history: currentHistory }),
      });
    });

    await page.goto(`${webUrl}/resume-details?id=${uploadId}`);

    const historyEntries = page.getByTestId('parsed-history-entry');
    await expect(historyEntries).toHaveCount(1);

    const summaryTextarea = page.getByTestId('parsed-summary-input');
    await expect(summaryTextarea).toHaveValue('Existing parsed summary');

    const addSkillButton = page.getByRole('button', { name: 'Add Skill' });
    const saveButton = page.getByTestId('save-changes-button');
    const saveStatus = page.getByTestId('save-status-message');

    await expect(saveButton).toBeDisabled();
    await expect(saveStatus).toHaveText('All changes saved');

    await addSkillButton.click();
    await expect(page.getByRole('alert')).toHaveText(
      'Select text in the preview to map it to a category.'
    );

    await page.getByTestId('resume-preview').getByText('GraphQL APIs', { exact: false }).dblclick();

    await addSkillButton.click();

    const skillsTextarea = page.getByTestId('skills-textarea');
    await expect(skillsTextarea).toContainText('GraphQL APIs');

    await expect(saveButton).toBeEnabled();
    await expect(saveStatus).toHaveText('Unsaved changes');

    await saveButton.click();

    await expect.poll(() => lastUpdatePayload?.skills ?? []).toContain('GraphQL APIs');

    await expect(saveStatus).toHaveText(/All changes saved.*Syncing/i);
    await expect(saveButton).toBeDisabled();
    await expect(page.getByText('Changes saved')).toBeVisible();

    await expect(saveStatus).toHaveText('All changes saved');
    await expect(historyEntries).toHaveCount(2);

    const restoreButtons = page.getByTestId('parsed-history-restore-button');
    await expect(restoreButtons).toHaveCount(2);

    await restoreButtons.nth(0).click();

    await expect(saveStatus).toHaveText('Restoring snapshot...');
    await expect(saveButton).toBeDisabled();

    await expect.poll(() => currentParsedFields.skills).toEqual(['React']);

    await expect(skillsTextarea).not.toContainText('GraphQL APIs');
    await expect(page.getByText('Snapshot restored')).toBeVisible();

    await expect(saveStatus).toHaveText('All changes saved');
    await expect(historyEntries).toHaveCount(3);

    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('download-parsed-json-button').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe(`parsed-resume-${uploadId}.json`);

    const stream = await download.createReadStream();
    if (!stream) {
      throw new Error('Unable to read exported parsed resume download');
    }
    let downloaded = '';
    for await (const chunk of stream) {
      downloaded += chunk.toString();
    }

    const exported = JSON.parse(downloaded) as { skills?: string[] };
    expect(exported.skills ?? []).toContain('React');
  });
});
