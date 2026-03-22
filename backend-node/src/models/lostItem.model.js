const mongoose=require("mongoose")
const lostItemSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    }, 
    location:{
        type:String,
        required:true
    }, 
    category:{
        type:String,
        required:true
    }, 
    image:{
        type:String,
    }, 
    reportedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    status:
    {
        type:String,
        enum:["Open","Closed"],
        default:"Open"
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})
const lostItemModel=mongoose.model("LostItem",lostItemSchema)
module.exports=lostItemModel