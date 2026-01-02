import {Router} from 'express';
import { protectedRoute } from '../middleware/auth.js';
import { requireActiveUser } from '../middleware/requireActiveUser.js';
import { loadNotification } from '../middleware/loadNotification.js';
import { deleteNotification, getAllNotifications, getUnreadNotificationCount, markReadNotification } from '../controllers/notification.controller.js';

const notificationRoutes = Router();

notificationRoutes.use(protectedRoute,requireActiveUser);

notificationRoutes.get('/',getAllNotifications);

notificationRoutes.patch('/:notificationId/mark-read',loadNotification,markReadNotification);

notificationRoutes.delete('/:notificationId',loadNotification,deleteNotification);

notificationRoutes.get('/unread-count',getUnreadNotificationCount);

export default notificationRoutes;

