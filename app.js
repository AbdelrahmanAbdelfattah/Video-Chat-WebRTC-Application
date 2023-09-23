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
    } else {
      const data = { preOfferAnswer: "CALLEE_NOT_FOUND" };

      io.to(socket.id).emit("pre-offer-answer", data);
    }
  });

  socket.on("pre-offer-answer", (data) => {
    console.log("pre-offer-answer came ");
    console.log(data);

    const { callerSocketId } = data;

    const connectedPeer = connectedPeers.find(
      (peerSocketId) => callerSocketId === peerSocketId
    );

    if (connectedPeer) {
      io.to(data.callerSocketId).emit("pre-offer-answer", data);
    }
  });

  socket.on("webRTC-signaling", (data) => {
    const { connectedUserSocketId } = data;

    const connectedPeer = connectedPeers.find(
      (peerSocketId) => connectedUserSocketId === peerSocketId
    );

    if (connectedPeer) {
      io.to(connectedPeer).emit("webRTC-signaling", data);
    }
  });

  socket.on("user-hanged-up", (data) => {
    const { connectedUserSocketId } = data;

    const connectedPeer = connectedPeers.find(
      (peerSocketId) => connectedUserSocketId === peerSocketId
    );

    if (connectedPeer) {
      io.to(connectedUserSocketId).emit("user-hanged-up", data);
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
