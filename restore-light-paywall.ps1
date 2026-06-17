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

# Remove dark-theme extras
CallTool 'delete_nodes' @{ nodeIds = @(
  'node:3PnpNqdUruZLI7WZgzQX7'
  'node:qGpAMoXnpDrSua2Okwk-P'
  'node:2sYIoCx9E3HliYlhgL_gH'
) } | Out-Null

# Restore light interface tokens
CallTool 'update_style_tokens' @{
  group = 'interface'
  tokens = @(
    @{ name = 'background'; values = @{ light = '#FAFAFA' } }
    @{ name = 'text'; values = @{ light = '#000000' } }
    @{ name = 'primary'; values = @{ light = '#C53452' } }
    @{ name = 'border'; values = @{ light = '#0505051A' } }
    @{ name = 'elementBackground'; values = @{ light = '#D9D9D9' } }
    @{ name = 'productSelectedBg'; values = @{ light = '#FFFFFF' } }
    @{ name = 'secondary'; values = @{ light = '#52B34B' } }
  )
} | Out-Null

# Restore page / hero / footer layout
CallTool 'update_styles' @{
  updates = @(
    @{ nodeIds = @('page:page'); styles = @{ backgroundColor = '#FAFAFA' } }
    @{
      nodeIds = @('node:aJZwCjr4RTQFs7T6TEfLa')
      styles = @{
        backgroundColor = 'transparent'
        marginTop = '55px'
        marginBottom = '-72px'
        paddingTop = '14px'
        paddingBottom = '0px'
        paddingLeft = '16px'
        paddingRight = '16px'
        gap = '28px'
        position = 'relative'
        overflow = 'visible'
        zIndex = '1'
      }
    }
    @{
      nodeIds = @('node:88nJH3LhJghBN7WgYHhi9')
      styles = @{
        width = '85%'
        transform = 'scale(1.4) translate(23px, -10px)'
        marginBottom = '-24px'
      }
    }
    @{
      nodeIds = @('node:4cvtYM0ef0CdpLT0MnXLR')
      styles = @{
        backgroundColor = '#FFFFFF'
        marginTop = '-8px'
        paddingTop = '24px'
        paddingBottom = '31px'
        paddingLeft = '20px'
        paddingRight = '20px'
        gap = '12px'
        position = 'relative'
        zIndex = '2'
        background = 'none'
      }
    }
  )
} | Out-Null

# White gradient fade hero -> footer
$fadeHtml = '<div style="display:flex; width:100%; height:96px; margin-top:-88px; margin-bottom:-8px; background:linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.25) 28%, rgba(255,255,255,0.72) 62%, rgba(255,255,255,1) 100%); pointer-events:none;"></div>'
CallTool 'write_html' @{ targetNodeId = 'node:aJZwCjr4RTQFs7T6TEfLa'; mode = 'insert-children'; html = $fadeHtml } | Out-Null

# Restore unlock heading
$unlockHtml = '<p style="text-align:center; font-size:25px; font-weight:700; font-family:Inter,sans-serif; color:#000000; padding-top:3px; padding-bottom:3px;">Unlock Everything You Need To Transform!</p>'
$unlock = CallTool 'write_html' @{ targetNodeId = 'node:4cvtYM0ef0CdpLT0MnXLR'; mode = 'insert-children'; html = $unlockHtml }
$unlockId = (($unlock.content[0].text | ConvertFrom-Json).createdNodeIds)[0]
CallTool 'move_nodes' @{ moves = @(@{ nodeId = $unlockId; targetNodeId = 'node:DVGzQC2MYsfG1QQAiJBr9'; position = 'before' }) } | Out-Null

# Restore copy
CallTool 'set_text_content' @{
  updates = @(
    @{ nodeId = 'node:DVGzQC2MYsfG1QQAiJBr9'; textContent = 'BRIGHTFIT PLUS ✨' }
    @{ nodeId = 'node:GcBIAbtCufa_oI_Re1tpI'; textContent = 'Equivalent to 4.16/month' }
    @{ nodeId = 'node:JYVBJvaPtBCDjBY3ddM1V'; textContent = 'Monthly Plan                  $12.99/mth' }
    @{ nodeId = 'node:-lBmjUtcifM88Uu3-YUkZ'; textContent = 'BEST VALUE' }
  )
} | Out-Null

