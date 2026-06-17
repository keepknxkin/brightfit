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

# --- Remove clutter ---
$deleteIds = @(
  'node:8sGDciKQKb1g94Y7ir5bZ'   # unlock headline block
  'node:ckjxGz7lPJ18_tHsBPJzl'   # feature icons row
  'node:oGyFNai_5pCmsFm6M3UUW'   # footer links
  'node:kcJpfcRNHikIIxPJFQG-b'   # trial copy above CTA
  'node:T4yv5j7pYb8KCh6qiUOea'   # empty content stack
  'node:B2fMblEep77fhZGtgNgEp'   # old fade overlay
)
CallTool 'delete_nodes' @{ nodeIds = $deleteIds } | Out-Null

# --- Theme tokens (simple black/gold) ---
CallTool 'update_style_tokens' @{
  group = 'interface'
  tokens = @(
    @{ name = 'background'; values = @{ light = '#000000' } }
    @{ name = 'text'; values = @{ light = '#FFFFFF' } }
    @{ name = 'primary'; values = @{ light = '#FFD700' } }
    @{ name = 'border'; values = @{ light = '#3A3A3C' } }
    @{ name = 'elementBackground'; values = @{ light = '#1C1C1E' } }
    @{ name = 'productSelectedBg'; values = @{ light = '#1C1C1E' } }
    @{ name = 'secondary'; values = @{ light = '#8E8E93' } }
  )
} | Out-Null

# --- Page + hero cleanup ---
CallTool 'update_styles' @{
  updates = @(
    @{ nodeIds = @('page:page'); styles = @{ backgroundColor = '#000000' } }
    @{
      nodeIds = @('node:aJZwCjr4RTQFs7T6TEfLa')
      styles = @{
        backgroundColor = '#000000'
        marginTop = '0px'
        marginBottom = '-40px'
        paddingTop = '0px'
        paddingBottom = '0px'
        paddingLeft = '0px'
        paddingRight = '0px'
        position = 'relative'
        overflow = 'visible'
        zIndex = '1'
      }
    }
    @{
      nodeIds = @('node:88nJH3LhJghBN7WgYHhi9')
      styles = @{
        width = '100%'
        transform = 'scale(1) translate(0px, 0px)'
        marginBottom = '0px'
      }
    }
    @{
      nodeIds = @('node:4cvtYM0ef0CdpLT0MnXLR')
      styles = @{
        backgroundColor = '#000000'
        marginTop = '0px'
        paddingTop = '20px'
        paddingBottom = '28px'
        paddingLeft = '20px'
        paddingRight = '20px'
        gap = '12px'
      }
    }
  )
} | Out-Null

# Subtle hero fade into black
$fadeHtml = '<div style="width:100%; height:72px; margin-top:-64px; background:linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.75) 55%, rgba(0,0,0,1) 100%); pointer-events:none;"></div>'
CallTool 'write_html' @{ targetNodeId = 'node:aJZwCjr4RTQFs7T6TEfLa'; mode = 'insert-children'; html = $fadeHtml } | Out-Null

# --- Messaging (simple reference layout) ---
CallTool 'set_text_content' @{
  updates = @(
    @{ nodeId = 'node:DVGzQC2MYsfG1QQAiJBr9'; textContent = 'Train Smarter. Progress Faster.' }
    @{ nodeId = 'node:-lBmjUtcifM88Uu3-YUkZ'; textContent = 'BEST VALUE' }
    @{ nodeId = 'node:GcBIAbtCufa_oI_Re1tpI'; textContent = 'Equivalent to $4.16/month' }
    @{ nodeId = 'node:JYVBJvaPtBCDjBY3ddM1V'; textContent = 'Monthly' }
    @{ nodeId = 'node:nAsxb78Cqn9z_Z6JoQ56K'; textContent = 'Start My 3 Day Trial' }
  )
} | Out-Null

