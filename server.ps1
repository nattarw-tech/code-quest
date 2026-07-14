param(
  [int]$Port = 8000
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving $root at http://localhost:$Port/ (close this window to stop)"

$mime = @{
  ".html" = "text/html"; ".htm" = "text/html"; ".css" = "text/css"; ".js" = "application/javascript";
  ".mjs" = "application/javascript"; ".json" = "application/json"; ".svg" = "image/svg+xml";
  ".png" = "image/png"; ".jpg" = "image/jpeg"; ".ico" = "image/x-icon"; ".wasm" = "application/wasm";
  ".txt" = "text/plain"; ".map" = "application/json"
}

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    try {
      $urlPath = $request.Url.AbsolutePath
      if ($urlPath -eq "/") { $urlPath = "/index.html" }
      $relative = ($urlPath.TrimStart("/") -replace "/", "\")
      $filePath = Join-Path $root $relative
      $full = [System.IO.Path]::GetFullPath($filePath)
      $rootFull = [System.IO.Path]::GetFullPath($root)

      if (-not $full.StartsWith($rootFull)) {
        $response.StatusCode = 403
      }
      elseif (Test-Path $full -PathType Leaf) {
        $ext = [System.IO.Path]::GetExtension($full).ToLower()
        $ct = $mime[$ext]
        if (-not $ct) { $ct = "application/octet-stream" }
        $response.ContentType = $ct
        $bytes = [System.IO.File]::ReadAllBytes($full)
        $response.ContentLength64 = $bytes.Length
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
      }
      else {
        $response.StatusCode = 404
        $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $urlPath")
        $response.OutputStream.Write($msg, 0, $msg.Length)
      }
    }
    catch {
      try { $response.StatusCode = 500 } catch {}
    }
    finally {
      $response.OutputStream.Close()
    }
  }
}
finally {
  $listener.Stop()
}