# Restore No Payment Due Now
$noPayHtml = '<p style="text-align:center; font-size:14px; font-weight:600; color:#000000; font-family:Inter,sans-serif;">No Payment Due Now</p>'
$noPay = CallTool 'write_html' @{ targetNodeId = 'node:4cvtYM0ef0CdpLT0MnXLR'; mode = 'insert-children'; html = $noPayHtml }
$noPayId = (($noPay.content[0].text | ConvertFrom-Json).createdNodeIds)[0]
CallTool 'move_nodes' @{ moves = @(@{ nodeId = $noPayId; targetNodeId = 'node:CgTmdaobdBrRjb9QrOUFV'; position = 'before' }) } | Out-Null

CallTool 'update_styles' @{
  updates = @(
    @{
      nodeIds = @('node:DVGzQC2MYsfG1QQAiJBr9')
      styles = @{ color = '#000000'; fontSize = 'inherit'; fontWeight = '400'; textAlign = 'center'; paddingBottom = '0px' }
    }
    @{
      nodeIds = @('node:Ax8bxKAjk7G1CERKBIDEn','node:YJnSDhU2vfFwtgQzGvC0f')
      styles = @{
        backgroundColor = '#FFFFFF'
        borderColor = '#D6D6D6'
        borderTopWidth = '1px'
        borderRightWidth = '1px'
        borderBottomWidth = '1px'
        borderLeftWidth = '1px'
        borderTopLeftRadius = '16px'
        borderTopRightRadius = '16px'
        borderBottomLeftRadius = '16px'
        borderBottomRightRadius = '16px'
        paddingTop = '16px'
        paddingBottom = '16px'
        paddingLeft = '18px'
        paddingRight = '18px'
        boxShadow = '0px 0px 8px 0px #F3F1F1'
        transform = 'scale(0.9)'
        marginBottom = '12px'
        gap = '9px'
      }
    }
    @{
      nodeIds = @('node:YJnSDhU2vfFwtgQzGvC0f')
      styles = @{ transform = 'scale(0.9) translate(0px, -30px)'; paddingTop = '25px'; paddingBottom = '25px'; gap = '3px' }
    }
    @{
      nodeIds = @('node:KC8BDPQIhYwckF7oFPtKj')
      styles = @{ backgroundColor = 'transparent'; paddingTop = '0px'; paddingBottom = '0px'; paddingLeft = '0px'; paddingRight = '0px' }
    }
    @{
      nodeIds = @('node:-lBmjUtcifM88Uu3-YUkZ')
      styles = @{ color = '#000000'; fontSize = '11px'; fontWeight = '700' }
    }
    @{
      nodeIds = @('node:GcBIAbtCufa_oI_Re1tpI')
      styles = @{ color = '#666666'; fontSize = 'inherit' }
    }
    @{
      nodeIds = @('node:JYVBJvaPtBCDjBY3ddM1V')
      styles = @{ color = '#000000'; fontSize = 'inherit'; fontWeight = '700'; textTransform = 'capitalize' }
    }
    @{
      nodeIds = @('node:CgTmdaobdBrRjb9QrOUFV')
      styles = @{
        backgroundColor = '#FFF700'
        background = 'none'
        borderTopLeftRadius = '100px'
        borderTopRightRadius = '100px'
        borderBottomLeftRadius = '100px'
        borderBottomRightRadius = '100px'
        height = '65px'
        marginTop = '0px'
      }
    }
    @{
      nodeIds = @('node:nAsxb78Cqn9z_Z6JoQ56K')
      styles = @{ color = '#000000'; fontSize = '20px'; fontWeight = '700'; textAlign = 'left'; textTransform = 'capitalize' }
    }
    @{
      nodeIds = @('node:mlH2eaLDCQEXfMz0pPgYS','node:vfkMncgMWmLib_1Itm8yd')
      styles = @{ opacity = '100%' }
    }
  )
} | Out-Null

