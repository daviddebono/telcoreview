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
  # Connectivity / infrastructure (ethernet cables)
  "nbn-business-plans-what-to-compare" = "2881224"
  "business-nbn-review-checklist" = "2881224"
  "data-link-and-internet-review-for-business" = "2881224"
  "telecommunications-risk-and-continuity-review" = "4508751"

  # Contact centre / support (headset)
  "contact-centre-telephony-options-australia" = "8192252"
  "contact-centre-review-questions" = "8192252"

  # Desk / documents / review (laptop/desk)
  "telecommunications-review-work" = "1586996"
  "when-to-review-business-telecommunications" = "1586996"
  "contract-renewal-telecommunications-review" = "1586996"
  "telecommunications-contract-review-guide" = "7643737"
  "telecommunications-bill-review-before-contract-renews" = "7845307"
  "telecommunications-audit-vs-review" = "7845307"
  "telecommunications-review-stakeholders-and-governance" = "7845307"
  "multi-site-telecommunications-review" = "7643737"

  # Mobile / devices (smartphone + desk)
  "mobile-phone-bill-review" = "4476635"
  "consolidating-business-mobile-plans" = "4476635"
  "business-mobile-fleet-review-guide" = "7971544"

  # Voice / Teams Calling (generic office work)
  "business-phone-systems-cloud-vs-on-premise" = "1586996"
  "business-phone-system-review-checklist" = "1586996"
  "reviewing-microsoft-teams-calling-costs" = "1586996"
  "reviewing-microsoft-teams-calling-functionality" = "1586996"
  "reviewing-microsoft-teams-calling-integrations" = "1586996"
  "reviewing-microsoft-teams-calling-complexity-and-support" = "1586996"

  # Aggregation / inbound numbers (desk/work)
  "single-bill-telecommunications-aggregation" = "7845307"
  "1300-1800-numbers-routing-and-providers" = "7845307"
  "how-to-brief-an-independent-telecommunications-review" = "7643737"
}

foreach ($k in $map.Keys) {
  Download-UnsplashJpgVariants -PhotoId $map[$k] -BaseName $k
}

Write-Host "Done. Images saved to $outDir"

