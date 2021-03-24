import { IncomingMessage, ServerResponse } from "http";
import {push, pop, popAndSend, Package} from "./recover";

function isErrorCode(code: number) {
    return code >= 500;
}

export default function handler(body: string, req: IncomingMessage, res: ServerResponse) {
    if(!isErrorCode(res.statusCode))
        return;

    let p: Package = {
        headers: req.headers,
        method: req.method,
        body: body,
        retries: 0,
        route: req.url,
        error: res.statusCode
    };
    console.log(p);
    push(process.env.NAME, p);
}