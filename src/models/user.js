const { Schema, model } = require("mongoose");

const MySchema = new Schema({
  name: {
    type: String,
    required: true,
    maxlength: 50,
  },
  refresh_token: {
    type: String,
    required: true,
  },
  email: { type: String },
  tenantId: { type: String },
});

const UserModel = model("User", MySchema);

module.exports = UserModel;
