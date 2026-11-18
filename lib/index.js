'use strict';

/**
 * Omudia Swarm Mesh & Circuit Breaker Engine
 * Provides resilient provider failover, node health tracking, and circuit-breaker isolation.
 */
const States = {
  CLOSED: 'CLOSED',       // Normal operation
  OPEN: 'OPEN',           // Tripped, failing fast
  HALF_OPEN: 'HALF_OPEN'  // Testing recovery
};

class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 3;
    this.resetTimeoutMs = options.resetTimeoutMs || 2000;
    this.state = States.CLOSED;
    this.failureCount = 0;
    this.nextAttempt = Date.now();
  }

  canExecute() {
    if (this.state === States.CLOSED) return true;
    if (this.state === States.OPEN) {
      if (Date.now() >= this.nextAttempt) {
        this.state = States.HALF_OPEN;
        return true;
      }
      return false;
    }
    return true; // HALF_OPEN
  }

  recordSuccess() {
    this.failureCount = 0;
    this.state = States.CLOSED;
  }

  recordFailure() {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold || this.state === States.HALF_OPEN) {
      this.state = States.OPEN;
      this.nextAttempt = Date.now() + this.resetTimeoutMs;
    }
  }

  async execute(action) {
    if (!this.canExecute()) {
      throw new Error(`CircuitBreaker is OPEN. Execution blocked.`);
    }

    try {
      const result = await action();
      this.recordSuccess();
      return result;
    } catch (err) {
      this.recordFailure();
      throw err;
    }
  }
}

class SwarmNode {
  constructor(id, provider, weight = 1) {
    this.id = id;
    this.provider = provider;
    this.weight = weight;
    this.activeConnections = 0;
    this.circuit = new CircuitBreaker();
    this.isHealthy = true;
  }
}

class SwarmCluster {
  constructor() {
    this.nodes = new Map();
  }

  registerNode(id, provider, weight = 1) {
    const node = new SwarmNode(id, provider, weight);
    this.nodes.set(id, node);
    return node;
  }

  /**
   * Route request to least-loaded healthy node with closed circuit
   */
  getOptimalNode() {
    const available = Array.from(this.nodes.values()).filter(
      n => n.isHealthy && n.circuit.canExecute()
    );

    if (available.length === 0) {
      throw new Error('All swarm nodes are degraded or tripped.');
    }

    available.sort((a, b) => a.activeConnections - b.activeConnections);
    return available[0];
  }

  async dispatch(action) {
    const node = this.getOptimalNode();
    node.activeConnections++;
    try {
      const res = await node.circuit.execute(action);
      return { node: node.id, result: res };
    } finally {
      node.activeConnections--;
    }
  }

  getStatus() {
    const status = {};
    for (const [id, node] of this.nodes) {
      status[id] = {
        state: node.circuit.state,
        failures: node.circuit.failureCount,
        active: node.activeConnections,
        healthy: node.isHealthy
      };
    }
    return status;
  }
}

module.exports = { SwarmCluster, CircuitBreaker, States };

