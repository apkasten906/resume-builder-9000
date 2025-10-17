$api = 'http://localhost:4000'
function DoGet($path) {
  try {
    $url = "$api$path"
    Write-Host "GET $url"
    $r = Invoke-WebRequest -Uri $url -Method Get -UseBasicParsing -ErrorAction Stop
    Write-Host "Status: $($r.StatusCode)"
    if ($r.Content) { Write-Host "Body length: $($r.Content.Length)" }
  }
  catch {
    $status = $null
    if ($_.Exception.Response -ne $null) { $status = $_.Exception.Response.StatusCode }
    Write-Host "GET $path failed: $status - $($_.Exception.Message)" -ForegroundColor Yellow
  }
}

DoGet '/'
DoGet '/applications'
DoGet '/__test/emails'
DoGet '/__test/clear-emails'
