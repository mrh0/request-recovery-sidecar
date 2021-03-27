import Redis = require("ioredis");
import fetch = require("node-fetch");

const max_batch = parseInt(process.env.RECOVER_BATCH);
const max_retries = parseInt(process.env.MAX_RETRIES);
console.log("max_batch", max_batch);

export interface Package {
    route: string,
    body: any,
    headers: object,
    method: string,
    error?: any,
    retries: number,
}

// docker run -p 6379:6379 redis
const redis = new Redis(6379);

export async function push(name, packet: Package) {
    return redis.lpush(name, JSON.stringify(packet));
}

export async function pop(name) {
    return JSON.parse(await redis.lpop(name)) as Package;
}

export async function recover(name) {
    let count = await redis.llen(name);
    let failed = 0;
    while(count > 0) {
        let b = 0;
        let batch: Promise<any>[] = [];
        while(count-- && b++ < max_batch)
            batch.push(popAndSend(name))
        await Promise.all(batch);
    }
    return {before: count, now: await redis.llen(name), failed: failed};
}

export async function getLen(name: string) {
    return redis.llen(name);
}

async function popAndSend(name: string) {
    let failed = 0;
    let p = await pop(name);
    try {
        await fetch(process.env.TARGET + p.route, {method: p.method, headers: p.headers, body: JSON.stringify(p.body)});
        console.log("SEND RECOVER", p.method);
    }
    catch(e) {
        p.retries++;
        if(p.retries < max_retries) {
            await push(name, p);
            console.error("ERROR TO RECOVER:", JSON.stringify(p), e);
        }
        else {
            console.error("FAILED TO RECOVER:", JSON.stringify(p));
            failed++;
        }
    }
    return {failed: failed};
}