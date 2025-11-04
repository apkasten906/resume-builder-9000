import type { ParsedRegion } from '../models/parsed-region.js';
import type { UserProfileDraft } from '../models/user-profile-draft.js';

/**
 * Map parsed regions into a minimal UserProfileDraft structure.
 * This is a simple heuristic mapper for the MVP.
 */
export function parsedRegionsToProfileDraft(
  regions: ParsedRegion[],
  userId = 'test-user'
): UserProfileDraft {
  const draft: UserProfileDraft = {
    userId,
    personalInfo: {},
    experiences: [],
    education: [],
    skills: [],
    sourceResumeId: null,
  };

  // Very small heuristic: treat regions with category 'contact' as personalInfo blob
  regions.forEach((r: ParsedRegion) => {
    if (r.category === 'contact') {
      // naive extraction: split lines and set to personalInfo.name/text
      const lines = r.text
        .split(/\r?\n/)
        .map((s: string) => s.trim())
        .filter(Boolean);
      if (lines.length > 0) draft.personalInfo = { ...draft.personalInfo, name: lines[0] };
    }
    if (r.category === 'experience') {
      draft.experiences!.push({ title: r.text });
    }
    if (r.category === 'education') {
      draft.education!.push({ degree: r.text });
    }
    if (r.category === 'skill') {
      draft.skills!.push(r.text);
    }
  });

  return draft;
}

export default parsedRegionsToProfileDraft;
import type { ParsedRegion } from '../models/parsed-region.js';
import type { UserProfileDraft } from '../models/user-profile-draft.js';

/**
 * Map parsed regions into a minimal UserProfileDraft structure.
 * This is a simple heuristic mapper for the MVP.
 */
export function parsedRegionsToProfileDraft(
  regions: ParsedRegion[],
  userId = 'test-user'
): UserProfileDraft {
  const draft: UserProfileDraft = {
    userId,
    personalInfo: {},
    experiences: [],
    education: [],
    skills: [],
    sourceResumeId: null,
  };

  // Very small heuristic: treat regions with category 'contact' as personalInfo blob
  regions.forEach((r: ParsedRegion) => {
    if (r.category === 'contact') {
      // naive extraction: split lines and set to personalInfo.name/text
      import type { ParsedRegion } from '../models/parsed-region';
      import type { UserProfileDraft } from '../models/user-profile-draft';

      /**
       * Map parsed regions into a minimal UserProfileDraft structure.
       * This is a simple heuristic mapper for the MVP.
       */
      export function parsedRegionsToProfileDraft(
        regions: ParsedRegion[],
        userId = 'test-user'
      ): UserProfileDraft {
        const draft: UserProfileDraft = {
          userId,
          personalInfo: {},
          experiences: [],
          education: [],
          skills: [],
          sourceResumeId: null,
        };

        // Very small heuristic: treat regions with category 'contact' as personalInfo blob
        regions.forEach((r: ParsedRegion) => {
          if (r.category === 'contact') {
            // naive extraction: split lines and set to personalInfo.name/text
            const lines = r.text
              .split(/\r?\n/)
              .map((s: string) => s.trim())
              .filter(Boolean);
            if (lines.length > 0) draft.personalInfo = { ...draft.personalInfo, name: lines[0] };
          }
          if (r.category === 'experience') {
            draft.experiences!.push({ title: r.text });
          }
          if (r.category === 'education') {
            draft.education!.push({ degree: r.text });
          }
          if (r.category === 'skill') {
            draft.skills!.push(r.text);
          }
        });

        return draft;
      }

      export default parsedRegionsToProfileDraft;

        .map((s: string) => s.trim())
        import type { ParsedRegion } from '../models/parsed-region';
        import type { UserProfileDraft } from '../models/user-profile-draft';

        /**
         * Map parsed regions into a minimal UserProfileDraft structure.
         * This is a simple heuristic mapper for the MVP.
         */
        export function parsedRegionsToProfileDraft(
          regions: ParsedRegion[],
          userId = 'test-user'
        ): UserProfileDraft {
          const draft: UserProfileDraft = {
            userId,
            personalInfo: {},
            experiences: [],
            education: [],
            skills: [],
            sourceResumeId: null,
          };

          // Very small heuristic: treat regions with category 'contact' as personalInfo blob
          regions.forEach((r: ParsedRegion) => {
            if (r.category === 'contact') {
              // naive extraction: split lines and set to personalInfo.name/text
              const lines = r.text
                .split(/\r?\n/)
                .map((s: string) => s.trim())
                .filter(Boolean);
              if (lines.length > 0) draft.personalInfo = { ...draft.personalInfo, name: lines[0] };
            }
            if (r.category === 'experience') {
              draft.experiences!.push({ title: r.text });
            }
            if (r.category === 'education') {
              draft.education!.push({ degree: r.text });
            }
            if (r.category === 'skill') {
              draft.skills!.push(r.text);
            }
          });

          return draft;
        }

        export default parsedRegionsToProfileDraft;
