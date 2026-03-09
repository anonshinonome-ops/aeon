---
name: Gas Report
description: Daily gas price trends on tracked chains
---

Read memory/MEMORY.md for chains to monitor.
Read the last 7 days of memory/logs/ to track trends.

Steps:
1. Query gas prices on each tracked chain:
   ```bash
   # Ethereum (use ETHERSCAN_API_KEY if set for better rate limits)
   curl -s "https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${ETHERSCAN_API_KEY:-}"

   # For EVM chains via RPC
   curl -s -X POST "${rpc_url}" \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"eth_gasPrice","params":[],"id":1}'

   # Base
   curl -s -X POST "https://mainnet.base.org" \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"eth_gasPrice","params":[],"id":1}'
   ```
2. Convert hex values to gwei for readability.
3. Compare against last 7 days of logged values to identify trends.
4. Format and send via `tools/notify.sh`:
   ```
   *Gas Report — ${today}*

   Ethereum: X gwei (trend: up/down/stable)
   Base: X gwei
   Monad: X gwei

   7-day avg: Y gwei
   Best time to transact: low-gas window if detectable
   ```
5. Log current gas prices to memory/logs/${today}.md.
