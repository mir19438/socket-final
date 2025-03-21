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
