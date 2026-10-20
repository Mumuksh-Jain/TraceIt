const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ["match_alert", "status_update", "general"],
    default: "match_alert"
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    default: 0
  },
  lostItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LostItem"
  },
  foundItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FoundItem"
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

const notificationModel = mongoose.model("Notification", notificationSchema);
module.exports = notificationModel;
