<div align="center">
    <img src="https://cdn.discordapp.com/attachments/1041386176583585884/1196046568642584626/Liviano.png?ex=65b6342b&is=65a3bf2b&hm=d8c8d6d8af0505fcab39f9aa8f37ddc60a766249b9812d53450dab5d70270ea5&" width="500" height="auto" alt="Liviano"/>
</div>

<hr />

[![Tests](https://github.com/TomasBorquez/Liviano/actions/workflows/test.yml/badge.svg)](https://github.com/TomasBorquez/Liviano/actions/workflows/test.yml)

**Liviano** - _**\[Light\] in Spanish**_ - is a lightweight, flexible,
and easy-to-use web framework for modern web development. It's designed
to offer a delightful developer experience while being robust and efficient
for production use.

Simple, yet powerful.

```ts
import { Liviano } from "liviano";

const app = new Liviano();

app.get("/", (c) => c.json("Welcome to the lightest framework"));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Listening to ${PORT} 🤙`);
});
```

## Features
- **Lightweight 🍃**- Liviano is designed to be minimal and efficient, focusing on the essentials.
- **Flexible 🌿** - Easily extendable with middlewares and custom routes.
- **Easy-to-Use 😃** - Intuitive API that's easy to pick up and start developing.
- **Modern 🌟** - Built with modern JavaScript features and practices.
- **Versatile 🛠**️ - Suitable for a wide range of web applications, from small projects to large-scale services.

## Authors
[Tomas Borquez](https://github.com/TomasBorquez) - Creator of Liviano