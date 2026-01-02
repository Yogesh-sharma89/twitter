import Notification from "../models/notification.model.js";

export const loadNotification = async (req, res, next) => {
  try{

  
  const { notificationId } = req.params;

  const notification = await Notification.findById(notificationId);

  if (!notification) {
    return res.status(404).json({ message: "Notification not found" });
  }

  // ownership check
  if (!notification.to.equals(req.user._id)) {
    return res.status(403).json({ message: "Access denied" });
  }

  req.notification = notification;
  next();
  }catch(err){
    console.log('Error in loadNotification middleware : '+err);
    return res.status(500).json({message:'Internal server error.'})
  }
};