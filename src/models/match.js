const { Schema, model } = require("mongoose");

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
  matchData: { type: Object },
});

MySchema.set("timestamps", true);

const Match = model("Match", MySchema);

module.exports = Match;
