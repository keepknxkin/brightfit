# Build a new iOS production binary with auth + sign-in native modules, then submit to TestFlight.
# Requires: EAS CLI logged in, Apple credentials configured.
#
# BEFORE FIRST BUILD WITH CLOUD SYNC:
#   1. Create a Supabase project and run supabase/schema.sql
#   2. Set EAS production env vars:
#        eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://YOUR_PROJECT.supabase.co" --environment production --visibility plaintext
#        eas env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "YOUR_ANON_KEY" --environment production --visibility sensitive
#   3. Remove the empty env overrides in eas.json production.env (EAS env vars take precedence)

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
$env:EAS_NO_VCS = '1'

Write-Host 'Building iOS production app (includes sign-in native modules)...' -ForegroundColor Cyan
npx eas-cli build --platform ios --profile production --non-interactive

Write-Host ''
Write-Host 'Submitting latest build to TestFlight...' -ForegroundColor Cyan
npx eas-cli submit --platform ios --latest --wait

Write-Host ''
Write-Host 'Done. TestFlight build includes sign-in. Users need a new build to see it.' -ForegroundColor Green
