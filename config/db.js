
// config file help in connect with mongodb database


import mongoose from "mongoose";

let cached = global.mongoose || {conn: null, promise:null}

export default async function connectDB() {
    if(cached.conn) return cached.conn;
    if(!cached.promise){
        cached.promise = mongoose.connect(process.env.MONGODB_URI).then((mongoose)=>mongoose);
    }
    try{
        cached.conn = await cached.promise;
    }
    catch(error){
        console.log("Error connecting to MongoDB:", error);
    }
    return cached.conn
}


// export default async function connectDB() {
//     if (cached.conn) return cached.conn;
//     if (!cached.promise) {
//         if (!process.env.MONGODB_URI) {
//             console.error("MONGODB_URI is not defined in environment variables");
//             throw new Error("MONGODB_URI is not defined");
//         }
//         cached.promise = mongoose.connect(process.env.MONGODB_URI, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//         }).then((mongoose) => mongoose);
//     }
//     try {
//         cached.conn = await cached.promise;
//         console.log("Connected to MongoDB");
//     } catch (error) {
//         console.error("Error connecting to MongoDB:", error.message);
//         throw error; // Rethrow to ensure the caller knows about the failure
//     }
//     return cached.conn;
// }