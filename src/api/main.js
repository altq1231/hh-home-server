const router = require("express").Router();
const connectSelfMongodb = require("../mongodb/index.js");
const { NormalUserSchema } = require("../mongodb/schema.js");

const UserApi = require("./user.js");

module.exports = (httpServer) => {
  let mongodbConnection;
  let NormalUserTable;

  connectSelfMongodb()
    .then((resp) => {
      mongodbConnection = resp;
      NormalUserTable = mongodbConnection.model("NormalUserTable", NormalUserSchema);
      /* createWSS  */
      // createWSS(httpServer);

      UserApi(router, mongodbConnection, NormalUserTable);
    })
    .catch((err) => {
      console.log("连接自身用 Mongodb 错误:==\n", err);
      mongodbConnection = undefined;
    });
  return router;
};
