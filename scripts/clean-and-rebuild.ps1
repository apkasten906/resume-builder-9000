# Clean and Rebuild Script for Resume Builder 9000 Monorepo
# Usage: powershell -ExecutionPolicy Bypass -File ./scripts/clean-and-rebuild.ps1

Write-Host "Cleaning node_modules, .next, dist, and lock files..."

# Remove root and workspace node_modules
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force package-lock.json -ErrorAction SilentlyContinue

# Remove workspace node_modules and build artifacts
$workspaces = @(
  "apps/web",
  "packages/core",
  "packages/api"
)
foreach ($ws in $workspaces) {
  Remove-Item -Recurse -Force "$ws/node_modules" -ErrorAction SilentlyContinue
  Remove-Item -Recurse -Force "$ws/.next" -ErrorAction SilentlyContinue
  Remove-Item -Recurse -Force "$ws/dist" -ErrorAction SilentlyContinue
  Remove-Item -Recurse -Force "$ws/package-lock.json" -ErrorAction SilentlyContinue
}

Write-Host "Reinstalling dependencies..."
npm install

Write-Host "Rebuilding all packages..."
npm run build

Write-Host "Clean and rebuild complete."
