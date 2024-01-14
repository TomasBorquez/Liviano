import { describe, it, expect } from "vitest";

import { Liviano } from "../../src";
import { HTTPException } from "../../src/http-exception";
import { cors } from "../../src/cors";

const app = new Liviano();
const PORT = 3003;
const ALLOWED_ORIGIN = "https://allowed-origin.com";
const DISALLOWED_ORIGIN = "https://disallowed-origin.com";
describe("Example one - Full application", () => {
  const url = (path: string) => `http://localhost:${PORT}/api${path}`;
  createServer();

  it("should respond the base endpoint", async () => {
    const res = await fetch(url("/"));
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toBe("I'm an the base endpoint");
  });

  it("should allow entry to the party for age >= 18", async () => {
    const res = await fetch(url("/party"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ age: "18" }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ message: "Hello welcome to the party 🤠🤙" });
  });


  it("should NOT allow entry to the party for age <= 18", async () => {
    const res = await fetch(url("/party"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ age: "17" }),
    });
    expect(res.status).toBe(405);
    const json = await res.json();
    expect(json).toEqual({ message: "Test: Kids are not allowed to the party 😡" });
  });

  const methods = ["GET", "POST", "PUT", "DELETE"];
  methods.forEach((method) => {
    it(`handles ${method} request at '/all'`, async () => {
      const res = await fetch(url("/all"), { method });
      expect(res.status).toBe(200);
      const text = await res.text();
      expect(text).toBe("I'm the '/all' endpoint");
    });
  });

  it("responds with not found for unknown routes", async () => {
    const res = await fetch(url("/unknown"));
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json).toEqual({ message: "What are you doing here? 🤔" });
  });

  it("handles server errors correctly", async () => {
    const res = await fetch(url("/error"));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json).toEqual({ message: "Test: Internal Server Error" });
  });

  it("allows requests from specified origin", async () => {
    const res = await fetch(url("/"), {
      method: "OPTIONS",
      headers: {
        Origin: ALLOWED_ORIGIN,
      },
    });
    expect(res.status).toBe(204);
  });

  it("rejects requests from non-specified origin", async () => {
    const res = await fetch(url("/"), {
      method: "OPTIONS",
      headers: {
        Origin: DISALLOWED_ORIGIN,
      },
    });
    expect(res.status).toBe(403);
    const body = await res.json()
    expect(body).toEqual({ message: "Test: Forbidden" })
  });
});

function createServer() {
  app.use(
    cors({
      origin: ALLOWED_ORIGIN,
    }),
  );

  app.basePath("/api");

  app.get("/", async (c) => {
    c.text("I'm an the base endpoint");
  });

  app.post(
    "/party",
    async (c, next) => {
      const body = await c.req.json<{ age: string }>();
      if (Number(body?.age) >= 18) {
        await next();
      } else {
        throw new HTTPException(405, {
          message: "Kids are not allowed to the party 😡",
        });
      }
    },
    async (c) => {
      c.json({ message: "Hello welcome to the party 🤠🤙" });
    },
  );

  app.get("/error", () => {
    throw new HTTPException(500, { message: "Internal Server Error" });
  });

  app.all("/all", (c) => {
    c.text(`I'm the '/all' endpoint`);
  });

  app.onError((e, c) => {
    c.status(e.status);
    c.json({ message: `Test: ${e.message}` });
  });

  app.notFound((c) => {
    c.status(404);
    c.json({ message: "What are you doing here? 🤔" });
  });

  app.listen(PORT, () => {
    console.log(`Listening to ${PORT}`);
  });
}
