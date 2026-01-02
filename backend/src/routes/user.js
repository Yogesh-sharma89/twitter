import { Router } from "express";
import { protectedRoute } from "../middleware/auth.js";
import { adddUserToDb, followUser, getCurrentUser, getUserProfile, unfollowUser, updateprofile } from "../controllers/user.controller.js";

const userRoutes = Router();

userRoutes.use(protectedRoute)

userRoutes.get('/profile/:username',getUserProfile);

userRoutes.put('/profile/:username',updateprofile);

userRoutes.post('/sync',adddUserToDb);

userRoutes.get('/me',getCurrentUser);

userRoutes.post('/follow/:userId',followUser);

userRoutes.post('/unfollow/:userId',unfollowUser);

export default userRoutes;