const { IncrementalCache } = require('@neshca/cache-handler');
const createRedisCache = require('@neshca/cache-handler/redis-strings').default;
const createLruCache = require('@neshca/cache-handler/local-lru').default;
const { createClient } = require('redis');

if (!process.env.REDIS_URL) {
    console.warn('Make sure that REDIS_URL is added to the .env.local file and loaded properly.');
}

const PREFIX = 'string:';

const client = createClient({
    url: process.env.REDIS_URL,
    name: `cache-handler:${PREFIX}${process.env.PORT ?? process.pid}`,
});

client.on('error', (error) => {
    console.error('Redis error:', error);
});

IncrementalCache.onCreation(async () => {
    console.log('Connecting Redis client...');
    await client.connect();
    console.log('Redis client connected.');

    const redisCache = createRedisCache({
        client,
        keyPrefix: PREFIX,
    });

    const localCache = createLruCache();

    return {
        cache: [redisCache, localCache],
        useFileSystem: true,
    };
});

module.exports = IncrementalCache;
