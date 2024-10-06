const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Song = require("../models/song");
const fetch = require("node-fetch");
const Token = require("../models/tenantTokens");
const Potential = require("../models/potentialMatches");
const { refreshToken } = require("../utils/refreshToken");

async function findAndCreateMatchingPotentials(nearbyUsers, currentUser) {
  const now = new Date();
  const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000); // Subtract 15 minutes

  // Build the $or query for multiple arrays
  const orConditions = nearbyUsers.map((nearbyUser) => ({
    userIds: { $all: [currentUser.id, nearbyUser.id] },
  }));

  // Run a single query with $or to check all arrays at once
  const potentials = await Potential.find({
    $or: orConditions, // Match any of the arrays
    createdAt: { $gte: fifteenMinutesAgo }, // Only return documents created in the last 15 minutes
  });
  const alreadyMatchedUsers = potentials.map((potential) =>
    potential.userIds[0] == currentUser.id
      ? potential.userIds[1]
      : potential.userIds[0]
  );
  nearbyUsers.forEach((nearbyUser) => {
    if (!alreadyMatchedUsers.includes(nearbyUser.id)) {
      Potential.create({
        userIds: [nearbyUser.id, currentUser.id],
        matchedAt: [nearbyUser.location, currentUser.location],
      });
    }
  });

  console.log("Matching documents:", potentials);
}

router.get("/currentPlayingTrack", async (req, res) => {
  const { userId } = req.query;
  const user = await User.findById(userId);
  if (user) {
    const token = await Token.findOne({ userId: userId });
    const refreshedToken = await refreshToken(token, user);
    if (refreshedToken) {
      const response = await fetch(
        "https://api.spotify.com/v1/me/player/currently-playing",
        {
          headers: {
            Authorization: `Bearer ${refreshedToken.token}`,
          },
        }
      );
      const data = await response.json();
      console.log(data);
    }
  }
  res.json(user);
});

router.post("/updateCurrentLocation", async (req, res) => {
  console.log(req);
  const { userId, coordinates } = req.body;
  console.log(userId);
  let user = await User.findById(userId);

  if (user) {
    console.log(user);

    const result = await User.updateOne(
      { _id: user.id },
      {
        $set: { location: { coordinates: coordinates } },
      }
    );
    const nearByUsers = await User.find({
      location: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            // coordinates: [6.5279623, 3.3910865999999997],
            coordinates: currentUser.location.coordinates,
          },
          $maxDistance: 100000,
        },
      },
      _id: {
        $ne: userId,
      },
    });
    findAndCreateMatchingPotentials(nearByUsers, user);
    res.json({ result });
  }
  res.json();
});

router.get("/updateRecentTracks", async (req, res) => {
  console.log(req);
  const { userId } = req.query;
  console.log(userId);
  let user = await User.findById(userId);

  if (user) {
    console.log(user);

    console.log(user);
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

    const insertData = response.tracks.map((track) => ({
      trackTenantId: track.id,
      userId: user.id,
      trackInfo: track,
    }));

    Song.create(insertData);

    res.json({ response });
  }

  res.json();
});

router.get("/nearByUsers", async (req, res) => {
  try {
    const { userId } = req.query;
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      res.json({ error: "lol" });
    }
    let nearByUsers = await User.find({
      location: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            // coordinates: [6.5279623, 3.3910865999999997],
            coordinates: currentUser.location.coordinates,
          },
          $maxDistance: 100000,
        },
      },
      _id: {
        $ne: userId,
      },
    });

    res.status(201).json({
      message: "No users near you",
      nearByUser: nearByUsers,
    });
  } catch (err) {
    res.status(400).json({
      message: `Issues finding nearby users. ${err.message}`,
    });
  }
});

module.exports = router;
