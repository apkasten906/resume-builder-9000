# Theming & Tokens (RB9K UI Refresh)

This kit adds token-driven theming to **apps/web** with:

- `tokens.css` (light, dark, optional brand overlay),
- Tailwind color mapping to tokens,
- updated UI primitives (Button, Card, Badge, Input, Textarea, Tabs),
- a `/style-guide` page to preview themes.

## Install

1. **Add styles** under `apps/web/src/styles/`:
   - `tokens.css`
   - `animations.css`

2. **Wire into global CSS** (keep your `globals.css`):

   ```css
   /* apps/web/src/app/globals.css */
   @tailwind base;
   @tailwind components;
   @tailwind utilities;

   @import '@/styles/tokens.css';
   @import '@/styles/animations.css';
   ```

3. **Update Tailwind config** (`apps/web/tailwind.config.js`):
   - Replace with the provided file **or** merge the `theme.extend.colors` mapping and `darkMode` setting.
   - We left plugins to just `typography` to avoid new deps.

4. **Swap UI primitives** (drop-in replacements):
   - Replace files in `apps/web/src/components/ui/` with the provided versions for:
     - `Button.tsx`, `Badge.tsx`, `Card.tsx`, `Input.tsx`, `Textarea.tsx`, `Tabs.tsx`
   - These use token utilities like `bg-card`, `text-foreground`, `ring-ring`.

5. **Preview**: start the app and visit `/style-guide`. Toggle **Light / Dark / brand-emerald**.

## Notes

- Tokens are defined via CSS variables and consumed by Tailwind utilities (e.g., `bg-primary` maps to `hsl(var(--primary))`).
- Dark mode works via either `class="dark"` or `[data-theme="dark"]` on `<html>`.
- Brand overlays use `[data-theme="brand-emerald"]`—easy to clone for more brands.
