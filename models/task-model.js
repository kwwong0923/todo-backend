const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide title"],
      maxlength: 50,
    },
    content: {
      type: String,
      maxlength: 100,
    },
    category: {
      type: String,
      enum: ["working", "learning", "friends", "event", "personal"],
      default: "personal",
    },
    image: {
      type: String,
    },
    status: {
      type: [String],
      enum: ["ongoing", "completed"],
      default: "ongoing",
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide the user id"],
    },
    collaborator: {
      email: {
        type: String,
      },
      status: {
        type: String,
        enum: ["pending", "rejected", "accepted"],
      },
      users: {
        type: [mongoose.Types.ObjectId],
        ref: "User",
        default: [],
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Task", TaskSchema);
