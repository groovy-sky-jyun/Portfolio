param(
  [Parameter(Mandatory)][string]$InDir,
  [Parameter(Mandatory)][string]$OutDir,
  [int]$Bitrate = 2500000,
  [string]$Only = ''
)
# Re-encodes MP4s using Windows' built-in Media Foundation transcoder (no extra install).
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
$null = [Windows.Storage.StorageFolder, Windows.Storage, ContentType = WindowsRuntime]
$null = [Windows.Media.Transcoding.MediaTranscoder, Windows.Media.Transcoding, ContentType = WindowsRuntime]
$null = [Windows.Media.MediaProperties.MediaEncodingProfile, Windows.Media.MediaProperties, ContentType = WindowsRuntime]

$asTaskOp = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
  $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and
  $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]
$asTaskAct = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
  $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and
  $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncActionWithProgress`1' })[0]

function Await($op, [type]$t) {
  $task = $asTaskOp.MakeGenericMethod($t).Invoke($null, @($op))
  $task.Wait(); $task.Result
}
function AwaitProgress($op) {
  $task = $asTaskAct.MakeGenericMethod([double]).Invoke($null, @($op))
  $task.Wait()
}

New-Item -ItemType Directory -Force $OutDir | Out-Null
$outFolder = Await ([Windows.Storage.StorageFolder]::GetFolderFromPathAsync((Resolve-Path $OutDir).Path)) ([Windows.Storage.StorageFolder])

Get-ChildItem -LiteralPath $InDir -Filter *.mp4 | ForEach-Object {
  if ($Only -and $_.Name -notlike $Only) { return }
  $src = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($_.FullName)) ([Windows.Storage.StorageFile])
  $srcProfile = Await ([Windows.Media.MediaProperties.MediaEncodingProfile]::CreateFromFileAsync($src)) ([Windows.Media.MediaProperties.MediaEncodingProfile])
  $v = $srcProfile.Video
  $fps = if ($v.FrameRate.Denominator) { $v.FrameRate.Numerator / $v.FrameRate.Denominator } else { 0 }
  $hasAudio = [bool]$srcProfile.Audio
  Write-Output ("{0}: {1}x{2} {3:n1}fps {4:n0}kbps audio={5}" -f $_.Name, $v.Width, $v.Height, $fps, ($v.Bitrate/1000), $hasAudio)
  if ($Bitrate -le 0) { return }

  $profile = [Windows.Media.MediaProperties.MediaEncodingProfile]::CreateMp4([Windows.Media.MediaProperties.VideoEncodingQuality]::HD720p)
  $h = [int]($v.Height); $w = [int]($v.Width)
  if ($h -gt 720) { $w = [int]([math]::Round($w * 720 / $h / 2) * 2); $h = 720 }
  $profile.Video.Width = $w; $profile.Video.Height = $h
  $profile.Video.Bitrate = $Bitrate
  $profile.Video.FrameRate.Numerator = 30; $profile.Video.FrameRate.Denominator = 1
  $profile.Audio = $null

  $outName = ($_.BaseName.Trim()) + '.mp4'
  $dst = Await ($outFolder.CreateFileAsync($outName, [Windows.Storage.CreationCollisionOption]::ReplaceExisting)) ([Windows.Storage.StorageFile])
  $tc = New-Object Windows.Media.Transcoding.MediaTranscoder
  $prep = Await ($tc.PrepareFileTranscodeAsync($src, $dst, $profile)) ([Windows.Media.Transcoding.PrepareTranscodeResult])
  if (-not $prep.CanTranscode) { Write-Output "  cannot transcode: $($prep.FailureReason)"; return }
  AwaitProgress ($prep.TranscodeAsync())
  $len = (Get-Item -LiteralPath (Join-Path $OutDir $outName)).Length
  Write-Output ("  -> {0} {1}x{2} {3:n1} MB" -f $outName, $w, $h, ($len/1MB))
}
