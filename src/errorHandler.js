const { IncomingMessage, ServerResponse } = require("http");
const {push} = require("./recover");
const filter = require("./filter");

function isAllowedErrorCode(code) {
    return filter.allowedHTTPCode(code);
}

function isAllowedMethod(method) {
    return filter.allowedMethod(method);
}

function isAllowedRoute(route) {
    return filter.allowedRoute(route);
}

/** 
 * @public handles incomming requests.
 * @argument request body, request object, response object, http response code
*/
module.exports = async function handler(body, req, res, error) {
    if(!isAllowedErrorCode(error))
        return;
    if(!isAllowedMethod(req.method))
        return;
    if(!isAllowedRoute(req.url))
        return;
    let p = {
        headers: req.headers,
        method: req.method,
        body: body,
        retries: 0,
        route: req.url,
        error: error
    };

    await push(process.env.NAME, p);

    if(process.env.DEBUG == "true")
        console.info("Request was handled", p);
}