const express = require("express");
const router = express.Router();
const User = require("../models/user");
const fetch = require("node-fetch");
const Token = require("../models/tenantTokens");
const { refreshToken } = require("../utils/refreshToken");
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
    res.json(result);
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
