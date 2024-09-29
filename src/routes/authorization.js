const express = require("express");
const router = express.Router();
const querystring = require("querystring");
const fetch = require("node-fetch");
const User = require("../models/user");
const Token = require("../models/tenantTokens");
const { createUserJob } = require("../jobs");

var generateRandomString = function (length) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

router.get("/register", async (req, res) => {
  const { state, code } = req.query;
  if (state === null) {
    res.redirect(
      "/#" +
        querystring.stringify({
          error: "state_mismatch",
        })
    );
  } else {
    const authOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(
            process.env.PROJECT_CLIENT_ID +
              ":" +
              process.env.PROJECT_CLIENT_SECRET
          ).toString("base64"),
      },
      body: new URLSearchParams({
        code: code,
        redirect_uri: "http://localhost:8000/api/auth/register",
        grant_type: "authorization_code",
      }),
    };
    try {
      const data = await fetch(
        "https://accounts.spotify.com/api/token",
        authOptions
      ).then((response) => response.json());

      const { access_token, refresh_token } = data;
      const userData = await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }).then((response) => response.json());

      User.create({
        name: userData.display_name,
        refresh_token,
        email: userData.email,
        tenantId: userData.id,
        state,
      }).then((user) => {
        // run a song parallel
        createUserJob(user.id);
        Token.create({
          token: access_token,
          userId: user.id,
          expires_in: Date.now() + 3600000,
        });
      });
    } catch (error) {
      console.log(error);
    }
  }
  res.redirect("https://www.google.com/");
});

router.get("/login", function (req, res) {
  var state = generateRandomString(16);
  // var scope = "user-read-private user-read-email";
  res.cookie("spotify_auth_state", state);
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: process.env.PROJECT_CLIENT_ID,
        scope:
          "user-read-email user-read-playback-state user-read-private user-read-recently-played",
        redirect_uri: "http://localhost:8000/api/auth/register",
        show_dialog: true,
        // prompt: true,
        state: state,
      })
  );
});

module.exports = router;
