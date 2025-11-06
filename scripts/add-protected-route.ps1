# Script to add ProtectedRoute wrapper to all pages that require authentication
# This ensures unauthenticated users are redirected to the home page

$protectedPages = @(
  "applications",
  "job-intake",
  "tailor",
  "preview",
  "output",
  "settings",
  "resume-builder",
  "compose"
)

$webAppPath = "apps\web\src\app"

foreach ($page in $protectedPages) {
  $pagePath = Join-Path $webAppPath $page "page.tsx"

  if (Test-Path $pagePath) {
    Write-Host "Processing: $pagePath"

    $content = Get-Content $pagePath -Raw

    # Check if already has ProtectedRoute import
    if ($content -notmatch "import.*ProtectedRoute") {
      # Add import after the first 'use client' or at the beginning
      if ($content -match "('use client';?\s*\n)") {
        $content = $content -replace "('use client';?\s*\n)", "`$1import { ProtectedRoute } from '@/components/auth/ProtectedRoute';`n"
      }
      else {
        $content = "import { ProtectedRoute } from '@/components/auth/ProtectedRoute';`n" + $content
      }

      # Find the main return statement and wrap content
      # Look for patterns like: return ( or return (\n
      if ($content -match "(\s+return\s*\(\s*\n\s*<)") {
        $content = $content -replace "(\s+return\s*\(\s*\n)(\s*<)", "`$1`$2<ProtectedRoute>`n`$2"

        # Find the closing of the return statement
        # Look for the pattern: ); at the end before the closing brace of the component
        $content = $content -replace "(\n\s*\)\s*;\s*\n\s*\};\s*\n\s*export)", "`n    </ProtectedRoute>`n  );`n};`nexport"
        $content = $content -replace "(\n\s*\)\s*;\s*\n\}\s*\n\s*export)", "`n    </ProtectedRoute>`n  );`n}`nexport"
      }

      Set-Content -Path $pagePath -Value $content -NoNewline
      Write-Host "[OK] Updated: $page" -ForegroundColor Green

      # Format the file
      npx prettier --write $pagePath 2>&1 | Out-Null
      Write-Host "[OK] Formatted: $page" -ForegroundColor Green
    }
    else {
      Write-Host "⊘ Already protected: $page" -ForegroundColor Yellow
    }
  }
  else {
    Write-Host "[ERROR] Not found: $pagePath" -ForegroundColor Red
  }
}

Write-Host "`nDone! All protected pages have been updated." -ForegroundColor Cyan
