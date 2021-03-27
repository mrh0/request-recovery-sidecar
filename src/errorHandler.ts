import { IncomingMessage, ServerResponse } from "http";
import {push, pop, Package} from "./recover";

function isErrorCode(code: number) {
    return code >= 500;
}

export default function handler(body: string, req: IncomingMessage, res: ServerResponse, error: number) {
    if(!isErrorCode(error))
        return;
    let p: Package = {
        headers: req.headers,
        method: req.method,
        body: body,
        retries: 0,
        route: req.url,
        error: error
    };
    console.log("HANDLER", p);
    push(process.env.NAME, p);
}