# Add BRIGHTFIT PLUS line
$brandHtml = '<p style="text-align:center; font-size:13px; font-weight:600; letter-spacing:1px; color:#8E8E93; margin:0; padding:0 0 8px 0; font-family:Inter,sans-serif;">BRIGHTFIT PLUS ✨</p>'
$brand = CallTool 'write_html' @{ targetNodeId = 'node:4cvtYM0ef0CdpLT0MnXLR'; mode = 'insert-children'; html = $brandHtml }
$brandId = (($brand.content[0].text | ConvertFrom-Json).createdNodeIds)[0]
CallTool 'move_nodes' @{ moves = @(@{ nodeId = $brandId; targetNodeId = 'node:Ax8bxKAjk7G1CERKBIDEn'; position = 'before' }) } | Out-Null
CallTool 'move_nodes' @{ moves = @(@{ nodeId = 'node:DVGzQC2MYsfG1QQAiJBr9'; targetNodeId = $brandId; position = 'before' }) } | Out-Null

CallTool 'update_styles' @{
  updates = @(
    @{
      nodeIds = @('node:DVGzQC2MYsfG1QQAiJBr9')
      styles = @{
        color = '#FFFFFF'
        fontSize = '22px'
        fontWeight = '700'
        textAlign = 'center'
        paddingTop = '4px'
        paddingBottom = '6px'
      }
    }
    @{
      nodeIds = @('node:Ax8bxKAjk7G1CERKBIDEn','node:YJnSDhU2vfFwtgQzGvC0f')
      styles = @{
        backgroundColor = '#1C1C1E'
        borderTopLeftRadius = '14px'
        borderTopRightRadius = '14px'
        borderBottomLeftRadius = '14px'
        borderBottomRightRadius = '14px'
        borderTopWidth = '1px'
        borderRightWidth = '1px'
        borderBottomWidth = '1px'
        borderLeftWidth = '1px'
        borderTopStyle = 'solid'
        borderRightStyle = 'solid'
        borderBottomStyle = 'solid'
        borderLeftStyle = 'solid'
        paddingTop = '14px'
        paddingBottom = '14px'
        paddingLeft = '14px'
        paddingRight = '14px'
        boxShadow = 'none'
        transform = 'scale(1)'
        marginBottom = '0px'
        gap = '6px'
      }
    }
    @{
      nodeIds = @('node:KC8BDPQIhYwckF7oFPtKj')
      styles = @{
        backgroundColor = '#FFD700'
        borderTopLeftRadius = '6px'
        borderTopRightRadius = '6px'
        borderBottomLeftRadius = '6px'
        borderBottomRightRadius = '6px'
        paddingTop = '3px'
        paddingBottom = '3px'
        paddingLeft = '8px'
        paddingRight = '8px'
        alignSelf = 'flex-start'
      }
    }
    @{
      nodeIds = @('node:-lBmjUtcifM88Uu3-YUkZ')
      styles = @{ color = '#000000'; fontSize = '10px'; fontWeight = '700' }
    }
    @{
      nodeIds = @('node:GcBIAbtCufa_oI_Re1tpI')
      styles = @{ color = '#8E8E93'; fontSize = '12px'; fontWeight = '400' }
    }
    @{
      nodeIds = @('node:JYVBJvaPtBCDjBY3ddM1V')
      styles = @{ color = '#FFFFFF'; fontSize = '16px'; fontWeight = '700' }
    }
    @{
      nodeIds = @('node:CgTmdaobdBrRjb9QrOUFV')
      styles = @{
        background = 'linear-gradient(90deg, #E8A317 0%, #FFD700 100%)'
        backgroundColor = '#FFD700'
        borderTopLeftRadius = '999px'
        borderTopRightRadius = '999px'
        borderBottomLeftRadius = '999px'
        borderBottomRightRadius = '999px'
        height = '56px'
        marginTop = '8px'
      }
    }
    @{
      nodeIds = @('node:nAsxb78Cqn9z_Z6JoQ56K')
      styles = @{ color = '#000000'; fontSize = '17px'; fontWeight = '700'; textAlign = 'center' }
    }
    @{
      nodeIds = @('node:YJnSDhU2vfFwtgQzGvC0f')
      styles = @{ transform = 'scale(1)'; opacity = '100%' }
    }
  )
} | Out-Null

