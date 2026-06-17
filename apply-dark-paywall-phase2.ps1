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

# Replace headline with yellow Transform.
CallTool 'delete_nodes' @{ nodeIds = @('node:ZvGHQ2mwMFWwCuQq3qaHH') } | Out-Null
$headlineHtml = @'
<div style="display:flex; flex-direction:column; align-items:center; padding:0 8px 4px 8px; width:100%; box-sizing:border-box;">
  <div style="display:flex; flex-direction:row; flex-wrap:wrap; justify-content:center; gap:0; text-align:center;">
    <span style="font-size:28px; font-weight:700; color:#FFFFFF; font-family:Inter,sans-serif; line-height:34px;">Unlock Everything You Need To </span>
    <span style="font-size:28px; font-weight:700; color:#FFD700; font-family:Inter,sans-serif; line-height:34px;">Transform.</span>
  </div>
</div>
'@
$head = CallTool 'write_html' @{ targetNodeId = 'node:4cvtYM0ef0CdpLT0MnXLR'; mode = 'insert-children'; html = $headlineHtml }
$headId = (($head.content[0].text | ConvertFrom-Json).createdNodeIds)[0]
CallTool 'move_nodes' @{ moves = @(@{ nodeId = $headId; targetNodeId = 'node:DVGzQC2MYsfG1QQAiJBr9'; position = 'before' }) } | Out-Null

# Feature icons row
$featuresHtml = @'
<div style="display:flex; flex-direction:row; justify-content:space-between; align-items:flex-start; gap:6px; width:100%; padding:6px 0 12px 0; box-sizing:border-box;">
  <div style="display:flex; flex-direction:column; align-items:center; gap:6px; flex:1; min-width:0;">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="4" y="12" width="4" height="8" rx="1" fill="#FFD700"/><rect x="10" y="8" width="4" height="12" rx="1" fill="#FFD700"/><rect x="16" y="4" width="4" height="16" rx="1" fill="#FFD700"/></svg>
    <span style="font-size:10px; font-weight:600; color:#FFFFFF; text-align:center; line-height:12px; font-family:Inter,sans-serif;">Advanced Tracking</span>
  </div>
  <div style="display:flex; flex-direction:column; align-items:center; gap:6px; flex:1; min-width:0;">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M7 4h10v3a5 5 0 01-10 0V4z" fill="#FFD700"/><path d="M12 17v2M8 21h8M9 17h6" stroke="#FFD700" stroke-width="1.5"/></svg>
    <span style="font-size:10px; font-weight:600; color:#FFFFFF; text-align:center; line-height:12px; font-family:Inter,sans-serif;">Achievements &amp; Rewards</span>
  </div>
  <div style="display:flex; flex-direction:column; align-items:center; gap:6px; flex:1; min-width:0;">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="2" y="9" width="3" height="6" rx="1" fill="#FFD700"/><rect x="19" y="9" width="3" height="6" rx="1" fill="#FFD700"/><rect x="5" y="11" width="14" height="2" rx="1" fill="#FFD700"/></svg>
    <span style="font-size:10px; font-weight:600; color:#FFFFFF; text-align:center; line-height:12px; font-family:Inter,sans-serif;">Smart Workouts</span>
  </div>
  <div style="display:flex; flex-direction:column; align-items:center; gap:6px; flex:1; min-width:0;">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><polyline points="4,18 9,11 13,14 20,6" stroke="#FFD700" stroke-width="2" fill="none"/><circle cx="20" cy="6" r="1.5" fill="#FFD700"/></svg>
    <span style="font-size:10px; font-weight:600; color:#FFFFFF; text-align:center; line-height:12px; font-family:Inter,sans-serif;">Progress Analytics</span>
  </div>
  <div style="display:flex; flex-direction:column; align-items:center; gap:6px; flex:1; min-width:0;">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z" fill="#FFD700"/><path d="M12 9.5c-.8-.8-2.1-.8-2.9 0-.8.8-.8 2.1 0 2.9L12 15l2.9-2.6c.8-.8.8-2.1 0-2.9-.8-.8-2.1-.8-2.9 0z" fill="#000"/></svg>
    <span style="font-size:10px; font-weight:600; color:#FFFFFF; text-align:center; line-height:12px; font-family:Inter,sans-serif;">Recovery &amp; Health</span>
  </div>
