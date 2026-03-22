const express=require("express")
const router=express.Router()
const authControllers=require("../controllers/auth.controller")
const protectRoute=require("../middlewares/auth.middleware")

router.post("/register",authControllers.Register)
router.post("/login",authControllers.login)
router.post("/logout",protectRoute,authControllers.logOut)
router.get("/me",protectRoute,authControllers.checkAuth)

module.exports=router