import express from 'express';
import { 
    startCall, 
    acceptCall, 
    rejectCall, 
    endCall, 
    // getCallHistory 
} from '../controllers/call.controller.js';
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/start", protectRoute, startCall);
router.post("/accept", protectRoute, acceptCall);
router.post("/reject", protectRoute, rejectCall);
router.post("/end", protectRoute, endCall);
// router.get("/history", protectRoute, getCallHistory);

export default router;