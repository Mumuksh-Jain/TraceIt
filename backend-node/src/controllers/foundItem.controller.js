const foundItemModel=require("../models/foundItem.model")
const {uploadToCloudinary} =require("../services/storage.service")
async function createItem(req,res) {
    const {title,description,location,category,image}=req.body
 
    try {
        const imageUrl = await uploadToCloudinary(req.file.buffer)
        const item= await foundItemModel.create(
        {
            title,description,location,category,image:imageUrl,reportedBy:req.user.id
        })
    return res.status(200).json({message:"Item created successfully!",item})     
    } catch (error) {
        return res.status(401).json({message:"Item cannot be created ",error})
    }
}
async function getItem(req,res) {
    const { q, category } = req.query
    let filter = {}
    
    if (q) {
        filter.$or = [
            { title: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } }
        ]
    }
    
    if (category) {
        filter.category = category
    }

    try {
    const items=await foundItemModel.find(filter)
    return res.status(200).json({message:"Items Fetched Successfully",items})
    } catch (error) {
        return res.status(400).json({message:"Failed to Fetch"})
    }
}
async function deleteItem(req,res) {
    const id =req.params.id
    try {
         const item=await foundItemModel.findById(id)
    if(!item)
    {
        return res.status(404).json({message:"Not found"})
    }
    const isOwner= item.reportedBy.toString()===req.user.id
    if(!isOwner)
    {
     return res.status(403).json({message:"You cannot delete these message"})
    }
    await foundItemModel.findByIdAndDelete(id)
    return res.status(200).json({message:"Item successfully deleted  "})
    } catch (error) {
         return res.status(404).json({message:"Error in deleting",error})
    }
}
async function getMyItems(req,res) {
    try { 
        const items=await foundItemModel.find({reportedBy:req.user.id})
        return res.status(200).json({message:"Items fetched",items})
    } catch (error) {
        return res.status(400).json({message:"Failed to fetch items",error})
    }
}
async function updateStatus(req,res) {
    const id =req.params.id
    try {
         const item=await foundItemModel.findById(id)
    if(!item)
    {
        return res.status(404).json({message:"Not found"})
    }
    const isOwner= item.reportedBy.toString()===req.user.id
    if(!isOwner)
    {
     return res.status(403).json({message:"You cannot update the status"})
    }
    await foundItemModel.findByIdAndUpdate(id,{status:"Closed"})
    return res.status(200).json({message:"Item status closed  "})
    } catch (error) {
         return res.status(404).json({message:"Error in changing status",error})
    }
}
async function getItembyId(req,res) {  
    try {
    const id=req.params.id
    const item= await foundItemModel.findById(id)
    if(!item) {return res.status(404).json({message:"item not found"})}
    return res.status(200).json({item})
    } catch (error) {
        return res.status(400).json({message:"Error",error})
    }
}
module.exports={createItem,getItem,deleteItem,updateStatus,getMyItems,getItembyId}