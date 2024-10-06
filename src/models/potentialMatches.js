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

MySchema.post("save", function (doc) {
  const user1Songs = Song.find({ userId: doc.userIds[0] })
    .limit(10)
    .map((song) => song.trackInfo);
  const user2Songs = Song.find({ userId: doc.userIds[1] })
    .limit(10)
    .map((song) => song.trackInfo);
  const result = analyzeCompatibility(user1Songs, user2Songs);
  console.log(result);
  Match.create({
    userIds: doc.userIds,
    matchedAt: doc.matchedAt,
    matchData: result,
  });

  // Add any custom logic here
  // e.g., send a welcome email, update another collection, etc.
});

MySchema.set("timestamps", true);

const PotentialMatchModel = model("PotentialMatch", MySchema);

module.exports = PotentialMatchModel;
