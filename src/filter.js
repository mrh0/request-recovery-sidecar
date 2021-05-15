module.exports = {
    // HTTP methods that will be handled by the recovery system.
    allowedMethod: (method) => method != "GET",
    // Routes that will be handeled by the recovery system.
    allowedRoute: (route) => true,
    // HTTP response codes that will be handeled by the recovery system.
    allowedHTTPCode: (code) => code >= 500
}