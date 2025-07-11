import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/market";

mongoose.set("strictQuery", true);

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("✅ Conectado a MongoDB");
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error);
    process.exit(1);
  }
};

export default connectDB;
