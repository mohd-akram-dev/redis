import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
const QUEUE_KEY = "queue:emails";
app.post("/emails", async (req, res) => {
  const { to, subject, body } = req.body;
  const job = {
    to: to || "No Content",
    subject: body || "No Content",
    body: body || "No Content",
    createdAt: new Date().toISOString(),
  };

  await redis.lpush(QUEUE_KEY, JSON.stringify(job));
  res.json({ queued: true, job });
});

app.get("/emails/process-one", async (req, res) => {
  const rawJob = await redis.rpop(QUEUE_KEY);

  if (!rawJob) {
    return res.json({ message: "No Jobs in the queue" });
  }

  const job = JSON.parse(rawJob);
  res.json({ message: "Email sent", job });
});

app.listen(3000, () => {
  console.log(`Server is running on PORT 3000`);
});
