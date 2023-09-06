import * as store from "./store.js";

const socket = io("/"); // Connect to the server

socket.on("connect", () => {
  console.log("succesfully connected to socket.io server");
  store.setSocketId(socket.id);
});
