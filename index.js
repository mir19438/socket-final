const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.static("public"));

let users = {};
const groups = {};

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  const userId = socket.handshake.query.userId;
  
    users[userId] = socket.id;
    console.log("socket is", socket.id, "user id", userId);
    console.log(users);
 

  // socket.on('chat',function(msg){
  //     io.sockets.emit('chat',msg);
  // });

  

  socket.on('privateMessage', ({ senderId,receiverId, message }) => {
      console.log(`Sending private message from ${senderId} to ${receiverId} : ${message}`);

      if(users[receiverId]){
        io.to(users[receiverId]).emit('privateMessage',{
            receiver_id : receiverId,
            sender_id : senderId,
            message
        });
      }else{
        console.log(`user ${receiverId} not found or offline`);
      }


  });

  
  // Join a group
  socket.on("join_group", ({ userId, groupId }) => {
    socket.join(groupId);
    if (!groups[groupId]) {
        groups[groupId] = [];
    }
    groups[groupId].push(userId);
    console.log(`User ${userId} joined group ${groupId}`);
    console.log(groups);

    io.to(groupId).emit("join_group", `${userId} has joined the group.`);
});


// Leave a group
socket.on("leave_group", ({ userId, groupId }) => {
  socket.leave(groupId); // Remove user from the group room
  if (groups[groupId]) {
      groups[groupId] = groups[groupId].filter((id) => id !== userId); // Remove user from group list
  }
  console.log(`User ${userId} left group ${groupId}`);
  console.log(groups);

  io.to(groupId).emit("leave_group", `${userId} has left the group.`);
});

// group messages
socket.on("group_message", ({ groupId, senderId, message }) => {
  console.log(`Group message in ${groupId} from ${senderId}: ${message}`);

  io.to(groupId).emit("group_message", { senderId, message });
});







  socket.on("disconnect", () => {
    for (let userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
        break;
      }
    }
    console.log("User Disconnected:", socket.id);
    console.log("Users List:", users);
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
