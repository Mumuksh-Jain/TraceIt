const dotenv=require("dotenv");
dotenv.config();
const connectDb=require("./src/db/db");
const app=require("./src/app");
const PORT=process.env.PORT || 8000;
connectDb();
app.listen(PORT,()=>{
        console.log(`Server is running on port ${PORT}`);
});