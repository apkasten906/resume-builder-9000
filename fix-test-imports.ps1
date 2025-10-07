# Check which test files are missing proper test imports
$testFiles = Get-ChildItem -Path "tests\e2e\*.spec.ts" -Recurse

foreach ($file in $testFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8

    # Check if file has playwright test import
    if ($content -notmatch "import.*test.*from.*@playwright/test") {
        Write-Host "Missing test import: $($file.Name)"

        # Add the import at the top
        $lines = Get-Content $file.FullName -Encoding UTF8
        $newContent = @("import { test, expect } from '@playwright/test';") + $lines
        Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8
        Write-Host "Fixed: $($file.Name)"
    }
}

Write-Host "Import check complete!"
