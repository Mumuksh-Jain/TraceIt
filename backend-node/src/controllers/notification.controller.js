const notificationModel = require("../models/notification.model");

async function getNotifications(req, res) {
  try {
    const notifications = await notificationModel
      .find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate("lostItem", "title category location image")
      .populate("foundItem", "title category location image");

    const unreadCount = await notificationModel.countDocuments({
      recipient: req.user.id,
      read: false
    });

    return res.status(200).json({
      notifications,
      unreadCount
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch notifications", error: error.message });
  }
}

async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    const notification = await notificationModel.findOneAndUpdate(
      { _id: id, recipient: req.user.id },
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    return res.status(200).json({ message: "Marked as read", notification });
  } catch (error) {
    return res.status(500).json({ message: "Error updating notification", error: error.message });
  }
}

async function markAllAsRead(req, res) {
  try {
    await notificationModel.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    );
    return res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    return res.status(500).json({ message: "Error updating notifications", error: error.message });
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
