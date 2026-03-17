import { NextResponse } from 'next/server'
import { execSync } from 'child_process'

const KNOWN_SECRETS = [
  { name: 'CLAUDE_CODE_OAUTH_TOKEN', group: 'Core', description: 'Claude Code OAuth token (set via Authenticate button)' },
  { name: 'ANTHROPIC_API_KEY', group: 'Core', description: 'Anthropic API key for Claude Code' },
  { name: 'TELEGRAM_BOT_TOKEN', group: 'Telegram', description: 'Bot token from @BotFather' },
  { name: 'TELEGRAM_CHAT_ID', group: 'Telegram', description: 'Your chat ID' },
  { name: 'DISCORD_BOT_TOKEN', group: 'Discord', description: 'Discord bot token' },
  { name: 'DISCORD_CHANNEL_ID', group: 'Discord', description: 'Channel ID for messages' },
  { name: 'DISCORD_WEBHOOK_URL', group: 'Discord', description: 'Webhook URL for notifications' },
  { name: 'SLACK_BOT_TOKEN', group: 'Slack', description: 'Slack bot OAuth token' },
  { name: 'SLACK_CHANNEL_ID', group: 'Slack', description: 'Channel ID for messages' },
  { name: 'SLACK_WEBHOOK_URL', group: 'Slack', description: 'Webhook URL for notifications' },
  { name: 'XAI_API_KEY', group: 'API Keys', description: 'xAI/Grok API key (for tweet skills)' },
  { name: 'COINGECKO_API_KEY', group: 'API Keys', description: 'CoinGecko API key (for crypto skills)' },
  { name: 'ALCHEMY_API_KEY', group: 'API Keys', description: 'Alchemy API key (for on-chain skills)' },
  { name: 'GH_GLOBAL', group: 'Core', description: 'GitHub PAT with cross-repo access' },
]

function ghAvailable(): boolean {
  try {
    execSync('gh auth status', { stdio: 'pipe' })
    return true
  } catch {
    return false
  }
}

function listSecrets(): string[] {
  try {
    const out = execSync('gh secret list --json name -q ".[].name"', {
      stdio: 'pipe',
      cwd: process.cwd(),
    }).toString().trim()
    return out ? out.split('\n').filter(Boolean) : []
  } catch {
    return []
  }
}

export async function GET() {
  if (!ghAvailable()) {
    return NextResponse.json({
      error: 'GitHub CLI not authenticated. Run: gh auth login',
      ghReady: false,
    }, { status: 503 })
  }

  const setSecrets = new Set(listSecrets())

  const secrets = KNOWN_SECRETS.map(s => ({
    ...s,
    isSet: setSecrets.has(s.name),
  }))

  return NextResponse.json({ secrets, ghReady: true })
}

export async function POST(request: Request) {
  if (!ghAvailable()) {
    return NextResponse.json({ error: 'GitHub CLI not authenticated' }, { status: 503 })
  }

  const { name, value } = await request.json()

  if (!name || !value) {
    return NextResponse.json({ error: 'name and value required' }, { status: 400 })
  }

  // Only allow setting known secrets
  if (!KNOWN_SECRETS.find(s => s.name === name)) {
    return NextResponse.json({ error: 'Unknown secret name' }, { status: 400 })
  }

  try {
    execSync(`gh secret set ${name} -b "${value.replace(/"/g, '\\"')}"`, {
      stdio: 'pipe',
      cwd: process.cwd(),
    })
    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to set secret'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  if (!ghAvailable()) {
    return NextResponse.json({ error: 'GitHub CLI not authenticated' }, { status: 503 })
  }

  const { name } = await request.json()

  if (!KNOWN_SECRETS.find(s => s.name === name)) {
    return NextResponse.json({ error: 'Unknown secret name' }, { status: 400 })
  }

  try {
    execSync(`gh secret delete ${name}`, { stdio: 'pipe', cwd: process.cwd() })
    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to delete secret'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