# Yearly left column content
$yearlyLeftHtml = @'
<div style="display:flex; flex-direction:column; gap:2px; align-items:flex-start;">
  <span style="font-size:16px; font-weight:700; color:#FFFFFF; font-family:Inter,sans-serif;">Yearly Plan</span>
  <span style="font-size:14px; font-weight:700; color:#FFD700; font-family:Inter,sans-serif;">Save 66%</span>
</div>
'@
CallTool 'write_html' @{ targetNodeId = 'node:3a1sLwN3_MRpXsqiBKF2B'; mode = 'replace'; html = $yearlyLeftHtml } | Out-Null

# Yearly price before checkmark
$yearlyPriceInsert = CallTool 'write_html' @{
  targetNodeId = 'node:ISRrIuYwCsx45cr1g-ByE'
  mode = 'insert-children'
  html = '<span style="font-size:16px; font-weight:700; color:#FFFFFF; font-family:Inter,sans-serif;">$59.99/Yr</span>'
}
$yearlyPriceId = (($yearlyPriceInsert.content[0].text | ConvertFrom-Json).createdNodeIds)[0]
CallTool 'move_nodes' @{ moves = @(@{ nodeId = $yearlyPriceId; targetNodeId = 'node:mlH2eaLDCQEXfMz0pPgYS'; position = 'before' }) } | Out-Null

# Monthly price
$monthlyPriceHtml = '<span style="font-size:16px; font-weight:700; color:#FFFFFF; font-family:Inter,sans-serif;">$12.99/Month</span>'
CallTool 'write_html' @{ targetNodeId = 'node:XTTYOAWrxHj1X_Tcc2iTM'; mode = 'replace'; html = $monthlyPriceHtml } | Out-Null

# Behaviors + conditional selected styling
CallTool 'set_click_behavior' @{
  updates = @(
    @{ nodeIds = @('node:Ax8bxKAjk7G1CERKBIDEn'); preserveLockedActions = $false; behavior = @{ animation = 'scale-out-in'; hapticFeedback = 'selection'; actions = @(@{ type = 'set-product-index'; index = 0 }) } }
    @{ nodeIds = @('node:YJnSDhU2vfFwtgQzGvC0f'); preserveLockedActions = $false; behavior = @{ animation = 'scale-out-in'; hapticFeedback = 'selection'; actions = @(@{ type = 'set-product-index'; index = 1 }) } }
    @{ nodeIds = @('node:CgTmdaobdBrRjb9QrOUFV'); preserveLockedActions = $false; behavior = @{ animation = 'scale-out-in'; hapticFeedback = 'medium'; actions = @(@{ type = 'purchase'; reference = @{ type = 'by-selected' } }) } }
  )
} | Out-Null

$dynBody = @'
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
{"query":{"combinator":"and","rules":[]},"value":"100%"}]},
{"nodeIds":["node:nAsxb78Cqn9z_Z6JoQ56K"],"property":"text","preserveExistingFallback":false,"cases":[
{"query":{"combinator":"and","rules":[{"field":"state:products.selectedIndex","operator":"=","valueSource":"value","value":1}]},"value":"Start Now\n"},
{"query":{"combinator":"and","rules":[{"field":"state:products.hasIntroductoryOffer","operator":"=","valueSource":"value","value":true}]},"value":"Start My 3 Day Trial\n"},
{"query":{"combinator":"and","rules":[]},"value":"Start Now\n"}]}
]}}
'@
$bodyFile = Join-Path $env:TEMP 'sw-call-body.json'
[System.IO.File]::WriteAllText($bodyFile, $dynBody)
$resp = curl.exe -sS -X POST -H "Authorization: Bearer $($state.controllerToken)" -H 'Content-Type: application/json' --data-binary "@$bodyFile" "$($state.baseUrl)/editor-sessions/$($state.sessionId)/call-tool"
$json = $resp | ConvertFrom-Json
if ($json.isError) { throw ($json.content[0].text) }

CallTool 'finish_working_on_nodes' @{ nodeIds = @('page:page') } | Out-Null
Write-Output 'cleanup-done'
