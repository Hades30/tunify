const { Schema, model } = require("mongoose");
const Song = require("../models/song");
const Match = require("../models/match");

const { analyzeCompatibility } = require("../utils/fetchCompatibilityOpenAi");

const GeoSchema = new Schema({
  type: {
    type: String,
    default: "Point",
  },
  coordinates: {
    type: [Number], //the type is an array of numbers
  },
});

const MySchema = new Schema({
  userIds: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  matchedAt: [GeoSchema],
});

MySchema.post("save", async function (doc) {
  let user1Songs = await Song.find({ userId: doc.userIds[0] })
    .sort({
      _id: -1,
    })
    .limit(10);
  user1Songs = user1Songs.map((song) => song.trackInfo);
  let user2Songs = await Song.find({ userId: doc.userIds[1] })
    .sort({
      _id: -1,
    })
    .limit(10);
  user2Songs = user2Songs.map((song) => song.trackInfo);
  console.log(user1Songs, user2Songs);
  const result = analyzeCompatibility(user1Songs, user2Songs);
  console.log(result);
  if (result.score > 80) {
    console.log("match");
    Match.create({
      userIds: doc.userIds,
      matchedAt: doc.matchedAt,
      matchData: result,
    });
  }

  // Add any custom logic here
  // e.g., send a welcome email, update another collection, etc.
});

MySchema.set("timestamps", true);

const PotentialMatchModel = model("PotentialMatch", MySchema);

module.exports = PotentialMatchModel;
