const router = require("express").Router();
const connectSelfMongodb = require("../mongodb/index.js");
const {
  NormalUserSchema,
  CaptchaSchema,
  CityCodeSchema,
} = require("../mongodb/schema.js");

const UserApi = require("./user.js");
const CityCodeApi = require("./cityCode.js");

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
      CityCodeTable = mongodbConnection.model("CityCodeTable", CityCodeSchema);
      /* createWSS  */
      // createWSS(httpServer);

      UserApi(router, mongodbConnection, NormalUserTable, CaptchaTable);
      CityCodeApi(router, mongodbConnection, CityCodeTable);
    })
    .catch((err) => {
      console.log("连接自身用 Mongodb 错误:==\n", err);
      mongodbConnection = undefined;
    });
  return router;
};
