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

io.on("connection", (socket) => {
  console.log("user connected to socket.io server");
  console.log(socket.id);
});
server.listen(port, () => {
  console.log(`listening on Port ${port}`);
});
