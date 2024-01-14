import { Liviano } from "../src";
import { HTTPException } from "../src/http-exception";
import { cors } from "../src/cors";

const app = new Liviano();

app.use(
    cors({
        origin: "*",
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

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Listening to ${PORT}`);
});
