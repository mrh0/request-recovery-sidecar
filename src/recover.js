const Redis = require("ioredis");
const fetch = require("node-fetch");
const filter = require("./filter");

/*export interface Package {
    route: string,
    body: any,
    headers: object,
    method: string,
    error?: any,
    retries: number,
}*/

// docker run -p 6379:6379 redis
const redis = new Redis(process.env.REDIS_PORT);

/** 
 * @public Add a request to the database.
 * @argument service name
 */
async function push(name, packet) {
    return redis.lpush(name, JSON.stringify(packet));
}

/** 
 * @public Get the first stored request.
 * @argument service name
 */
async function pop(name) {
    return JSON.parse(await redis.lpop(name));
}

/** 
 * @public Trigger the recovery process.
 * @argument service name
 */
async function recover(name) {
    // Max number of requests in a recovery batch.
    const max_batch = parseInt(process.env.RECOVER_BATCH);
    // Max number of failed recovers for a request before it is discarded.
    const max_retries = parseInt(process.env.MAX_RETRIES);

    let count = await getLen(name);
    console.info("Recovery triggered,", count, "in:", "'"+name+"'");
    let db = [];
    for(i = 0; i < count; i++)
        db.push(await pop(name));
    let failed = 0;
    count = db.length;
    while(count > 0) {
        let b = 0;
        let batch = [];
        while(count && b++ < max_batch) {
            count--;
            batch.push(popAndSend(name, db[count], max_retries))
        }
        await Promise.all(batch);
    }
    return {before: count, now: await getLen(name), failed: failed};
}

/** 
 * @public Get number of requests in the database.
 * @argument service name
 * @returns promise of number of messages in Redis
 */
function getLen(name) {
    return redis.llen(name);
}

// Sends stored requests.
async function popAndSend(name, p, max_retries) {
    let failed = 0;
    try {
        await send(p);
        if(process.env.DEBUG == "true")
            console.debug("Sending http request using method", p.method);
    }
    catch(e) {
        p.retries++;
        if(p.retries < max_retries) {
            await push(name, p);
            if(process.env.DEBUG == "true")
                console.debug("Error when recovering request", e);
        }
        else {
            console.warn("WARN", "Failed to recover (discarded request):", p.method, p.route, e);
            if(process.env.DEBUG == "true")
                console.debug("Discarded request", JSON.stringify(p));
            failed++;
        }
    }
    return {failed: failed};
}

async function send(p) {
    let result = await fetch(process.env.TARGET + p.route, {method: p.method, headers: p.headers, body: JSON.stringify(p.body)});
    if(filter.allowedHTTPCode(result.status))
        throw "invalid responsecode";
    return result;
}

module.exports = {push: push, pop: pop, recover: recover, getLen: getLen};