const { Worker } = require("bullmq");
const User = require("./models/user");
const worker = new Worker(
  "userTaskQueue",
  async (job) => {
    // Process user-related task
    console.log("test");

    try {
      const user = await User.findById(job.data.userId);
      if (user) {
        const token = await Token.findOne({ userId: userId });
        const refreshedToken = await refreshToken(token, user);
        const currentTimeStamp = Date.now();
        const response = await fetch(
          `https://api.spotify.com/v1/me/player/recently-played?before=${currentTimeStamp}&limit=50`,
          {
            headers: {
              Authorization: `Bearer ${refreshedToken.token}`,
            },
          }
        );
        // TODO! Only one page for now
        console.log(response);

        const insertData = response.tracks.map((track) => ({
          trackTenantId: track.id,
          userId: user.id,
          trackInfo: track,
        }));

        Song.create(insertData);
      }
    } catch (err) {
      console.log("error", err);
    }

    console.log(`Processing job for user: ${job.data.userId}`);
    // Here goes the actual task logic for the user
  },
  { connection, concurrency: 5 }
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
