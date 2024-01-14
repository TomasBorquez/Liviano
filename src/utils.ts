export function extractParams(pattern: string, match: RegExpMatchArray) {
    const paramNames = pattern.match(/:([^\/]+)/g) || [];
    const params: any = {};
    paramNames.forEach((name, index) => {
        params[name.substring(1)] = match[index + 1];
    });
    return params;
}