</div>
'@
$feat = CallTool 'write_html' @{ targetNodeId = 'node:4cvtYM0ef0CdpLT0MnXLR'; mode = 'insert-children'; html = $featuresHtml }
$featId = (($feat.content[0].text | ConvertFrom-Json).createdNodeIds)[0]
CallTool 'move_nodes' @{ moves = @(@{ nodeId = $featId; targetNodeId = 'node:Ax8bxKAjk7G1CERKBIDEn'; position = 'before' }) } | Out-Null

# Plan card base styles
CallTool 'update_styles' @{
  updates = @(
    @{
      nodeIds = @('node:Ax8bxKAjk7G1CERKBIDEn','node:YJnSDhU2vfFwtgQzGvC0f')
      styles = @{
        backgroundColor = '#1C1C1E'
        borderTopLeftRadius = '16px'
        borderTopRightRadius = '16px'
        borderBottomLeftRadius = '16px'
        borderBottomRightRadius = '16px'
        borderTopWidth = '2px'
        borderRightWidth = '2px'
        borderBottomWidth = '2px'
        borderLeftWidth = '2px'
        borderTopStyle = 'solid'
        borderRightStyle = 'solid'
        borderBottomStyle = 'solid'
        borderLeftStyle = 'solid'
        paddingTop = '16px'
        paddingBottom = '16px'
        paddingLeft = '16px'
        paddingRight = '16px'
        transform = 'scale(1)'
        marginBottom = '0px'
      }
    }
    @{
      nodeIds = @('node:GcBIAbtCufa_oI_Re1tpI')
      styles = @{ color = '#8E8E93'; fontSize = '13px' }
    }
    @{
      nodeIds = @('node:KC8BDPQIhYwckF7oFPtKj')
      styles = @{ backgroundColor = '#FFD700'; borderTopLeftRadius = '8px'; borderTopRightRadius = '8px'; borderBottomLeftRadius = '8px'; borderBottomRightRadius = '8px'; paddingTop = '4px'; paddingBottom = '4px'; paddingLeft = '8px'; paddingRight = '8px' }
    }
    @{
      nodeIds = @('node:-lBmjUtcifM88Uu3-YUkZ')
      styles = @{ color = '#000000'; fontSize = '11px'; fontWeight = '700' }
    }
    @{
      nodeIds = @('node:JYVBJvaPtBCDjBY3ddM1V')
      styles = @{ color = '#FFFFFF'; fontSize = '16px'; fontWeight = '700' }
    }
    @{
      nodeIds = @('node:0iohBie2gqbd07nh7kEKK')
      styles = @{ display = 'flex'; flexDirection = 'row'; alignItems = 'center'; justifyContent = 'space-between'; width = '100%' }
    }
  )
} | Out-Null

CallTool 'set_text_content' @{
  updates = @(
    @{ nodeId = 'node:GcBIAbtCufa_oI_Re1tpI'; textContent = 'Equivalent to $4.16/month' }
    @{ nodeId = 'node:JYVBJvaPtBCDjBY3ddM1V'; textContent = 'Monthly Plan' }
    @{ nodeId = 'node:kcJpfcRNHikIIxPJFQG-b'; textContent = "3 Day Free Trial`nCancel anytime. No commitment." }
  )
} | Out-Null

CallTool 'update_styles' @{
  updates = @(
    @{
      nodeIds = @('node:kcJpfcRNHikIIxPJFQG-b')
      styles = @{ color = '#FFFFFF'; fontSize = '14px'; textAlign = 'center'; lineHeight = '20px' }
    }
    @{
      nodeIds = @('node:CgTmdaobdBrRjb9QrOUFV')
      styles = @{
        backgroundColor = '#FFD700'
        borderTopLeftRadius = '999px'
        borderBottomLeftRadius = '999px'
        borderTopRightRadius = '999px'
        borderBottomRightRadius = '999px'
        height = '58px'
        paddingTop = '0px'
        paddingBottom = '0px'
      }
    }
    @{
      nodeIds = @('node:nAsxb78Cqn9z_Z6JoQ56K')
      styles = @{ color = '#000000'; fontSize = '18px'; fontWeight = '700'; textAlign = 'center' }
    }
  )
} | Out-Null

