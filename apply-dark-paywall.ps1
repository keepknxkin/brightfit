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

# 1) Dark interface tokens
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

# 2) Page + hero + footer base styles
CallTool 'update_styles' @{
  updates = @(
    @{
      nodeIds = @('page:page')
      styles = @{ backgroundColor = '#000000'; color = '#FFFFFF' }
    }
    @{
      nodeIds = @('node:aJZwCjr4RTQFs7T6TEfLa')
      styles = @{
        position = 'relative'
        paddingTop = '8px'
        paddingBottom = '0px'
        marginBottom = '-72px'
        marginTop = '0px'
        overflow = 'visible'
        zIndex = '2'
        backgroundColor = '#000000'
      }
    }
    @{
      nodeIds = @('node:88nJH3LhJghBN7WgYHhi9')
      styles = @{
        width = '100%'
        marginBottom = '-20px'
        transform = 'scale(1.05) translate(0px, 0px)'
      }
    }
    @{
      nodeIds = @('node:4cvtYM0ef0CdpLT0MnXLR')
      styles = @{
        backgroundColor = '#000000'
        marginTop = '-16px'
        paddingTop = '28px'
        paddingBottom = '24px'
        paddingLeft = '20px'
        paddingRight = '20px'
        gap = '14px'
        position = 'relative'
        zIndex = '3'
      }
    }
  )
} | Out-Null

# 3) Hero fade to black
CallTool 'delete_nodes' @{ nodeIds = @('node:_WBMs97bPtCKXmQmAc138') } | Out-Null
$fadeHtml = '<div style="display:flex; width:100%; height:96px; margin-top:-88px; margin-bottom:-8px; background:linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 35%, rgba(0,0,0,0.82) 72%, rgba(0,0,0,1) 100%); pointer-events:none;"></div>'
CallTool 'write_html' @{
  targetNodeId = 'node:aJZwCjr4RTQFs7T6TEfLa'
  mode = 'insert-children'
  html = $fadeHtml
} | Out-Null

# 4) Headline + subheadline
CallTool 'set_text_content' @{
  updates = @(
    @{ nodeId = 'node:ZvGHQ2mwMFWwCuQq3qaHH'; textContent = "Unlock Everything You Need To Transform." }
    @{ nodeId = 'node:DVGzQC2MYsfG1QQAiJBr9'; textContent = 'Train smarter. Stay consistent. Get results.' }
  )
} | Out-Null

CallTool 'update_styles' @{
  updates = @(
    @{
      nodeIds = @('node:ZvGHQ2mwMFWwCuQq3qaHH')
      styles = @{
        color = '#FFFFFF'
        fontSize = '28px'
        fontWeight = '700'
        textAlign = 'center'
        lineHeight = '34px'
        paddingTop = '0px'
        paddingBottom = '4px'
      }
    }
    @{
      nodeIds = @('node:DVGzQC2MYsfG1QQAiJBr9')
      styles = @{
        color = '#8E8E93'
        fontSize = '15px'
        fontWeight = '400'
        textAlign = 'center'
        paddingBottom = '8px'
      }
    }
  )
} | Out-Null

Write-Output 'phase1-done'
