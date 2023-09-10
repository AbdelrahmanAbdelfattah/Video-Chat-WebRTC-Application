const express = require("express");
const http = require("http");

const port = process.env.port || 3000;

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);

//it enables the server to serve static files (e.g., HTML, CSS, JavaScript, images) to clients
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

let connectedPeers = [];

io.on("connection", (socket) => {
  connectedPeers.push(socket.id);
  console.log(socket.id);

  socket.on("pre-offer", (data) => {
    const { calleePersonalCode, callType } = data;

    const connectedPeer = connectedPeers.find(
      (peerSocketId) => calleePersonalCode === peerSocketId
    );

    if (connectedPeer) {
      const data = {
        callerSocketId: socket.id,
        callType,
      };
      io.to(calleePersonalCode).emit("pre-offer", data);
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    const newConnectedPeers = connectedPeers.filter(
      (peerSocketId) => socket.id !== peerSocketId
    );

    connectedPeers = newConnectedPeers;
    console.log(connectedPeers);
  });
});
server.listen(port, () => {
  console.log(`listening on Port ${port}`);
});
