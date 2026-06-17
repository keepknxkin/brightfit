$ErrorActionPreference = 'Stop'
$state = Get-Content 'c:\Users\881de\Downloads\BrightFit\.superwall\state.json' -Raw | ConvertFrom-Json
function CallTool([string]$name, [hashtable]$argsObj) {
  $body = (@{ toolName = $name; args = $argsObj } | ConvertTo-Json -Compress -Depth 40)
  $bodyFile = Join-Path $env:TEMP 'sw-call-body.json'
  [System.IO.File]::WriteAllText($bodyFile, $body)
  $resp = curl.exe -sS -X POST -H "Authorization: Bearer $($state.controllerToken)" -H 'Content-Type: application/json' --data-binary "@$bodyFile" "$($state.baseUrl)/editor-sessions/$($state.sessionId)/call-tool"
  $json = $resp | ConvertFrom-Json
  if ($json.isError) { throw ($json.content[0].text) }
  return $json
}
CallTool 'start_working_on_nodes' @{ nodeIds = @('page:page') } | Out-Null
$tree = (CallTool 'get_subtree' @{ nodeIds = @('page:page') }).content[0].text | ConvertFrom-Json
function Walk($n) {
  $line = "$($n.id)|$($n.type)|$($n.name)|$($n.textContent)"
  Write-Output $line
  foreach ($c in $n.children) { Walk $c }
}
Walk $tree
