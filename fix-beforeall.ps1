# Fix beforeAll usage in Playwright test files
$testFiles = Get-ChildItem -Path "tests\e2e\*.spec.ts" -Recurse

foreach ($file in $testFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8

    # Replace standalone beforeAll with test.beforeAll
    $content = $content -replace "(?m)^beforeAll\s*\(", "test.beforeAll("

    # Replace standalone afterAll with test.afterAll
    $content = $content -replace "(?m)^afterAll\s*\(", "test.afterAll("

    # Replace standalone beforeEach with test.beforeEach
    $content = $content -replace "(?m)^beforeEach\s*\(", "test.beforeEach("

    # Replace standalone afterEach with test.afterEach
    $content = $content -replace "(?m)^afterEach\s*\(", "test.afterEach("

    Set-Content -Path $file.FullName -Value $content -Encoding UTF8
    Write-Host "Fixed: $($file.Name)"
}

Write-Host "All beforeAll/afterAll/beforeEach/afterEach references have been fixed!"
