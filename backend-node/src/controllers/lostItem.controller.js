const lostItemModel=require("../models/lostItem.model")
const foundItemModel=require("../models/foundItem.model")
const axios=require("axios")
const {uploadToCloudinary} =require("../services/storage.service")
const {checkMatchesForNewLostItem} = require("../services/notification.service")
async function createItem(req,res) {
    const {title,description,location,category,image}=req.body
 
    try {
        let imageUrl = null
        if (req.file) {
            imageUrl = await uploadToCloudinary(req.file.buffer)
        }
        const item= await lostItemModel.create(
        {
            title,description,location,category,image:imageUrl,reportedBy:req.user.id
        })
        
        // Asynchronously check for matching found items and create notifications
        checkMatchesForNewLostItem(item).catch(err => console.error("Notification check error:", err.message))

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
    const items=await lostItemModel.find(filter)
    return res.status(200).json({message:"Items Fetched Successfully",items})
    } catch (error) {
        return res.status(400).json({message:"Failed to Fetch"})
    }
}
async function getItembyId(req,res) {  
    try {
    const id=req.params.id
    const item= await lostItemModel.findById(id)
    if(!item) {return res.status(404).json({message:"item not found"})}
    return res.status(200).json({item})
    } catch (error) {
        return res.status(400).json({message:"Error",error})
    }
}
async function deleteItem(req,res) {
    const id =req.params.id
    try {
         const item=await lostItemModel.findById(id)
    if(!item)
    {
        return res.status(404).json({message:"Not found"})
    }
    const isOwner= item.reportedBy.toString()===req.user.id
    if(!isOwner)
    {
     return res.status(403).json({message:"You cannot delete these message"})
    }
    await lostItemModel.findByIdAndDelete(id)
    return res.status(200).json({message:"Item successfully deleted  "})
    } catch (error) {
         return res.status(404).json({message:"Error in deleting",error})
    }
}
async function getMyItems(req,res) {
    try { 
        const items=await lostItemModel.find({reportedBy:req.user.id})
        return res.status(200).json({message:"Items fetched",items})
    } catch (error) {
        return res.status(400).json({message:"Failed to fetch items",error})
    }
}
async function updateStatus(req,res) {
    const id =req.params.id
    try {
         const item=await lostItemModel.findById(id)
    if(!item)
    {
        return res.status(404).json({message:"Not found"})
    }
    const isOwner= item.reportedBy.toString()===req.user.id
    if(!isOwner)
    {
     return res.status(403).json({message:"You cannot update the status"})
    }
    await lostItemModel.findByIdAndUpdate(id,{status:"Closed"})
    return res.status(200).json({message:"Item status closed  "})
    } catch (error) {
         return res.status(404).json({message:"Error in changing status",error})
    }
}
async function matchItem(req,res) {
    const id=req.params.id
    try {
        const lostItem=await lostItemModel.findById(id)
        if(!lostItem) {
            return res.status(404).json({message:"Lost item not found"})
        }
        const foundItems=await foundItemModel.find()
        if(!foundItems || foundItems.length === 0) {
            return res.status(200).json({ matches: [] })
        }
        const description=lostItem.description
       const response = await  axios.post(process.env.PYTHON_API_URL, {
    lost: description,
    found: foundItems.map(item => ({ id: item._id, description: item.description }))
})
        const enrichedMatches = response.data.matches.map(match => {
            const originalItem = foundItems[match.index]
            return {
                ...match,
                _id: originalItem._id,
                title: originalItem.title,
                location: originalItem.location,
                category: originalItem.category,
                image: originalItem.image
            }
        })
        return res.status(200).json({ matches: enrichedMatches })
    } catch (error) {
        return res.status(404).json({message:"Error in matching",error:error.message})
    }
}
module.exports={createItem,getItem,getItembyId,deleteItem,updateStatus,matchItem,getMyItems}