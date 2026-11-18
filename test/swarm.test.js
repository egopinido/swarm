'use strict';

const assert = require('assert');
const { SwarmCluster, CircuitBreaker, States } = require('../lib/index');

const breaker = new CircuitBreaker({ failureThreshold: 2, resetTimeoutMs: 100 });
assert.strictEqual(breaker.state, States.CLOSED);

// First failure
breaker.recordFailure();
assert.strictEqual(breaker.state, States.CLOSED);

// Second failure trips the breaker
breaker.recordFailure();
assert.strictEqual(breaker.state, States.OPEN);
assert.strictEqual(breaker.canExecute(), false);

// Cluster test
const cluster = new SwarmCluster();
cluster.registerNode('node-alpha', 'fast-edge');
cluster.registerNode('node-beta', 'backup-edge');

const optimal = cluster.getOptimalNode();
assert(optimal.id === 'node-alpha' || optimal.id === 'node-beta');

const status = cluster.getStatus();
assert(status['node-alpha']);
assert(status['node-beta']);

console.log('Omudia Swarm test passed with 100% assertions valid.');

