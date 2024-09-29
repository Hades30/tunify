const { Queue, Worker } = require("bullmq");
const IORedis = require("ioredis");
const User = require("./models/user");
const Token = require("./models/tenantTokens");
const Song = require("./models/song");
const { refreshToken } = require("./utils/refreshToken");
const fetch = require("node-fetch");

const connection = new IORedis({
  host: "localhost", // your Redis host
  port: 6379, // your Redis port
  maxRetriesPerRequest: null, // Disable retry limits to prevent request errors
});

const { BullMQAdapter } = require("@bull-board/api/bullMQAdapter");
const { createBullBoard } = require("@bull-board/api");
const { ExpressAdapter } = require("@bull-board/express");

// Initialize the queue
const userTaskQueue = new Queue("userTaskQueue", {
  connection,
});

function setupBullBoard() {
  // Initialize BullBoard
  const serverAdapter = new ExpressAdapter();
  createBullBoard({
    queues: [new BullMQAdapter(userTaskQueue)], // Add your BullMQ queue here
    serverAdapter,
  });

  // Set the base path for BullBoard
  serverAdapter.setBasePath("/admin/queues");

  // Return the router to be used in the main app
  return serverAdapter.getRouter();
}

const createUserJob = async (userId) => {
  const jobId = `user-${userId}`; // Unique job ID for each user

  // Add the job with a delay of 15 minutes and repeat every 15 minutes
  console.log(jobId);
  await userTaskQueue.add(
    "userTaskQueue",
    { userId: userId }, // Job data with user ID
    {
      jobId, // Ensure that a job for this user is added only once
      delay: 5000,
      repeat: { every: 15 * 60 * 1000 }, // Repeat every 15 minut
    }
  );
};

const worker = new Worker(
  "userTaskQueue",
  async (job) => {
    // Process user-related task
    console.log("test");

    try {
      const user = await User.findById(job.data.userId);
      if (user) {
        const token = await Token.findOne({ userId: job.data.userId });
        const refreshedToken = await refreshToken(token, user);
        const currentTimeStamp = Date.now();
        const data = await fetch(
          `https://api.spotify.com/v1/me/player/recently-played?before=${currentTimeStamp}&limit=50`,
          {
            headers: {
              Authorization: `Bearer ${refreshedToken.token}`,
            },
          }
        ).then((response) => response.json());

        const insertData = data.items.map(({ track }) => ({
          tenantTrackId: track.id,
          userId: user.id,
          trackInfo: track,
        }));
        console.log(insertData[0].tenantTrackId);

        Song.create(insertData);
      }
    } catch (err) {
      console.log("error", err);
    }

    console.log(`Processing job for user: ${job.data.userId}`);
    // Here goes the actual task logic for the user
  },
  { connection }
);

// Error handling for worker
worker.on("failed", (job, err) => {
  console.error(
    `Job ${job.id} failed for user ${job.data.userId}: ${err.message}`
  );
});

worker.on("completed", (job) => {
  console.log(
    `Job ${job.id} completed successfully for user ${job.data.userId}`
  );
});

worker.on("stalled", (job) => {
  console.error(`Job ${job.id} stalled`);
});

module.exports = { setupBullBoard, createUserJob };
