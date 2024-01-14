import http from "node:http";

export class Context {
  public req: ContextRequest;
  public res: http.ServerResponse<http.IncomingMessage>;
  private headerProperty: any = {};
  private statusProperty: number | undefined;
  private responseProperty: any;

  constructor(
    req: http.IncomingMessage,
    res: http.ServerResponse<http.IncomingMessage>,
    params: any,
    query: any,
  ) {
    this.res = res;
    this.req = req as ContextRequest;
    this.req.params = params;
    this.req.query = query;
    this.req.header = (key: string) => req.headers[key] ?? ""
    this.req.json = <T>(): Promise<T> =>
      new Promise((resolve, reject) => {
        let data = "";

        const timer = setTimeout(() => {
          if (!data) {
            reject(new Error("Timed out parsing body"));
          }
        }, 1_000);

        req.on("data", (chunk) => {
          clearTimeout(timer);
          data += chunk.toString();
        });

        req.on("end", () => {
          clearTimeout(timer);
          try {
            resolve(data ? JSON.parse(data) : {});
          } catch (err) {
            reject(err);
          }
        });

        req.on("error", (err) => {
          clearTimeout(timer);
          reject(err);
        });
      });
  }

  json(response: object) {
    this.header("Content-Type", "application/json");
    this.responseProperty = JSON.stringify(response);
  }

  text(response: string) {
    this.header("Content-Type", "text/plain");
    this.responseProperty = response;
  }

  header(key: string, value: string) {
    this.headerProperty[key] = value;
  }

  end() {
    this.res.writeHead(this.statusProperty ?? 200, {
      "Content-Type": "text/plain",
      ...this.headerProperty,
    });
    this.res.end(this.responseProperty ?? "");
  }

  status(status: number) {
    this.statusProperty = status;
  }
}

interface ContextRequest extends http.IncomingMessage {
  params: any;
  query: any;
  json: <T>() => Promise<T>;
  header: (key: string) => string | string[];
}
