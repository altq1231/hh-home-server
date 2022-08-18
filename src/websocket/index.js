const {
  Server
} = require("socket.io");
const ip = require("ip");
const port = process.env.PORT || 3301;

const baseUrl = `http://${ip.address()}:${port}`;
module.exports = (httpServer) => {
  const wss = new Server(httpServer, {
    path: "/wss",
  });


  wss.on("connection", (socket) => {
    console.log("a user connected");

    socket.emit("open", "sssssss");

    socket.on("sendMsg", (data) => {
      console.log(JSON.stringify(data));
    });

    socket.on("disconnect", () => {
      console.log("a user disconnected");
    });
  });
}