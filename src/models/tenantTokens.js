const { Schema, model } = require("mongoose");

const MySchema = new Schema({
  token: {
    type: String,
    required: true,
  },
  expires_in: {
    type: Date,
  },
  state: { type: String },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

MySchema.set("timestamps", true);

const TokenModel = model("Token", MySchema);

module.exports = TokenModel;
