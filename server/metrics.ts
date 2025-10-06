interface Counter { name: string; value: number; }

class MetricsRegistry {
  private counters: Map<string, Counter> = new Map();
  private start = Date.now();

  inc(name: string, delta = 1) {
    const c = this.counters.get(name) || { name, value: 0 };
    c.value += delta;
    this.counters.set(name, c);
  }

  snapshot() {
    return Array.from(this.counters.values()).reduce<Record<string, number>>((acc, c) => { acc[c.name] = c.value; return acc; }, {});
  }

  uptimeSeconds() { return Math.floor((Date.now() - this.start) / 1000); }
}

export const metrics = new MetricsRegistry();

export function recordApiCall(path: string, status: number) {
  metrics.inc('api.calls.total');
  metrics.inc(`api.status.${status}`);
  if (path.startsWith('/api/repositories')) metrics.inc('api.calls.repositories');
}
