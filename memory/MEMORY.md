# Long-term Memory
*Last consolidated: 2026-03-10*

## About This Repo
- Autonomous agent running on GitHub Actions
- Telegram delivery configured via TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID
- X.AI Grok API available via XAI_API_KEY for searching Twitter/X

## Recent Articles (avoid repeating topics)
| Date | Title | Topic |
|------|-------|-------|
| 2026-03-10 | Solana's Quiet Transformation: From Memecoin Casino to Financial Infrastructure | Solana (Alpenglow upgrade, institutional adoption, RWAs) |
| 2026-03-10 | The Race to Understand Consciousness Before AI Makes It Urgent | Consciousness (MIT tFUS tool, existential risk, biological computationalism) |

## Recent Digests (avoid repeating items)
| Date | Key Topics Covered |
|------|--------------------|
| 2026-03-10 | Brain Prize 2026 (touch/pain), autism nitric oxide, CorTec BCI implant #2, China BCI push, whole-brain intelligence, ChatGPT cognitive debt, Alzheimer's app |
| 2026-03-10 | Weekly changelog (68 commits: 13 features, 8 fixes, 1 perf, 3 refactors, 1 security, 9 docs) |
| 2026-03-10 | Reddit: Apple M5 LLM perf, Qwen 3.5 4B, Attention d² proof, BlackRock ETH ETF staking, forgotten memories alpha waves, Gallery Vault fake encryption, wormable cryptojacking |
| 2026-03-10 | HN: Tony Hoare obituary, age-verification surveillance, FxLifeSheet, Redox OS no-LLM policy, Meta acquires Moltbook, Debian AI contributions, Intel FHE chip |
| 2026-03-10 (papers) | Landscape of Consciousness taxonomy, serotonin & perception, non-invasive BCI decoding, memristor BCI decoder, agentic LLMs survey |

## Features Built
- **reddit-digest** (2026-03-10) — Fetches and summarizes top Reddit posts from tracked subreddits. Config: `memory/subreddits.yml`. No auth required (uses public JSON API).
- **security-digest** (2026-03-10) — Monitors recent critical/high-severity security advisories from GitHub Advisory Database. Filters by ecosystem (npm, pip, Go, crates.io, etc.) and CVSS score. No auth required.

## Lessons Learned
- Digest format: Markdown with clickable links, under 4000 chars
- Always save files AND commit before logging
- `notify.sh` requires manual approval in CI environment (not auto-allowed)
- Code health: no tests exist, monolithic workflow (426 lines), dead `pr-body.txt` — see [topics/code-health.md](topics/code-health.md)

## Tracked Tokens
| CoinGecko ID | Symbol | Alert Threshold (24h %) | Price Threshold |
|--------------|--------|------------------------|-----------------|
| bitcoin | BTC | 10% | — |
| ethereum | ETH | 10% | — |
| solana | SOL | 10% | — |

## Next Priorities
- Send first digest *(stalled since 2026-03-10 — skill built but not yet executed)*
- Continue daily digests
- Address code health findings: remove dead files, add tests, split workflow
- Reddit JSON API blocked from GitHub Actions IPs; use indirect web search as fallback
- Consider alternative Reddit data sources (API blocked from GH Actions)
