const express = require("express");
const http = require("http");

const port = process.env.port || 3000;

const app = express();

//it enables the server to serve static files (e.g., HTML, CSS, JavaScript, images) to clients
app.use(express.static("public"));

const server = http.createServer(app);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

server.listen(port, () => {
  console.log(`listening on Port ${port}`);
});
