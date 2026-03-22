const express=require("express");
const cookieParser=require("cookie-parser")
const authRoutes=require("./routes/auth.route")
const lostitemRoutes=require("./routes/lostitem.route")
const foundItemRoutes=require("./routes/foundItem.route")
const app=express();
const cors=require("cors")
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:5173",
        "https://trace-it-nu.vercel.app/"
      ];

      if (
        !origin || 
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);

app.use(express.json())
app.use(cookieParser())
app.use("/api/lost",lostitemRoutes)
app.use("/api/found",foundItemRoutes)
app.use("/api/auth",authRoutes)
module.exports=app;