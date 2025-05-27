import Call from '../models/call.model.js';
import { getReceiverSocketId } from '../lib/socket.js';

// Démarrer un appel
export const startCall = async (req, res) => {
    try {
        const { callerId, receiverId, signal } = req.body;

        // Créer un nouvel appel dans la base de données
        const newCall = new Call({
            callerId,
            receiverId,
            status: 'initiated' // Vous pouvez ajouter ce statut à votre enum dans le modèle
        });
        await newCall.save();

        // Envoyer l'événement via Socket.io
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            req.io.to(receiverSocketId).emit("call:received", { 
                signal,
                from: callerId,
                callId: newCall._id,
                callerSocketId: req.socket.id
            });
        }

        res.status(200).json({ 
            success: true,
            message: "Call initiated",
            callId: newCall._id
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Error starting call",
            error: error.message 
        });
    }
};

// Accepter un appel
export const acceptCall = async (req, res) => {
    try {
        const { callId, signal } = req.body;
        
        // Mettre à jour l'appel dans la base de données
        const call = await Call.findByIdAndUpdate(
            callId,
            { status: 'accepted' },
            { new: true }
        );

        if (!call) {
            return res.status(404).json({ 
                success: false,
                message: "Call not found" 
            });
        }

        // Envoyer l'acceptation via Socket.io
        const callerSocketId = getReceiverSocketId(call.callerId);
        if (callerSocketId) {
            req.io.to(callerSocketId).emit("call:accepted", { 
                signal,
                callId: call._id
            });
        }

        res.status(200).json({ 
            success: true,
            message: "Call accepted",
            callId: call._id
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Error accepting call",
            error: error.message 
        });
    }
};

// Rejeter un appel
export const rejectCall = async (req, res) => {
    try {
        const { callId } = req.body;
        
        // Mettre à jour l'appel dans la base de données
        const call = await Call.findByIdAndUpdate(
            callId,
            { 
                status: 'rejected',
                endedAt: new Date()
            },
            { new: true }
        );

        if (!call) {
            return res.status(404).json({ 
                success: false,
                message: "Call not found" 
            });
        }

        // Envoyer le rejet via Socket.io
        const callerSocketId = getReceiverSocketId(call.callerId);
        if (callerSocketId) {
            req.io.to(callerSocketId).emit("call:rejected", { 
                callId: call._id
            });
        }

        res.status(200).json({ 
            success: true,
            message: "Call rejected",
            callId: call._id
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Error rejecting call",
            error: error.message 
        });
    }
};

// Terminer un appel
export const endCall = async (req, res) => {
    try {
        const { callId } = req.body;
        
        // Mettre à jour l'appel dans la base de données
        const call = await Call.findByIdAndUpdate(
            callId,
            { 
                status: 'completed',
                endedAt: new Date()
            },
            { new: true }
        );

        if (!call) {
            return res.status(404).json({ 
                success: false,
                message: "Call not found" 
            });
        }

        // Envoyer la fin d'appel via Socket.io
        const otherUserId = req.userId === call.callerId.toString() ? call.receiverId : call.callerId;
        const otherUserSocketId = getReceiverSocketId(otherUserId);
        if (otherUserSocketId) {
            req.io.to(otherUserSocketId).emit("call:ended", { 
                callId: call._id
            });
        }

        res.status(200).json({ 
            success: true,
            message: "Call ended",
            callId: call._id,
            duration: call.duration // Utilise la virtual property du modèle
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Error ending call",
            error: error.message 
        });
    }
};

// // Obtenir l'historique des appels
// export const getCallHistory = async (req, res) => {
//     try {
//         const userId = req.userId;
        
//         const calls = await Call.find({
//             $or: [
//                 { callerId: userId },
//                 { receiverId: userId }
//             ]
//         })
//         .sort({ startedAt: -1 })
//         .populate('callerId', 'username profilePicture')
//         .populate('receiverId', 'username profilePicture');

//         res.status(200).json({ 
//             success: true,
//             calls 
//         });
//     } catch (error) {
//         res.status(500).json({ 
//             success: false,
//             message: "Error fetching call history",
//             error: error.message 
//         });
//     }
// };