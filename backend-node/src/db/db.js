const mongoose=require("mongoose")
async function connectDb() {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("Database connected")
    } catch (error) {
        console.error("Database not connected")
    }
}
module.exports=connectDb