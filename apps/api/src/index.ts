import { createApp } from "./app";

declare const Bun: {
  serve: (options: {
    port: number;
    fetch: typeof app.fetch;
  }) => unknown;
};

const app = createApp();
const port = Number(process.env.PORT ?? 3000);

console.log(`toki-api listening on http://localhost:${port}`);

const serverOptions = {
  port,
  fetch: app.fetch
};

Bun.serve(serverOptions);
