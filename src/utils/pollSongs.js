const User = require("../models/user");
const Token = require("../models/tenantTokens");
const Song = require("../models/song");
const { refreshToken } = require("./refreshToken");
const fetch = require("node-fetch");

const pollSongs = async ({ userId, isJob = true, accessToken }) => {
  const user = await User.findById(userId);
  if (user) {
    const token = await Token.findOne({ userId: userId });
    let refreshedToken = "";
    if (!accessToken) {
      refreshedToken = await refreshToken(token, user);
    }
    const currentTimeStamp = Date.now();
    let url = `https://api.spotify.com/v1/me/player/recently-played?limit=50&before=${currentTimeStamp}`;
    if (isJob) {
      const afterTimestamp = currentTimeStamp - 15 * 60 * 1000;
      url += `&after=${afterTimestamp}`;
    }
    const data = await fetch(url, {
      headers: {
        Authorization: `Bearer ${
          accessToken ? accessToken : refreshedToken.token
        }`,
      },
    }).then((response) => response.json());

    const insertData = data.items.map(({ track, played_at }) => ({
      tenantTrackId: track.id,
      userId: user.id,
      trackInfo: track,
      playedAt: new Date(played_at),
    }));
    console.log(insertData[0].tenantTrackId);

    Song.create(insertData);
  }
};

module.exports = { pollSongs };
