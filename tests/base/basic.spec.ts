import { expect, describe, test, afterAll } from "vitest";
import { Liviano } from "../../src";
import { Context } from "../../src/context";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];
describe("Basic", () => {
  describe("NORMAL METHODS", () => {
    const app = new Liviano();
    const PORT = 3000;

    app.basePath("/api");
    const url = (path: string) => `http://localhost:${PORT}/api${path}`;

    METHODS.forEach((method) => {
      (app as any)[method.toLowerCase()]("/", (c: Context) => {
        c.text(`Hello I am a ${method} request`);
      });
    });

    app.listen(PORT);

    afterAll(() => {
      app.close();
    });

    test.each(METHODS)(
      "should return 200 response for '/' endpoint at %s",
      async (method) => {
        const path = url("/");
        const res = await fetch(path, {
          method,
        });
        const text = await res.text();
        expect(res.status).toBe(200);
        expect(text).toBe(`Hello I am a ${method} request`);
      },
    );
  });

  describe("ALL", () => {
    const app = new Liviano();
    const PORT = 3001;

    app.basePath("/api");
    const url = (path: string) => `http://localhost:${PORT}/api${path}`;

    app.all("/", (c) => {
      c.text("I am an all request");
    });

    app.listen(PORT);

    afterAll(() => {
      app.close();
    });

    test.each(METHODS)(
      "should return 200 response for '/' ALL endpoint at %s",
      async (method) => {
        const path = url("/");
        const res = await fetch(path, {
          method,
        });
        const text = await res.text();
        expect(res.status).toBe(200);
        expect(text).toBe("I am an all request");
      },
    );
  });
});
