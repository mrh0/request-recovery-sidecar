import Redis = require("ioredis");
import fetch = require("node-fetch");

// Max number of requests in a recovery batch.
const max_batch = parseInt(process.env.RECOVER_BATCH);
// Max number of failed recovers for a request before it is discarded.
const max_retries = parseInt(process.env.MAX_RETRIES);

export interface Package {
    route: string,
    body: any,
    headers: object,
    method: string,
    error?: any,
    retries: number,
}

// docker run -p 6379:6379 redis
const redis = new Redis(process.env.REDIS_PORT);

/** 
 * @public Add a request to the database.
 * @argument service name
 */
export async function push(name, packet: Package) {
    return redis.lpush(name, JSON.stringify(packet));
}

/** 
 * @public Get the first stored request.
 * @argument service name
 */
export async function pop(name) {
    return JSON.parse(await redis.lpop(name)) as Package;
}

/** 
 * @public Trigger the recovery process.
 * @argument service name
 */
export async function recover(name) {
    console.log("LOG", "'"+name+"'", "Recovery triggered");
    let count = await redis.llen(name);
    console.log("LOG", count, "in:", "'"+name+"'", );
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

/** 
 * @public Get number of requests in the database.
 * @argument service name
 */
export async function getLen(name: string) {
    return redis.llen(name);
}

// Sends stored requests.
async function popAndSend(name: string) {
    let failed = 0;
    let p = await pop(name);
    try {
        await send(p);
        if(process.env.DEBUG == "true")
            console.log("DEBUG", "Sending http request using method", p.method);
    }
    catch(e) {
        p.retries++;
        if(p.retries < max_retries) {
            await push(name, p);
            console.log("LOG", "Error when recovering request", e);
        }
        else {
            console.error("ERROR", "Failed to recover (discarded request):", e, JSON.stringify(p));
            failed++;
        }
    }
    return {failed: failed};
}

/*export async function sendWithRetries(p: Package) {
    let i = parseInt(process.env.RETRIES);
    while(i > 0) {
        try {
            await send(p);
            if(process.env.DEBUG == "true")
                console.log("DEBUG", "Retried failed request", p.method);
            return;
        }
        catch(e) {
            i--;
        }
    }
    throw "failed retries";
}*/

async function send(p: Package) {
    return fetch(process.env.TARGET + p.route, {method: p.method, headers: p.headers, body: JSON.stringify(p.body)});
}