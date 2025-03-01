import mongoose from "mongoose";
import { config } from "./config";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("Successfully Connected to DB");
    });

    mongoose.connection.on("error", (error) => {
      console.log("Error in connecting DB", error);
    });
    await mongoose.connect(config.databaseUrl as string);
  } catch (error) {
    console.error("Failed to Connect to DB", error);
    process.exit(1);
  }
};

export default connectDB;
