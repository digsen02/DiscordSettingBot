import dotenv from "dotenv";
import mongoose from "mongoose";

const dbConnect = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URL);
        console.log('✅ mongoose를 통해 DB 연결됨');
    }
    catch(error) {
        console.log(error);
    }
}

export default dbConnect;