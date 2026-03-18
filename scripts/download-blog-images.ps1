Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$root = "c:\Users\debon\Documents\Telco Review"
$outDir = Join-Path $root "assets\blog"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

function Download-UnsplashJpgVariants {
  param(
    [Parameter(Mandatory=$true)][string]$PhotoId,
    [Parameter(Mandatory=$true)][string]$BaseName
  )

  $sizes = @(480, 800, 1200)
  foreach ($w in $sizes) {
    $h = [int][Math]::Round($w * 9 / 16)
    # Pexels image CDN supports resizing/cropping via query params
    $url = "https://images.pexels.com/photos/$($PhotoId)/pexels-photo-$($PhotoId).jpeg?auto=compress&cs=tinysrgb&w=$w&h=$h&fit=crop"
    $dest = Join-Path $outDir "$BaseName-$w.jpg"
    Write-Host "Downloading $dest"
    try {
      Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing -Headers @{ "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) TelcoReviewBot/1.0" }
    } catch {
      Write-Warning "Failed to download $url"
      throw
    }
  }
}

# Mapping: page slug -> Unsplash photo ID (royalty-free under Unsplash license)
# Note: These are intentionally generic/enterprise-friendly.
$map = @{
  # Make every post unique (Pexels photo IDs)
  "telecommunications-review-work" = "3153199"
  "mobile-phone-bill-review" = "7971544"
  "when-to-review-business-telecommunications" = "1181421"
  "business-phone-systems-cloud-vs-on-premise" = "7710141"
  "nbn-business-plans-what-to-compare" = "2881224"
  "consolidating-business-mobile-plans" = "29205845"
  "contact-centre-telephony-options-australia" = "8192252"
  "1300-1800-numbers-routing-and-providers" = "261679"
  "single-bill-telecommunications-aggregation" = "5915236"
  "contract-renewal-telecommunications-review" = "3760067"
  "telecommunications-bill-review-before-contract-renews" = "7845307"
  "business-nbn-review-checklist" = "9798657"
  "business-mobile-fleet-review-guide" = "4491490"
  "telecommunications-risk-and-continuity-review" = "325229"
  "multi-site-telecommunications-review" = "32866724"
  "business-phone-system-review-checklist" = "1181345"
  "contact-centre-review-questions" = "8192187"
  "telecommunications-contract-review-guide" = "7415115"
  "telecommunications-audit-vs-review" = "7567551"
  "how-to-brief-an-independent-telecommunications-review" = "30535630"
  "data-link-and-internet-review-for-business" = "4508751"
  "telecommunications-review-stakeholders-and-governance" = "7173047"
  "reviewing-microsoft-teams-calling-costs" = "8872388"
  "reviewing-microsoft-teams-calling-functionality" = "6326064"
  "reviewing-microsoft-teams-calling-integrations" = "15543114"
  "reviewing-microsoft-teams-calling-complexity-and-support" = "3582392"
}

foreach ($k in $map.Keys) {
  Download-UnsplashJpgVariants -PhotoId $map[$k] -BaseName $k
}

Write-Host "Done. Images saved to $outDir"

