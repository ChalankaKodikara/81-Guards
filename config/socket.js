// config/socket.js
const socketIo = require("socket.io");
let io = null;

exports.init = (httpServer) => {
  io = socketIo(httpServer, {
    cors: {
      origin: "*", // Allow all origins, modify as needed
      methods: ["GET", "POST"],
    },
  });
  return io;
};

exports.getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized!");
  }
  return io;
};
