const router = require("express").Router();
const connectSelfMongodb = require("../mongodb/index.js");
const { NormalUserSchema, CaptchaSchema } = require("../mongodb/schema.js");

const UserApi = require("./user.js");

module.exports = (httpServer) => {
  let mongodbConnection;
  let NormalUserTable;
  let CaptchaTable;

  connectSelfMongodb()
    .then((resp) => {
      mongodbConnection = resp;
      NormalUserTable = mongodbConnection.model(
        "NormalUserTable",
        NormalUserSchema
      );
      // CaptchaTable = mongodbConnection.model("CaptchaTable", CaptchaSchema);
      CaptchaTable = mongodbConnection.model("CaptchaTable", CaptchaSchema);
      /* createWSS  */
      // createWSS(httpServer);

      UserApi(router, mongodbConnection, NormalUserTable, CaptchaTable);
      // UserApi(router, mongodbConnection, CaptchaTable);
    })
    .catch((err) => {
      console.log("连接自身用 Mongodb 错误:==\n", err);
      mongodbConnection = undefined;
    });
  return router;
};
