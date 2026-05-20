$files = @(
  'src/app/appp/page.tsx',
  'src/app/arcade/page.tsx',
  'src/app/chat/page.tsx',
  'src/app/favorites/page.tsx',
  'src/app/games/page.tsx',
  'src/app/hot/page.tsx',
  'src/app/languages/page.tsx',
  'src/app/live-casino/page.tsx',
  'src/app/manual/page.tsx',
  'src/app/mission/page.tsx',
  'src/app/pvp/page.tsx',
  'src/app/roulette/page.tsx',
  'src/app/table/page.tsx',
  'src/app/vip/page.tsx',
  'src/components/LiveCasino.tsx'
)

foreach ($f in $files) {
  if (Test-Path $f) {
    $content = Get-Content $f -Raw
    $updated = $content -replace 'lenght=\{', 'length={'
    Set-Content $f $updated -NoNewline
    Write-Host "Fixed: $f"
  } else {
    Write-Host "Not found: $f"
  }
}

# Fix invitationRewareds -> invitationRewards
$rewardFiles = @(
  'src/app/api/invitation-bonus/[id]/route.tsx',
  'src/app/api/seed/rewards/route.tsx'
)
foreach ($f in $rewardFiles) {
  if (Test-Path $f) {
    $content = Get-Content $f -Raw
    $updated = $content -replace 'invitationRewareds', 'invitationRewards'
    Set-Content $f $updated -NoNewline
    Write-Host "Fixed invitationRewareds in: $f"
  }
}

# Fix StaticticType -> StatisticType
$overviewFile = 'src/app/(protected)/invite-friends/overview.tsx'
if (Test-Path $overviewFile) {
  $content = Get-Content $overviewFile -Raw
  $updated = $content -replace 'StaticticType', 'StatisticType'
  Set-Content $overviewFile $updated -NoNewline
  Write-Host "Fixed StaticticType in overview.tsx"
}

# Fix InviationRewardGetOutput -> InvitationRewardGetOutput
$sliceFile = 'src/lib/features/rewardApiSlice.ts'
if (Test-Path $sliceFile) {
  $content = Get-Content $sliceFile -Raw
  $updated = $content -replace 'InviationRewardGetOutput', 'InvitationRewardGetOutput'
  Set-Content $sliceFile $updated -NoNewline
  Write-Host "Fixed InviationRewardGetOutput in rewardApiSlice.ts"
}

# Fix isClamed -> isClaimed in rewards.tsx
$rewardsFile = 'src/app/(protected)/invite-friends/rewards.tsx'
if (Test-Path $rewardsFile) {
  $content = Get-Content $rewardsFile -Raw
  $updated = $content -replace 'isClamed', 'isClaimed'
  Set-Content $rewardsFile $updated -NoNewline
  Write-Host "Fixed isClamed in rewards.tsx"
}

Write-Host "`nAll fixes applied!"
