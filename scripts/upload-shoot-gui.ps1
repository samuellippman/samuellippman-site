Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$repoRoot = Split-Path -Parent $PSScriptRoot
$nodeScript = Join-Path $repoRoot 'scripts\upload-shoot.mjs'

$form = New-Object System.Windows.Forms.Form
$form.Text = 'Drone Shoot Uploader'
$form.Width = 640
$form.Height = 480
$form.StartPosition = 'CenterScreen'
$form.FormBorderStyle = 'FixedDialog'
$form.MaximizeBox = $false

$label = New-Object System.Windows.Forms.Label
$label.Text = "Shoot folder (name is used as-is on the site; avoid '#'):"
$label.Location = New-Object System.Drawing.Point(10, 15)
$label.AutoSize = $true
$form.Controls.Add($label)

$pathBox = New-Object System.Windows.Forms.TextBox
$pathBox.Location = New-Object System.Drawing.Point(10, 35)
$pathBox.Width = 500
$form.Controls.Add($pathBox)

$browseButton = New-Object System.Windows.Forms.Button
$browseButton.Text = 'Browse...'
$browseButton.Location = New-Object System.Drawing.Point(520, 34)
$browseButton.Width = 95
$form.Controls.Add($browseButton)

$uploadButton = New-Object System.Windows.Forms.Button
$uploadButton.Text = 'Upload Shoot'
$uploadButton.Location = New-Object System.Drawing.Point(10, 65)
$uploadButton.Width = 605
$uploadButton.Height = 30
$form.Controls.Add($uploadButton)

$logBox = New-Object System.Windows.Forms.TextBox
$logBox.Multiline = $true
$logBox.ScrollBars = 'Vertical'
$logBox.ReadOnly = $true
$logBox.Location = New-Object System.Drawing.Point(10, 105)
$logBox.Width = 605
$logBox.Height = 330
$logBox.Font = New-Object System.Drawing.Font('Consolas', 9)
$form.Controls.Add($logBox)

function Append-Log([string]$text) {
  $logBox.AppendText("$text`r`n")
}

$browseButton.Add_Click({
  $dialog = New-Object System.Windows.Forms.FolderBrowserDialog
  $dialog.Description = "Select the shoot folder (its name is used as-is on the site; avoid '#')"
  if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
    $pathBox.Text = $dialog.SelectedPath
  }
})

$uploadButton.Add_Click({
  $sourcePath = $pathBox.Text.Trim()
  if ([string]::IsNullOrWhiteSpace($sourcePath)) {
    [System.Windows.Forms.MessageBox]::Show('Pick a shoot folder first.', 'Missing folder') | Out-Null
    return
  }

  $uploadButton.Enabled = $false
  $browseButton.Enabled = $false
  $logBox.Clear()
  Append-Log "Starting upload for: $sourcePath"
  Append-Log ''

  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = 'node'
  $psi.Arguments = "`"$nodeScript`" `"$sourcePath`""
  $psi.WorkingDirectory = $repoRoot
  $psi.RedirectStandardOutput = $true
  $psi.UseShellExecute = $false
  $psi.CreateNoWindow = $true

  $process = New-Object System.Diagnostics.Process
  $process.StartInfo = $psi
  $process.Start() | Out-Null

  while (-not $process.StandardOutput.EndOfStream) {
    $line = $process.StandardOutput.ReadLine()
    Append-Log $line
    [System.Windows.Forms.Application]::DoEvents()
  }
  $process.WaitForExit()

  if ($process.ExitCode -eq 0) {
    Append-Log ''
    Append-Log 'DONE.'
    [System.Windows.Forms.MessageBox]::Show('Shoot uploaded and pushed successfully.', 'Success') | Out-Null
  } else {
    Append-Log ''
    Append-Log "FAILED (exit code $($process.ExitCode))."
    [System.Windows.Forms.MessageBox]::Show('Upload failed - check the log for details.', 'Error') | Out-Null
  }

  $uploadButton.Enabled = $true
  $browseButton.Enabled = $true
})

[System.Windows.Forms.Application]::Run($form)
