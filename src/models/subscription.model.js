import mongoose, { Schema } from "mongoose";

const subscriptionScheme = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId, //subscriber
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId, //channel ownwer
      ref: "User",
    },
  },
  { timestamps: true }
);

const Subscription = mongoose.model("Subscription", subscriptionScheme);
