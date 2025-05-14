import { Counter, Histogram, register } from "prom-client";
import express from "express";

export const requestCounter = new Counter({
  name: "telegram_bot_requests_total",
  help: "count of requests",
  labelNames: ["command"],
});

export const responseCounter = new Counter({
  name: "telegram_bot_responses_total",
  help: "count of responses",
  labelNames: ["command"],
})

export const responseHistogram = new Histogram({
  name: "telegram_bot_response_duration_seconds",
  help: "response duration in seconds",
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

const app = express();
const port = 3000;

app.get("/metrics", async (_req, res) => {
  try {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(port, () => {
  console.log(`сервер запущен на порту ${port}`);
})
