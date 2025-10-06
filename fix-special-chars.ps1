# Fix special characters in test files that cause encoding issues on Windows
$testFiles = @(
    "apps\web\tests\e2e\authentication-flow-integration.spec.ts",
    "apps\web\tests\e2e\infinite-loop-prevention.spec.ts",
    "apps\web\tests\e2e\navigation-visibility-regression.spec.ts"
)

foreach ($file in $testFiles) {
    if (Test-Path $file) {
        Write-Host "Processing $file..."
        $content = Get-Content $file -Raw -Encoding UTF8
        $content = $content -replace '✅', '[PASS]'
        Set-Content $file $content -Encoding UTF8
        Write-Host "Fixed $file"
    } else {
        Write-Host "File not found: $file"
    }
}

Write-Host "Special character replacement complete!"