# Restore yearly left column (simple)
$yearlyLeftHtml = @'
<div style="display:flex; flex-direction:column; gap:2px; align-items:flex-start;">
  <span style="font-size:16px; font-weight:700; color:#000000; font-family:Inter,sans-serif;">Yearly Plan</span>
</div>
'@
CallTool 'write_html' @{ targetNodeId = 'node:3a1sLwN3_MRpXsqiBKF2B'; mode = 'replace'; html = $yearlyLeftHtml } | Out-Null
CallTool 'write_html' @{ targetNodeId = 'node:XTTYOAWrxHj1X_Tcc2iTM'; mode = 'replace'; html = '<div></div>' } | Out-Null

# Reorder yearly card: row, equivalent, badge
CallTool 'move_nodes' @{
  moves = @(
    @{ nodeId = 'node:KC8BDPQIhYwckF7oFPtKj'; targetNodeId = 'node:GcBIAbtCufa_oI_Re1tpI'; position = 'after' }
  )
} | Out-Null

# Behaviors
CallTool 'set_click_behavior' @{
  updates = @(
    @{ nodeIds = @('node:Ax8bxKAjk7G1CERKBIDEn'); preserveLockedActions = $false; behavior = @{ animation = 'scale-out-in'; actions = @(@{ type = 'set-product-index'; index = 0 }) } }
    @{ nodeIds = @('node:YJnSDhU2vfFwtgQzGvC0f'); preserveLockedActions = $false; behavior = @{ animation = 'scale-out-in'; hapticFeedback = 'none'; actions = @(@{ type = 'set-product-index'; index = 1 }) } }
    @{ nodeIds = @('node:CgTmdaobdBrRjb9QrOUFV'); preserveLockedActions = $false; behavior = @{ animation = 'scale-out-in'; actions = @(@{ type = 'purchase'; reference = @{ type = 'by-selected' } }) } }
  )
} | Out-Null

# CTA dynamic text (monthly -> Start Now, yearly trial -> Start My 3 Day Trial)
$dynBody = @'
{"toolName":"set_dynamic_value","args":{"updates":[
{"nodeIds":["node:nAsxb78Cqn9z_Z6JoQ56K"],"property":"text","preserveExistingFallback":false,"cases":[
{"query":{"combinator":"and","rules":[{"field":"state:products.selectedIndex","operator":"=","valueSource":"value","value":1}]},"value":"Start Now\n"},
{"query":{"combinator":"and","rules":[{"field":"state:products.hasIntroductoryOffer","operator":"=","valueSource":"value","value":true}]},"value":"Start My 3 Day Trial\n"},
{"query":{"combinator":"and","rules":[]},"value":"Start Now\n"}]},
{"nodeIds":["node:Ax8bxKAjk7G1CERKBIDEn"],"property":"borderColor","preserveExistingFallback":false,"cases":[
{"query":{"combinator":"and","rules":[]},"value":"#D6D6D6"}]},
{"nodeIds":["node:YJnSDhU2vfFwtgQzGvC0f"],"property":"borderColor","preserveExistingFallback":false,"cases":[
{"query":{"combinator":"and","rules":[]},"value":"#D6D6D6"}]}
]}}
'@
$bodyFile = Join-Path $env:TEMP 'sw-call-body.json'
[System.IO.File]::WriteAllText($bodyFile, $dynBody)
$resp = curl.exe -sS -X POST -H "Authorization: Bearer $($state.controllerToken)" -H 'Content-Type: application/json' --data-binary "@$bodyFile" "$($state.baseUrl)/editor-sessions/$($state.sessionId)/call-tool"
$json = $resp | ConvertFrom-Json
if ($json.isError) { throw ($json.content[0].text) }

CallTool 'finish_working_on_nodes' @{ nodeIds = @('page:page') } | Out-Null
Write-Output 'restore-done'
