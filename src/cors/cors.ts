import { Context } from "../context";
import { Next } from "../base";
import { HTTPException } from "../http-exception";

interface CorsConfiguration {
    origin?: string | string[]; // Access-Control-Allow-Origin
    allowMethods?: string[]; // Access-Control-Allow-Methods
    allowHeaders?: string[]; // Access-Control-Allow-Headers
    exposeHeaders?: string[]; // Access-Control-Expose-Headers
    credentials?: boolean; // Access-Control-Allow-Credentials
    maxAge?: number | null; // Access-Control-Max-Age
}

const defaultConfiguration: CorsConfiguration = {
    origin: "*",
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
    allowHeaders: [],
    exposeHeaders: [],
    credentials: false,
    maxAge: null,
};

export function cors(configuration?: CorsConfiguration) {
    return async (c: Context, next: Next) => {
        const opts = { ...defaultConfiguration, ...configuration };
        const requestOrigin = c.req.header("origin") as string;

        let isAllowedOrigin;
        if (Array.isArray(opts.origin)) {
            isAllowedOrigin = opts.origin.includes(requestOrigin);
        } else {
            isAllowedOrigin = opts.origin === "*" || opts.origin === requestOrigin;
        }

        if (!isAllowedOrigin && c.req.method === "OPTIONS") {
            throw new HTTPException(403, { message: "Forbidden" });
        }

        c.header("Access-Control-Allow-Origin", requestOrigin);

        if (opts.origin !== "*") {
            c.header("Vary", "Origin");
        }

        if (opts.credentials) {
            c.header("Access-Control-Allow-Credentials", "true");
        }

        if (opts.exposeHeaders?.length) {
            c.header("Access-Control-Expose-Headers", opts.exposeHeaders.join(", "));
        }

        if (c.req.method !== "OPTIONS") {
            return await next();
        } else {
            if (opts.allowMethods?.length) {
                c.header("Access-Control-Allow-Methods", opts.allowMethods.join(", "));
            }

            if (opts.allowHeaders?.length) {
                c.header("Access-Control-Allow-Headers", opts.allowHeaders.join(", "));
            }

            if (opts.maxAge) {
                c.header("Access-Control-Max-Age", opts.maxAge.toString());
            }

            c.status(204);
        }
    };
}
