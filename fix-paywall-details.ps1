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

CallTool 'start_working_on_nodes' @{ nodeIds = @('node:Ax8bxKAjk7G1CERKBIDEn') } | Out-Null

CallTool 'set_text_content' @{
  updates = @(
    @{ nodeId = 'node:-lBmjUtcifM88Uu3-YUkZ'; textContent = 'BEST VALUE' }
    @{ nodeId = 'node:3PnpNqdUruZLI7WZgzQX7'; textContent = 'BRIGHTFIT PLUS ✨' }
    @{ nodeId = 'node:JYVBJvaPtBCDjBY3ddM1V'; textContent = 'Monthly' }
    @{ nodeId = 'node:2sYIoCx9E3HliYlhgL_gH'; textContent = '$59.99/Yr' }
  )
} | Out-Null

# Reorder yearly card: badge first, then row, then equivalent
CallTool 'move_nodes' @{
  moves = @(
    @{ nodeId = 'node:KC8BDPQIhYwckF7oFPtKj'; targetNodeId = 'node:ISRrIuYwCsx45cr1g-ByE'; position = 'before' }
  )
} | Out-Null

# Ensure yearly left labels exist
$yearlyLeftHtml = @'
<div style="display:flex; flex-direction:column; gap:2px; align-items:flex-start;">
  <span style="font-size:16px; font-weight:700; color:#FFFFFF; font-family:Inter,sans-serif;">Yearly Plan</span>
  <span style="font-size:14px; font-weight:700; color:#FFD700; font-family:Inter,sans-serif;">Save 66%</span>
</div>
'@
CallTool 'write_html' @{ targetNodeId = 'node:3a1sLwN3_MRpXsqiBKF2B'; mode = 'replace'; html = $yearlyLeftHtml } | Out-Null

# Monthly price if missing
$monthlyPriceHtml = '<span style="font-size:16px; font-weight:700; color:#FFFFFF; font-family:Inter,sans-serif;">$12.99/Month</span>'
CallTool 'write_html' @{ targetNodeId = 'node:XTTYOAWrxHj1X_Tcc2iTM'; mode = 'replace'; html = $monthlyPriceHtml } | Out-Null

CallTool 'finish_working_on_nodes' @{ nodeIds = @('page:page') } | Out-Null
Write-Output 'fixes-done'
