const express=require("express");
const cookieParser=require("cookie-parser")
const authRoutes=require("./routes/auth.route")
const lostitemRoutes=require("./routes/lostitem.route")
const foundItemRoutes=require("./routes/foundItem.route")
const app=express();
const cors=require("cors")
app.use(cors({
    origin:['http://localhost:5173','http://localhost:3001'],
    credentials:true
}))

app.use(express.json())
app.use(cookieParser())
app.use("/api/lost",lostitemRoutes)
app.use("/api/found",foundItemRoutes)
app.use("/api/auth",authRoutes)
module.exports=app;