import { expect, describe, it, beforeAll, afterAll } from "vitest";
import { Liviano } from "../../src";
import { cors } from "../../src/cors";

describe("Cors Middleware", () => {
  const app = new Liviano();
  const PORT = 1002;
  const url = (path: string) => `http://localhost:${PORT}${path}`;

  const ALLOWED_ORIGIN = "https://allowed-origin.com";
  const DISALLOWED_ORIGIN = "https://disallowed-origin.com";
  beforeAll(() => {
    app.use(
      cors({
        origin: ALLOWED_ORIGIN,
        allowMethods: ["GET", "POST"],
        allowHeaders: ["Content-Type", "Authorization"],
        exposeHeaders: ["X-Custom-Header"],
      }),
    );

    app.get("/", (c) => {
      c.json({ message: "I am a JSON response" });
    });

    app.listen(PORT);
  });

  afterAll(() => {
    app.close();
  });

  it("should allow requests from allowed origins", async () => {
    const path = url("/");
    const res = await fetch(path, {
      method: "GET",
      headers: {
        Origin: ALLOWED_ORIGIN,
      },
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ message: "I am a JSON response" });
  });

  it("should reject requests from disallowed origins", async () => {
    const path = url("/");
    const res = await fetch(path, {
      method: "OPTIONS",
      headers: {
        Origin: DISALLOWED_ORIGIN,
      },
    });
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json).toEqual({ message: "Forbidden" });
  });

  it("should respond with allowed headers", async () => {
    const path = url("/");
    const res = await fetch(path, {
      method: "OPTIONS",
      headers: {
        Origin: ALLOWED_ORIGIN,
        "Access-Control-Request-Headers": "Content-Type, Authorization",
      },
    });

    const allowHeaders = res.headers.get("Access-Control-Allow-Headers");
    expect(allowHeaders).not.toBeNull();
    expect(allowHeaders).toContain("Content-Type, Authorization");
  });

  it("should respond with allowed methods", async () => {
    const path = url("/");
    const res = await fetch(path, {
      method: "OPTIONS",
      headers: {
        Origin: ALLOWED_ORIGIN,
      },
    });
    expect(res.headers.get("Access-Control-Allow-Methods")).toContain(
      "GET, POST",
    );
  });

  it("should handle credentials correctly", async () => {
    const path = url("/");
    const res = await fetch(path, {
      method: "GET",
      headers: {
        Origin: ALLOWED_ORIGIN,
      },
      credentials: "include",
    });
    expect(res.status).toBe(200);
  });

  it("should allow preflight for POST requests", async () => {
    const path = url("/");
    const res = await fetch(path, {
      method: "OPTIONS",
      headers: {
        Origin: ALLOWED_ORIGIN,
        "Access-Control-Request-Method": "POST",
      },
    });
    expect(res.status).toBe(204);
  });

  it("should expose specific headers", async () => {
    const path = url("/");
    const res = await fetch(path, {
      method: "GET",
      headers: {
        Origin: ALLOWED_ORIGIN,
      },
    });

    const exposeHeaders = res.headers.get("Access-Control-Expose-Headers");
    expect(exposeHeaders).not.toBeNull();
    expect(exposeHeaders).toContain("X-Custom-Header");
  });
});
