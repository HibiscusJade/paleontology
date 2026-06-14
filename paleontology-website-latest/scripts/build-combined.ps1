# =============================================================================
# Combined Build Script
# Builds admin + main website into a single deployable directory.
# Both apps share the same origin → localStorage (paleo_* keys) works across them.
#
# Output structure:
#   dist/public/               ← Main website
#     index.html
#     assets/
#   dist/public/admin/         ← Admin backend
#     index.html
#     assets/
#
# Usage:
#   pwsh scripts/build-combined.ps1
#   pwsh scripts/build-combined.ps1 -Serve     # Build + start dev server
#   pwsh scripts/build-combined.ps1 -Clean     # Clean dist before building
# =============================================================================

param(
  [switch]$Serve,
  [switch]$Clean
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$AdminProject = Join-Path (Split-Path -Parent $Root) "paleontology-admin-latest"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Combined Build: Admin + Main Website" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build main website first (with emptyOutDir: true, so it clears dist/)
Write-Host "[1/3] Building main website..." -ForegroundColor Yellow
Push-Location $Root
try {
  if ($Clean) {
    Write-Host "  Cleaning main dist..." -ForegroundColor Gray
    Remove-Item -Recurse -Force (Join-Path $Root "dist") -ErrorAction SilentlyContinue
  }
  pnpm build
  if ($LASTEXITCODE -ne 0) { throw "Main website build failed" }
  Write-Host "  Main website build OK" -ForegroundColor Green
} finally {
  Pop-Location
}

# Step 2: Build admin with base /admin/
Write-Host "[2/3] Building admin backend..." -ForegroundColor Yellow
Push-Location $AdminProject
try {
  if ($Clean) {
    Write-Host "  Cleaning admin dist..." -ForegroundColor Gray
    Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
  }
  pnpm build:combined
  if ($LASTEXITCODE -ne 0) { throw "Admin build failed" }
  Write-Host "  Admin build OK" -ForegroundColor Green
} finally {
  Pop-Location
}

# Step 3: Copy admin dist into main project (AFTER main build to avoid emptyOutDir wipe)
Write-Host "[3/3] Copying admin into main project..." -ForegroundColor Yellow
$AdminDist = Join-Path $AdminProject "dist"
$TargetAdminDir = Join-Path $Root "dist\public\admin"
New-Item -ItemType Directory -Force -Path $TargetAdminDir | Out-Null
Copy-Item -Recurse -Force "$AdminDist\*" $TargetAdminDir
Write-Host "  Admin copied to dist/public/admin/" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Build Complete!" -ForegroundColor Green
Write-Host "  Output: dist/public/" -ForegroundColor Cyan
Write-Host "    - Main site: http://localhost:3000/" -ForegroundColor Cyan
Write-Host "    - Admin:     http://localhost:3000/admin/" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($Serve) {
  Write-Host ""
  Write-Host "Starting preview server..." -ForegroundColor Yellow
  Push-Location $Root
  try {
    pnpm preview
  } finally {
    Pop-Location
  }
}
