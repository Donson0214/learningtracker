"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = void 0;
const toNumber = (value) => {
    if (!value) {
        return undefined;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
};
const rateLimiter = (options = {}) => {
    const windowMs = options.windowMs ??
        toNumber(process.env.RATE_LIMIT_WINDOW_MS) ??
        60_000;
    const max = options.max ?? toNumber(process.env.RATE_LIMIT_MAX) ?? 300;
    const message = options.message ??
        "Too many requests, please try again later.";
    const store = new Map();
    const cleanup = () => {
        const now = Date.now();
        for (const [key, entry] of store.entries()) {
            if (entry.resetAt <= now) {
                store.delete(key);
            }
        }
    };
    const cleanupTimer = setInterval(cleanup, windowMs);
    cleanupTimer.unref?.();
    return (req, res, next) => {
        if (options.skip?.(req)) {
            return next();
        }
        const key = options.keyGenerator?.(req) ||
            req.ip ||
            req.socket.remoteAddress ||
            "anonymous";
        const now = Date.now();
        const entry = store.get(key);
        if (!entry || entry.resetAt <= now) {
            store.set(key, { count: 1, resetAt: now + windowMs });
            return next();
        }
        entry.count += 1;
        if (entry.count > max) {
            const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
            res.setHeader("Retry-After", retryAfter.toString());
            return res.status(429).json({ message });
        }
        return next();
    };
};
exports.rateLimiter = rateLimiter;
