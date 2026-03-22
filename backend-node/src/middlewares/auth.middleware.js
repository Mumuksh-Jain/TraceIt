const jwt =require("jsonwebtoken")
async function protectRoute(req,res,next) {
    const token=req.cookies.token
    if(!token)
    {
       return  res.status(400).json({
            message:"Unauthorized"
        })
    }
    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY)
        req.user=decoded
         next()
    } catch (err) {
         return  res.status(400).json({
            message:"Unauthorized"
        })
    }
}
module.exports=protectRoute