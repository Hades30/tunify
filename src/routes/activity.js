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

module.exports = router;
