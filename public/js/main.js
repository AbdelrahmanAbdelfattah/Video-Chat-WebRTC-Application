const socket = io("/"); // Connect to the server

socket.on("connect", () => {
  console.log("successfully connected to socket.io server ");
  console.log(socket.id);
});
