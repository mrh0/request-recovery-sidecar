import { IncomingMessage, ServerResponse } from "http";
import {push, Package} from "./recover";
import filter from "./filter";

function isAllowedErrorCode(code: number) {
    return filter.allowedHTTPCode(code);
}

function isAllowedMethod(method: string) {
    return filter.allowedMethod(method);
}

function isAllowedRoute(route: string) {
    return filter.allowedRoute(route);
}

/** 
 * @public handles incomming requests.
 * @argument request body, request object, response object, http response code
*/
export default async function handler(body: string, req: IncomingMessage, res: ServerResponse, error: number) {
    if(!isAllowedErrorCode(error))
        return;
    if(!isAllowedMethod(req.method))
        return;
    if(!isAllowedRoute(req.url))
        return;
    let p: Package = {
        headers: req.headers,
        method: req.method,
        body: body,
        retries: 0,
        route: req.url,
        error: error
    };

    /*try {
        await sendWithRetries(p);
    }
    catch(err) {
        
    }*/
    await push(process.env.NAME, p);

    if(process.env.DEBUG == "true")
        console.log("DEBUG", "Request was handled", p);
}