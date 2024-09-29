const { Schema, model } = require("mongoose");

const MySchema = new Schema({
  tenant: {
    type: String,
    default: "spotify",
  },
  tenantTrackId: {
    type: String,
    required: true,
  },
  trackInfo: { type: Object },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  playedAt: { type: Date, default: Date.now },
});

MySchema.set("timestamps", true);

const SongModel = model("Song", MySchema);

module.exports = SongModel;
