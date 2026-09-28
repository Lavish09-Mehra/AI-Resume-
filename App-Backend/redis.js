// ============================================================
//  Redis connection  (App-Backend/redis.js)
// ------------------------------------------------------------
//  Resumes are stored HERE, temporarily — never in MongoDB.
//
//  Keys written by Routing/extract.js:
//     resume:<uuid>     -> extracted resume text   TTL 3600s
//     analysis:<uuid>   -> AI analysis (JSON)      TTL 3600s
//
//  Redis deletes both automatically after 1 hour.
//
//  NOTE: this client is used ONLY inside Express. It is never
//  exposed to the React frontend, and no passwords / API keys
//  / .env secrets are ever written to it.
// ============================================================

import { createClient } from 'redis';

const REDIS_URL = 'redis://127.0.0.1:6379';

const redisClient = createClient({
    url: REDIS_URL,

    // FAIL FAST when Redis is unavailable.
    // Without this, node-redis queues commands offline forever, so the
    // route's try/catch never fires and the HTTP request just hangs with
    // no response at all. With it, setEx()/get() reject immediately and
    // extract.js can answer 503 instead of hanging.
    disableOfflineQueue: true,

    socket: {
        // Don't block a connect attempt indefinitely either
        connectTimeout: 5000,
    },
});

// ------------------------------------------------------------
// 10) Error handling — an 'error' event with NO listener would
//     crash the whole Node process, so we always attach one and
//     log it clearly instead of swallowing it.
// ------------------------------------------------------------
redisClient.on('error', (err) => {
    console.error('[Redis] Connection error:', err.message);
});

redisClient.on('connect', () => {
    console.log('[Redis] Connecting to', REDIS_URL);
});

redisClient.on('ready', () => {
    console.log('[Redis] Ready — storing resumes with a 1 hour TTL');
});

redisClient.on('end', () => {
    console.log('[Redis] Connection closed');
});

// ------------------------------------------------------------
// 2) Connect when the backend starts.
//    A failed startup must NOT take the server down, so the
//    rejection is caught and logged — Express keeps serving.
// ------------------------------------------------------------
redisClient.connect().catch((err) => {
    console.error('[Redis] Failed to connect:', err.message);
});

export { redisClient };
