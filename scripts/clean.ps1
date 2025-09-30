scripts/clean.ps1
# Clean and Rebuild Script for Resume Builder 9000 Monorepo
# Usage: powershell -ExecutionPolicy Bypass -File ./scripts/clean-and-rebuild.ps1


Write-Host "Cleaning node_modules, .next, dist, lock files, build caches, and logs..."


# Remove root and workspace node_modules and lock files
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force package-lock.json -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force pnpm-lock.yaml -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force yarn.lock -ErrorAction SilentlyContinue

# Remove root build artifacts, caches, and logs
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force coverage -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .cache -ErrorAction SilentlyContinue
Get-ChildItem -Recurse -Include *.tsbuildinfo,*.log -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue


# Remove workspace node_modules, build artifacts, caches, logs, and lock files
$workspaces = @(
  "apps/web",
  "packages/core",
  "packages/api"
)
foreach ($ws in $workspaces) {
  Remove-Item -Recurse -Force "$ws/node_modules" -ErrorAction SilentlyContinue
  Remove-Item -Recurse -Force "$ws/.next" -ErrorAction SilentlyContinue
  Remove-Item -Recurse -Force "$ws/dist" -ErrorAction SilentlyContinue
  Remove-Item -Recurse -Force "$ws/coverage" -ErrorAction SilentlyContinue
  Remove-Item -Recurse -Force "$ws/.cache" -ErrorAction SilentlyContinue
  Remove-Item -Recurse -Force "$ws/package-lock.json" -ErrorAction SilentlyContinue
  Remove-Item -Recurse -Force "$ws/pnpm-lock.yaml" -ErrorAction SilentlyContinue
  Remove-Item -Recurse -Force "$ws/yarn.lock" -ErrorAction SilentlyContinue
  Get-ChildItem -Path $ws -Recurse -Include *.tsbuildinfo,*.log -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
}


Write-Host "Cleaning npm cache..."
npm cache clean --force

Write-Host "Clean complete."
