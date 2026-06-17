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
$ids = @('node:3a1sLwN3_MRpXsqiBKF2B','node:ISRrIuYwCsx45cr1g-ByE','node:Ax8bxKAjk7G1CERKBIDEn','node:0iohBie2gqbd07nh7kEKK','node:JYVBJvaPtBCDjBY3ddM1V','node:XTTYOAWrxHj1X_Tcc2iTM')
foreach ($id in $ids) {
  $info = (CallTool 'get_node_info' @{ nodeId = $id }).content[0].text | ConvertFrom-Json
  Write-Output "=== $id ==="
  Write-Output ($info | ConvertTo-Json -Compress -Depth 8)
}
