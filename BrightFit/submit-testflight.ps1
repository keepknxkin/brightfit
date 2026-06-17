# Upload the latest iOS production build to TestFlight.
# You will be prompted for Apple ID 2FA (use nathanowojori@gmail.com).
#
# NOTE: Sign-in requires a NEW production build first (native modules changed).
# Run build-testflight.ps1 to build + submit, or:
#   npx eas-cli build --platform ios --profile production

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
$env:EAS_NO_VCS = '1'

Write-Host 'Submitting latest iOS build to TestFlight...' -ForegroundColor Cyan
npx eas-cli submit --platform ios --latest --wait

Write-Host ''
Write-Host 'Done. Open App Store Connect > BrightFit > TestFlight to see build processing.' -ForegroundColor Green
