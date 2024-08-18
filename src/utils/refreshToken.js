const Token = require("../models/tenantTokens");
const fetch = require("node-fetch");
const refreshToken = async (token, user) => {
  console.log(
    token.expires_in,
    Date.now(),
    new Date(token.expires_in).getTime(),
    new Date(token.expires_in).getTime() < Date.now()
  );
  if (new Date(token.expires_in).getTime() < Date.now()) {
    console.log("lol");
    let newAccessToken = await fetch("https://accounts.spotify.com/api/token", {
      headers: {
        Authorization: `Bearer ${user.refresh_token}`,
      },
    });
    console.log(newAccessToken);
    newAccessToken = await Token.updateOne(
      { userId: user.id },
      {
        token: newAccessToken.access_token,
        expires_in: Date.now() + 3600000,
      }
    );
    return newAccessToken;
  }
  return token;
};
module.exports = { refreshToken };
