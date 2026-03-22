const mongoose=require("mongoose")
const foundItemSchema=new mongoose.Schema({
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
const foundItemModel=mongoose.model("FoundItem",foundItemSchema)
module.exports=foundItemModel