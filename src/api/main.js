const router = require("express").Router();
const connectSelfMongodb = require("../mongodb/index.js");
const {
  NormalUserSchema,
  CaptchaSchema,
  CityCodeSchema,
  OperationRecordSchema,
  GoodsSchema
} = require("../mongodb/schema.js");

const UserApi = require("./user.js");
const CityCodeApi = require("./city-code.js");
const OperationRecordApi = require("./operation-record.js");
const createWssApi = require('../websocket/index.js')
const GoodsApi = require('./goods-api.js')

module.exports = (httpServer) => {
  let mongodbConnection;
  let NormalUserTable;
  let CaptchaTable;
  let OperationRecordTable;
  let GoodsTable;

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
      OperationRecordTable = mongodbConnection.model(
        "OperationRecordTable",
        OperationRecordSchema
      );
      GoodsTable = mongodbConnection.model(
        "GoodsTable",
        GoodsSchema
      );
      /* createWebsocketServer  */
      createWssApi(httpServer);

      UserApi(router, mongodbConnection, NormalUserTable, CaptchaTable);
      CityCodeApi(router, mongodbConnection, CityCodeTable);
      OperationRecordApi(router, mongodbConnection, OperationRecordTable);
      GoodsApi(router, mongodbConnection, GoodsTable)
    })
    .catch((err) => {
      console.log("连接自身用 Mongodb 错误:==\n", err);
      mongodbConnection = undefined;
    });
  return router;
};