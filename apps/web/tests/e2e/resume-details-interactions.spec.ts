import { test, expect } from '@playwright/test';

test.describe('Resume Details interactions', (): void => {
  test('maps highlighted preview text into skills and saves changes', async ({
    page,
    baseURL,
  }): Promise<void> => {
    const webUrl = baseURL?.toString() ?? '';
    const uploadId = 'upload-123';

    const resumeResponse = {
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
            responsibilities: ['Designed GraphQL APIs for critical services', 'Mentored engineering team members'],
          },
        ],
        education: [
          {
            degree: 'BSc Computer Science',
            institution: 'Example University',
            graduationDate: '2015',
          },
        ],
        skills: [
          { name: 'TypeScript' },
          { name: 'GraphQL' },
        ],
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

    const initialParsedFields = {
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

    const cloneParsed = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
    type HistoryEntry = {
      id: string;
      parsedResumeId: string;
      userId: string;
      uploadId: string | null;
      snapshot: typeof initialParsedFields;
      createdAt: string;
    };

    const initialHistory: HistoryEntry[] = [
      {
        id: 'history-1',
        parsedResumeId: initialParsedFields.id,
        userId: initialParsedFields.userId,
        uploadId: initialParsedFields.uploadId,
        snapshot: cloneParsed(initialParsedFields),
        createdAt: new Date('2023-01-03T12:05:00Z').toISOString(),
      },
    ];

    let currentParsedFields = cloneParsed(initialParsedFields);
    let currentHistory = [...initialHistory];
    let historyCounter = currentHistory.length;
    let lastUpdatePayload: ParsedResumeUpdateRequest | null = null;

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
        const payload = {
          parsedFields: currentParsedFields,
          history: currentHistory,
          resume: resumeResponse,
        };
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(payload),
        });
        return;
      }

      if (method === 'PUT') {
        const rawBody = route.request().postData() ?? '{}';
        const payload = JSON.parse(rawBody) as ParsedResumeUpdateRequest;
        lastUpdatePayload = payload;
        historyCounter += 1;
        const snapshot: HistoryEntry = {
          id: `history-${historyCounter}`,
          parsedResumeId: currentParsedFields.id,
          userId: currentParsedFields.userId,
          uploadId: currentParsedFields.uploadId,
          snapshot: cloneParsed(currentParsedFields),
          createdAt: new Date().toISOString(),
        };
        currentHistory = [snapshot, ...currentHistory];
        currentParsedFields = {
          ...currentParsedFields,
          parsedSummary: payload.parsedSummary ?? currentParsedFields.parsedSummary,
          personalInfo: {
            ...currentParsedFields.personalInfo,
            ...payload.personalInfo,
            emails: payload.personalInfo?.emails ?? currentParsedFields.personalInfo.emails,
            phones: payload.personalInfo?.phones ?? currentParsedFields.personalInfo.phones,
            addresses: payload.personalInfo?.addresses ?? currentParsedFields.personalInfo.addresses,
            websites: payload.personalInfo?.websites ?? currentParsedFields.personalInfo.websites,
          },
          experience: payload.experience ?? currentParsedFields.experience,
          skills: payload.skills ?? currentParsedFields.skills,
          education: payload.education ?? currentParsedFields.education,
          certifications: payload.certifications ?? currentParsedFields.certifications,
          awards: payload.awards ?? currentParsedFields.awards,
          hobbies: payload.hobbies ?? currentParsedFields.hobbies,
          updatedAt: new Date().toISOString(),
        };
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ parsedFields: currentParsedFields, history: currentHistory }),
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

      historyCounter += 1;
      const snapshotBeforeRestore: HistoryEntry = {
        id: `history-${historyCounter}`,
        parsedResumeId: currentParsedFields.id,
        userId: currentParsedFields.userId,
        uploadId: currentParsedFields.uploadId,
        snapshot: cloneParsed(currentParsedFields),
        createdAt: new Date().toISOString(),
      };

      const nextParsedFields = cloneParsed(target.snapshot);
      nextParsedFields.updatedAt = new Date().toISOString();
      nextParsedFields.id = currentParsedFields.id;

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
    await expect(page.getByRole('alert')).toHaveText('Select text in the preview to map it to a category.');

    await page.evaluate((): void => {
      const container = document.querySelector('[data-testid="resume-preview"] pre');
      if (!container) {
        throw new Error('Preview container not found');
      }
      const targetText = 'GraphQL APIs';
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
      let startNode: Text | null = null;
      let startOffset = 0;
      let endOffset = 0;
      while (walker.nextNode()) {
        const node = walker.currentNode as Text;
        const text = node.textContent ?? '';
        const index = text.indexOf(targetText);
        if (index !== -1) {
          startNode = node;
          startOffset = index;
          endOffset = index + targetText.length;
          break;
        }
      }
      if (!startNode) {
        throw new Error('Unable to locate target text for selection');
      }
      const selection = window.getSelection();
      if (!selection) {
        throw new Error('Selection API unavailable');
      }
      selection.removeAllRanges();
      const range = document.createRange();
      range.setStart(startNode, startOffset);
      range.setEnd(startNode, endOffset);
      selection.addRange(range);
    });

    await addSkillButton.click();

    const skillsTextarea = page.getByTestId('skills-textarea');
    await expect(skillsTextarea).toContainText('GraphQL APIs');

    await expect(saveButton).toBeEnabled();
    await expect(saveStatus).toHaveText('Unsaved changes');

    await saveButton.click();

    await expect.poll(() => lastUpdatePayload?.skills ?? []).toContain('GraphQL APIs');

    await expect(saveStatus).toHaveText('All changes saved • Syncing...');
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
    await expect(download.suggestedFilename()).toBe(`parsed-resume-${uploadId}.json`);

    const stream = await download.createReadStream();
    let downloaded = '';
    if (stream) {
      for await (const chunk of stream) {
        downloaded += chunk.toString();
      }
    }

    const exported = JSON.parse(downloaded) as { skills?: string[] };
    expect(exported.skills ?? []).toContain('React');
  });
});

interface ParsedResumeUpdateRequest {
  parsedSummary?: string;
  personalInfo?: {
    name?: string;
    emails?: string[];
    phones?: string[];
    addresses?: string[];
    websites?: string[];
  };
  experience?: Array<Record<string, unknown>>;
  skills?: string[];
  education?: Array<Record<string, unknown>>;
  certifications?: string[];
  awards?: string[];
  hobbies?: string[];
}
