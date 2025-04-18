import mongoose from 'mongoose';
// const URI = process.env.MONGO_URI

export const connectDb = async () =>{
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("connection successful to database");
    } catch (error) {
        console.log("database connection failed",error);
        process.exit(0);
    }
}