export default {
    // HTTP methods that will be handled by the recovery system.
    allowedMethod: (method: string) => method != "GET",
    // Routes that will be handeled by the recovery system.
    allowedRoute: (route: string) => true,
    // HTTP response codes that will be handeled by the recovery system.
    allowedHTTPCode: (code: number) => code >= 500
}