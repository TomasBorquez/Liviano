import http from "node:http";
import url from "node:url";
import { Context } from "./context";
import { extractParams } from "./utils";
import { HTTPException } from "./http-exception";

export default class Liviano {
  private server;
  private routes: Route[] = [];
  private basePathProperty = "";
  private middleWares: ContextFunction[] = [];
  private notFoundHandler: (c: Context) => void = (c) => {
    c.status(404);
    c.json({ message: `Route "${c.req.url}" does not exist` });
  };
  private onErrorHandler: (e: HTTPException, c: Context) => void = (e, c) => {
    c.status(e.status);
    c.json({ message: e.message });
  };

  constructor() {
    this.server = http.createServer(async (req, res) => {
      let context = new Context(req, res, {}, {});
      try {
        if (req.url) {
          const parsedUrl = url.parse(req.url, true);
          const pathname = parsedUrl.pathname ?? "";
          const query = parsedUrl.query;

          let found = false;
          for (const route of this.routes) {
            if (this.isMethodInvalid(req.method, route.method)) continue;
            const match = pathname.match(route.pattern);
            if (match) {
              const params = extractParams(route.path, match);
              let index = 0;
              found = true;
              context = new Context(req, res, params, query);

              async function nextHandler() {
                index++;
                if (index <= route.handlers.length)
                  await route.handlers[index](context, nextHandler);
              }

              await route.handlers[index](context, nextHandler);
            }
          }

          if (!found) this.notFoundHandler(context);
        }
      } catch (e) {
        if (e instanceof HTTPException) {
          this.onErrorHandler(e, context);
        } else {
          console.error(e);
          context.status(500);
          context.json({ message: "Internal Server Error" });
        }
      } finally {
        context.end();
      }
    });
  }

  public isMethodInvalid(reqMethod: string | undefined, routeMethod: string) {
    if (!reqMethod) return true;
    else if (
      reqMethod !== routeMethod &&
      routeMethod !== "ALL" &&
      reqMethod !== "OPTIONS"
    )
      return true;
    return false;
  }

  public get(path: string, ...handlers: ContextFunction[]) {
    return this.on(path, "GET", ...handlers);
  }

  public head(path: string, ...handlers: ContextFunction[]) {
    return this.on(path, "HEAD", ...handlers);
  }

  public post(path: string, ...handlers: ContextFunction[]) {
    return this.on(path, "POST", ...handlers);
  }

  public put(path: string, ...handlers: ContextFunction[]) {
    return this.on(path, "PUT", ...handlers);
  }

  public patch(path: string, ...handlers: ContextFunction[]) {
    return this.on(path, "PATCH", ...handlers);
  }

  public delete(path: string, ...handlers: ContextFunction[]) {
    return this.on(path, "DELETE", ...handlers);
  }

  public all(path: string, ...handlers: ContextFunction[]) {
    return this.on(path, "ALL", ...handlers);
  }

  public use(handler: ContextFunction) {
    this.middleWares.push(handler);
  }

  public on(path: string, method: string, ...handlers: ContextFunction[]) {
    path = this.basePathProperty + path;
    const pattern = path.replace(/:([^\/]+)/g, "([^/]+)");

    this.routes.push({
      method,
      pattern: new RegExp(`^${pattern}$`),
      path,
      handlers: [...this.middleWares, ...handlers],
    });

    return this;
  }

  public onError(cb: (e: HTTPException, c: Context) => void) {
    this.onErrorHandler = cb;
  }

  public notFound(cb: (c: Context) => void) {
    this.notFoundHandler = cb;
  }

  public basePath(path: string) {
    this.basePathProperty = path;
  }

  public listen(port: number, cb?: () => void) {
    try {
      if (cb) return this.server.listen(port, cb);
      else return this.server.listen(port);
    } catch (e) {
      throw new Error(`There was an error attaching listener, ${port} might already be in use`)
    }
  }

  public close(cb?: () => void) {
    this.server.close(() => {
      cb && cb();
    });
  }
}

export type Next = () => Promise<any>;
type ContextFunction =
  | ((c: Context, next: Next) => any)
  | ((c: Context, next: Next) => Promise<any>);
type Route = {
  method: string;
  path: string;
  pattern: RegExp;
  handlers: ContextFunction[];
};
