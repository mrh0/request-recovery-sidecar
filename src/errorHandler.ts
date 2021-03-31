import { IncomingMessage, ServerResponse } from "http";
import {push, pop, Package} from "./recover";

function isErrorCode(code: number) {
    return code >= 500;
}

function isValidMethod(method: string) {
    return method != "GET";
}

export default function handler(body: string, req: IncomingMessage, res: ServerResponse, error: number) {
    if(!isErrorCode(error))
        return;
    if(!isValidMethod(req.method))
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