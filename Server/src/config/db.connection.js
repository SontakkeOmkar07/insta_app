import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const connectDB = async () => {
  console.log("Start connecting...");

  try {
    // console.log("MONGO URI:", process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MONGODB connected Successfully");
    
  } catch (error) {
    console.error("MONGODB is not connected", error.message);

    process.exit(1);
  }
};

export default connectDB;
