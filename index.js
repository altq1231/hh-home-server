/**
 * Node.js + express + mongodb 搭建的后台服务器
 * 端口                  3300
 * 静态服务器地址         ./static
 * mongodb 地址          mongodb://localhost:27017/
 * @author altq 2022/08/02
 */
let dotenv = require("dotenv");
dotenv.config("./env");

const fs = require("fs");
const ip = require("ip");
const path = require("path");
const cors = require("cors");
const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const apiHandler = require("./src/api/main.js");

const app = express();
// set cookie parser
app.use(cookieParser());
// enable cors for client development mode
app.use(cors());
// compress all responses
app.use(compression());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ limit: "2048mb", extended: false }));

// parse application/json
app.use(bodyParser.json({ limit: "2048mb" }));
/**
 * create http server for websocket using
 * otherwise we just use app server
 */
const httpServer = http.createServer(app);
// static resources
app.use("/static", express.static(path.join(__dirname, "./static")));
app.use(
  "/comsLib",
  express.static(path.join(__dirname, "../chart-library/src/components"))
);

// handle api
app.use("/", apiHandler(httpServer));

// user input PORT has the highest priority
// const port = process.env.PORT || serverPort;
const port = process.env.PORT || 3301;

httpServer.listen(port, () => {
  console.log(`\nopen http://${ip.address()}:${port}\n`);
});

// eslint-disable-next-line
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
