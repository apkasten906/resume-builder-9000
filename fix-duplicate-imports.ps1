# Fix duplicate test and expect imports
$testFiles = Get-ChildItem -Path "tests\e2e\*.spec.ts" -Recurse

foreach ($file in $testFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8

    # Check if file has duplicate imports
    if ($content -match "import.*test.*expect.*from.*@playwright/test" -and
        ($content -match "import.*test.*from.*test-setup" -or
         $content -match "import.*expect.*from.*test-setup" -or
         $content -match "import.*testWithAuth.*expect.*from.*test-setup")) {

        Write-Host "Fixing duplicate imports in: $($file.Name)"

        # Remove the duplicate import line with test-setup
        $content = $content -replace "import.*test.*expect.*from.*['""`"]\.\/test-setup['""`"];?[\r\n]*", ""
        $content = $content -replace "import.*expect.*testWithAuth.*from.*['""`"]\.\/test-setup['""`"];?[\r\n]*", ""
        $content = $content -replace "import.*testWithAuth.*expect.*from.*['""`"]\.\/test-setup['""`"];?[\r\n]*", ""
        $content = $content -replace "import.*test.*from.*['""`"]\.\/test-setup['""`"];?[\r\n]*", ""

        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
        Write-Host "Fixed duplicates in: $($file.Name)"
    }
}

Write-Host "Duplicate import fix complete!"
