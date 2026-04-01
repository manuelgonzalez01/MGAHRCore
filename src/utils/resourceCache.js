const resourceCache = new Map();

export function readCachedResource(key) {
  const entry = resourceCache.get(key);
  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    resourceCache.delete(key);
    return null;
  }

  return entry.value;
}

export function loadCachedResource(key, loader, ttlMs = 15_000) {
  const cached = readCachedResource(key);
  if (cached) {
    return cached;
  }

  const pending = Promise.resolve()
    .then(loader)
    .catch((error) => {
      resourceCache.delete(key);
      throw error;
    });

  resourceCache.set(key, {
    expiresAt: Date.now() + ttlMs,
    value: pending,
  });

  return pending;
}

export function invalidateCachedResource(key) {
  resourceCache.delete(key);
}

export function invalidateCachedResourcesByPrefix(prefix) {
  for (const key of resourceCache.keys()) {
    if (key.startsWith(prefix)) {
      resourceCache.delete(key);
    }
  }
}
