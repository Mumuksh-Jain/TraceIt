const express = require("express");
const router = express.Router();
const protectRoute = require("../middlewares/auth.middleware");
const {
  getNotifications,
  markAsRead,
  markAllAsRead
} = require("../controllers/notification.controller");

router.get("/", protectRoute, getNotifications);
router.put("/read-all", protectRoute, markAllAsRead);
router.put("/:id/read", protectRoute, markAsRead);

module.exports = router;
