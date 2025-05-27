import {Server } from 'socket.io';
import http from 'http';
import express from 'express';

const app = express();

const server= http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000"],
    },
});

export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
  }

const userSocketMap = {}; 
const callRooms = {}; // pour gérer les salles d'appel


io.on("connection", (socket) => {
    console.log("A user connected",socket.id);
    const userId = socket.handshake.query.userId;
    if (userId) userSocketMap[userId] = socket.id;

    // io.emit() is used to send events to all the connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    
    // Nouveaux événements pour les appels
    socket.on("call:start", ({ to, signal, from }) => {
        const receiverSocketId = getReceiverSocketId(to);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("call:received", { 
                signal,
                from,
                callerSocketId: socket.id
            });
        }
    });

    socket.on("call:accept", ({ signal, to }) => {
        const callerSocketId = getReceiverSocketId(to);
        if (callerSocketId) {
            io.to(callerSocketId).emit("call:accepted", signal);
        }
    });

    socket.on("call:reject", ({ to }) => {
        const callerSocketId = getReceiverSocketId(to);
        if (callerSocketId) {
            io.to(callerSocketId).emit("call:rejected");
        }
    });

    socket.on("call:end", ({ to }) => {
        const otherUserSocketId = getReceiverSocketId(to);
        if (otherUserSocketId) {
            io.to(otherUserSocketId).emit("call:ended");
        }
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    })
})

export { io, app, server };