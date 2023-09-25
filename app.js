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
let connectedPeerStrangers = [];

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

  socket.on("stranger-connection-status", (data) => {
    const { status } = data;
    //add possibility to connect with strangers
    if (status) {
      connectedPeerStrangers.push(socket.id);
    } else {
      //cancel possibility to connect with stranger
      const newConnectedPeerStrangers = connectedPeerStrangers.filter(
        (peerSocketId) => peerSocketId !== socket.id
      );
      connectedPeerStrangers = newConnectedPeerStrangers;
    }

    console.log(connectedPeerStrangers);
  });

  socket.on("get-stranger-socket-id", () => {
    let randomStrangerSocketId;

    // remove our socket id from the stranger array to avoid connect with it
    const filteredConnectedPeerStrangers = connectedPeerStrangers.filter(
      (peerSocketId) => peerSocketId !== socket.id
    );

    if (filteredConnectedPeerStrangers.length > 0) {
      randomStrangerSocketId =
        filteredConnectedPeerStrangers[
          Math.floor(Math.random() * filteredConnectedPeerStrangers.length)
        ];
    } else {
      randomStrangerSocketId = null;
    }

    const data = {
      randomStrangerSocketId,
    };

    io.to(socket.id).emit("stranger-socket-id", data);
  });

  socket.on("disconnect", () => {
    console.log("user disconnect from SOCKET.IO");
    const newConnectedPeers = connectedPeers.filter(
      (peerSocketId) => peerSocketId !== socket.id
    );
    connectedPeers = newConnectedPeers;

    const newConnectedPeersStrangers = connectedPeerStrangers.filter(
      (peerSocketId) => peerSocketId !== socket.id
    );
    connectedPeerStrangers = newConnectedPeersStrangers;
  });
});
server.listen(port, () => {
  console.log(`listening on Port ${port}`);
});
