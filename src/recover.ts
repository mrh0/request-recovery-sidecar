import Redis = require("ioredis");
import fetch = require("node-fetch");

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
    console.log("REDIS!");
    return redis.lpush(name, JSON.stringify(packet));
}

export async function pop(name) {
    return JSON.parse(await redis.lpop(name)) as Package;
}

export async function popAndSend(name) {
    let count = await redis.llen(name);
    while(count--) {
        let p = await pop(name);
        try {
            await fetch(p.route, {method: p.method, headers: p.headers, body: p.body});
        }
        catch(e) {
            p.retries++;
            if(p.retries < parseInt(process.env.MAX_RETRIES))
                await push(name, p);
            console.error("popAndSend", e);
        }
    }
}