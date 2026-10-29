import time
import asyncio
from typing import Any, Optional, Dict


class InMemoryTTLCache:
    """Thread-safe and async-friendly in-memory cache with TTL expiration."""
    def __init__(self):
        self._cache: Dict[str, tuple[float, Any]] = {}
        self._lock = asyncio.Lock()

    async def get(self, key: str) -> Optional[Any]:
        async with self._lock:
            if key not in self._cache:
                return None
            expires_at, value = self._cache[key]
            if time.time() > expires_at:
                del self._cache[key]
                return None
            return value

    async def set(self, key: str, value: Any, ttl_seconds: int) -> None:
        async with self._lock:
            expires_at = time.time() + ttl_seconds
            self._cache[key] = (expires_at, value)

    async def clear(self) -> None:
        async with self._lock:
            self._cache.clear()


# Global cache instance
cache_service = InMemoryTTLCache()
