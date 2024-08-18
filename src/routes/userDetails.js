const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Token = require("../models/tenantTokens");
const fetch = require("node-fetch");
router.get("/userDetails", async (req, res) => {
  const { userId } = req.query;
  const user = await User.findById(userId);
  res.json(user);
});

router.get("/fetchLatestToken", async (req, res) => {
  const { userId } = req.query;
  const user = await User.findById(userId);
  if (user) {
    const token = await Token.findOne({ userId: userId });
    if (token.expires_in < Date.now()) {
      let newAccessToken = await fetch(
        "https://accounts.spotify.com/api/token",
        {
          headers: {
            Authorization: `Bearer ${user.refresh_token}`,
          },
        }
      );
      newAccessToken = await Token.updateOne(
        { userId: user.id },
        {
          token: newAccessToken.access_token,
          expires_in: Date.now() + 3600000,
        }
      );
    }
  } else {
    res.json({ error: "User not found" });
  }
});

module.exports = router;
