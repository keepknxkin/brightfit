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

CallTool 'set_click_behavior' @{
  updates = @(
    @{
      nodeIds = @('node:Ax8bxKAjk7G1CERKBIDEn')
      preserveLockedActions = $false
      behavior = @{ animation = 'scale-out-in'; hapticFeedback = 'selection'; actions = @(@{ type = 'set-product-index'; index = 0 }) }
    }
    @{
      nodeIds = @('node:YJnSDhU2vfFwtgQzGvC0f')
      preserveLockedActions = $false
      behavior = @{ animation = 'scale-out-in'; hapticFeedback = 'selection'; actions = @(@{ type = 'set-product-index'; index = 1 }) }
    }
    @{
      nodeIds = @('node:CgTmdaobdBrRjb9QrOUFV')
      preserveLockedActions = $false
      behavior = @{ animation = 'scale-out-in'; hapticFeedback = 'medium'; actions = @(@{ type = 'purchase'; reference = @{ type = 'by-selected' } }) }
    }
  )
} | Out-Null

$body = @'
{"toolName":"set_dynamic_value","args":{"updates":[
{"nodeIds":["node:Ax8bxKAjk7G1CERKBIDEn"],"property":"borderColor","preserveExistingFallback":false,"cases":[
{"query":{"combinator":"and","rules":[{"field":"state:products.selectedIndex","operator":"=","valueSource":"value","value":0}]},"value":"#FFD700"},
{"query":{"combinator":"and","rules":[]},"value":"#3A3A3C"}]},
{"nodeIds":["node:YJnSDhU2vfFwtgQzGvC0f"],"property":"borderColor","preserveExistingFallback":false,"cases":[
{"query":{"combinator":"and","rules":[{"field":"state:products.selectedIndex","operator":"=","valueSource":"value","value":1}]},"value":"#FFD700"},
{"query":{"combinator":"and","rules":[]},"value":"#3A3A3C"}]},
{"nodeIds":["node:mlH2eaLDCQEXfMz0pPgYS"],"property":"opacity","preserveExistingFallback":false,"cases":[
{"query":{"combinator":"and","rules":[{"field":"state:products.selectedIndex","operator":"=","valueSource":"value","value":0}]},"value":"100%"},
{"query":{"combinator":"and","rules":[]},"value":"0%"}]},
{"nodeIds":["node:vfkMncgMWmLib_1Itm8yd"],"property":"opacity","preserveExistingFallback":false,"cases":[
{"query":{"combinator":"and","rules":[{"field":"state:products.selectedIndex","operator":"=","valueSource":"value","value":1}]},"value":"100%"},
{"query":{"combinator":"and","rules":[]},"value":"0%"}]},
{"nodeIds":["node:nAsxb78Cqn9z_Z6JoQ56K"],"property":"text","preserveExistingFallback":false,"cases":[
{"query":{"combinator":"and","rules":[{"field":"state:products.selectedIndex","operator":"=","valueSource":"value","value":1}]},"value":"Start Now\n"},
{"query":{"combinator":"and","rules":[{"field":"state:products.hasIntroductoryOffer","operator":"=","valueSource":"value","value":true}]},"value":"Start My 3 Day Trial\n"},
{"query":{"combinator":"and","rules":[]},"value":"Start Now\n"}]}
]}}
'@
$bodyFile = Join-Path $env:TEMP 'sw-call-body.json'
[System.IO.File]::WriteAllText($bodyFile, $body)
$resp = curl.exe -sS -X POST -H "Authorization: Bearer $($state.controllerToken)" -H 'Content-Type: application/json' --data-binary "@$bodyFile" "$($state.baseUrl)/editor-sessions/$($state.sessionId)/call-tool"
$json = $resp | ConvertFrom-Json
if ($json.isError) { throw ($json.content[0].text) }

# Footer links if not present
$search = (CallTool 'search_nodes' @{ pattern = 'Terms of Use'; page = 0 }).content[0].text | ConvertFrom-Json
if ($search.totalMatches -eq 0) {
  $linksHtml = '<div style="display:flex; flex-direction:row; justify-content:space-between; align-items:center; width:100%; padding-top:8px; box-sizing:border-box;"><span style="font-size:12px; color:#8E8E93; font-family:Inter,sans-serif;">Terms of Use</span><span style="font-size:12px; color:#8E8E93; font-family:Inter,sans-serif;">Privacy Policy</span><span style="font-size:12px; color:#8E8E93; font-family:Inter,sans-serif;">Restore Purchases</span></div>'
  CallTool 'write_html' @{ targetNodeId = 'node:4cvtYM0ef0CdpLT0MnXLR'; mode = 'insert-children'; html = $linksHtml } | Out-Null
}

CallTool 'update_styles' @{
  updates = @(
    @{ nodeIds = @('node:YJnSDhU2vfFwtgQzGvC0f'); styles = @{ transform = 'scale(1)'; opacity = '100%' } }
  )
} | Out-Null

CallTool 'finish_working_on_nodes' @{ nodeIds = @('page:page') } | Out-Null
Write-Output 'phase2b-done'
