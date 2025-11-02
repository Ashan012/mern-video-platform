import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const conncectionDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `MongoDB connected on DB HOST!! ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log(`Error`, error);
    throw error;
  }
};
export default conncectionDB;