# Click behaviors: select only
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

# Conditional gold border when selected
$selectedBorderCases = @(
  @{ query = @{ combinator = 'and'; rules = @(@{ field = 'state:products.selectedIndex'; operator = '='; valueSource = 'value'; value = 0 }) }; value = '#FFD700' }
  @{ query = @{ combinator = 'and'; rules = @() }; value = '#3A3A3C' }
)
$selectedBorderCasesMonthly = @(
  @{ query = @{ combinator = 'and'; rules = @(@{ field = 'state:products.selectedIndex'; operator = '='; valueSource = 'value'; value = 1 }) }; value = '#FFD700' }
  @{ query = @{ combinator = 'and'; rules = @() }; value = '#3A3A3C' }
)

CallTool 'set_dynamic_value' @{
  updates = @(
    @{ nodeIds = @('node:Ax8bxKAjk7G1CERKBIDEn'); property = 'borderColor'; preserveExistingFallback = $false; cases = $selectedBorderCases }
    @{ nodeIds = @('node:YJnSDhU2vfFwtgQzGvC0f'); property = 'borderColor'; preserveExistingFallback = $false; cases = $selectedBorderCasesMonthly }
    @{ nodeIds = @('node:mlH2eaLDCQEXfMz0pPgYS'); property = 'opacity'; preserveExistingFallback = $false; cases = @(
      @{ query = @{ combinator = 'and'; rules = @(@{ field = 'state:products.selectedIndex'; operator = '='; valueSource = 'value'; value = 0 }) }; value = '100%' }
      @{ query = @{ combinator = 'and'; rules = @() }; value = '0%' }
    ) }
    @{ nodeIds = @('node:vfkMncgMWmLib_1Itm8yd'); property = 'opacity'; preserveExistingFallback = $false; cases = @(
      @{ query = @{ combinator = 'and'; rules = @(@{ field = 'state:products.selectedIndex'; operator = '='; valueSource = 'value'; value = 1 }) }; value = '100%' }
      @{ query = @{ combinator = 'and'; rules = @() }; value = '0%' }
    ) }
    @{ nodeIds = @('node:nAsxb78Cqn9z_Z6JoQ56K'); property = 'text'; preserveExistingFallback = $false; cases = @(
      @{ query = @{ combinator = 'and'; rules = @(@{ field = 'state:products.selectedIndex'; operator = '='; valueSource = 'value'; value = 1 }) }; value = "Start Now`n" }
      @{ query = @{ combinator = 'and'; rules = @(@{ field = 'state:products.hasIntroductoryOffer'; operator = '='; valueSource = 'value'; value = $true }) }; value = "Start My 3 Day Trial`n" }
      @{ query = @{ combinator = 'and'; rules = @() }; value = "Start Now`n" }
    ) }
  )
} | Out-Null

# Footer links
$linksHtml = @'
<div style="display:flex; flex-direction:row; justify-content:space-between; align-items:center; width:100%; padding-top:8px; box-sizing:border-box;">
  <span style="font-size:12px; color:#8E8E93; font-family:Inter,sans-serif;">Terms of Use</span>
  <span style="font-size:12px; color:#8E8E93; font-family:Inter,sans-serif;">Privacy Policy</span>
  <span style="font-size:12px; color:#8E8E93; font-family:Inter,sans-serif;">Restore Purchases</span>
</div>
'@
CallTool 'write_html' @{ targetNodeId = 'node:4cvtYM0ef0CdpLT0MnXLR'; mode = 'insert-children'; html = $linksHtml } | Out-Null

CallTool 'finish_working_on_nodes' @{ nodeIds = @('page:page') } | Out-Null
Write-Output 'phase2-done'
