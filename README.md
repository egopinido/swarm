# 🐝 Omudia Swarm (`@omudia/swarm`)
### Distributed Multi-Provider Orchestrator, Circuit Breaker & High-Availability Proxy

Part of the **[Omudia Ecosystem](https://omudia.com)**.

[![License](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-success.svg)](https://omudia.com)
[![Ecosystem](https://img.shields.io/badge/Ecosystem-Omudia-7C3AED.svg)](https://github.com/egopinido)

---

## 📖 Overview

`@omudia/swarm` is the high-concurrency resilience engine behind Omudia's 99.9% uptime architecture. It abstracts downstream network variability through an automated 3-state Circuit Breaker (`CLOSED`, `OPEN`, `HALF_OPEN`), intelligent load distribution, and automated failover across redundant provider edge nodes.

## ✨ Key Capabilities

- **Finite State Circuit Breaker:** Trips instantly upon repeated upstream timeouts or faults, insulating client traffic.
- **Auto-Healing Half-Open Probing:** Safely tests recovering upstreams before restoring full routing load.
- **Least-Connection Balancing:** Dynamically selects the healthiest node with minimal active connections.
- **Zero-Downtime Resilience:** Eliminates single points of failure across all 16+ supported social platforms.

## 🚀 Installation & Usage

```bash
npm install @omudia/swarm
```

```javascript
const { SwarmCluster } = require('@omudia/swarm');

const cluster = new SwarmCluster();

// Register distributed edge nodes
cluster.registerNode('edge-dubai', 'primary-provider', 1);
cluster.registerNode('edge-frankfurt', 'backup-provider', 1);

// Dispatch through optimal circuit
async function dispatchOrder(orderPayload) {
  const result = await cluster.dispatch(async () => {
    // Perform outbound API handoff
    return { status: 'DISPATCHED', orderPayload };
  });

  console.log(`Routed cleanly through ${result.node}`);
}

dispatchOrder({ target: '@example', platform: 'telegram' });
```

---

## 🔗 Related Omudia Repositories

- [🎯 Omudia Goal (`egopinido/goal`)](https://github.com/egopinido/goal) — Quantitative milestone tracker & completion predictor.
- [⚡ Omudia Boost (`egopinido/boost`)](https://github.com/egopinido/boost) — High-velocity engagement & FYP acceleration dispatcher.
- [🌐 Official Platforms Directory](https://omudia.com/platforms) — 16+ supported platforms with live capabilities.

---

© 2026 Omudia Ecosystem.

