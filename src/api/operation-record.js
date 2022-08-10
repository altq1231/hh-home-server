const Result = require("./status-handle.js");
const moment = require("moment");
const {
  insertDoc,
  insertMany,
  findDoc,
  updateDocById,
  updateDocOne,
  // removeDocById,
} = require("../mongodb/method.js");

module.exports = (router, mongodbConnection, OperationRecordTable) => {
  /* 获取所有操作记录 */
  router.get("/or/getAllRecord", (req, res) => {
    try {
      findDoc(OperationRecordTable).then((resRecordArr) => {
        // console.log(resRecordArr);
        new Result(resRecordArr, "查询所有记录成功").success(res);
      });
    } catch (err) {
      console.log("getAllRecord err:==", err);
      new Result("查询所有记录失败").fail(res);
    }
  });
  /* 获取用户的所有操作记录 */
  router.get("/or/getSelfRecord", (req, res) => {
    try {
      const { userId } = req.query;
      findDoc(OperationRecordTable, { userId }).then((resRecordArr) => {
        // console.log(resRecordArr);
        new Result(resRecordArr, "查询所有记录成功").success(res);
      });
    } catch (err) {
      console.log("getAllRecord err:==", err);
      new Result("查询所有记录失败").fail(res);
    }
  });
  /* 插入操作记录 */
  router.post("/or/addARecord", (req, res) => {
    try {
      // console.log('modifyNormalUser req.body:==', req.body);

      // userId: String,
      // operationDate: String,
      // manageType: "shop" | "video" | "music",
      // operationType: "add" | "delete" | "update",
      // operationObj: String,
      const { operationDate, manageType, operationType, userId, operationObj } =
        req.body;
      const recordInfo = {
        operationDate: moment(),
        manageType,
        operationType,
        userId,
        operationObj,
      };
      insertDoc(OperationRecordTable, recordInfo).then((respCreatedUser) => {
        // console.log(respCreatedUser);
        recordInfo._id = respCreatedUser._id;
        // console.log("插入普通用户信息成功 ==", recordInfo);
        new Result(recordInfo, "添加一条操作记录成功").success(res);
      });
    } catch (err) {
      console.error("addARecord error:==", err);

      new Result("fail", "添加一条操作记录失败").fail(res);
    }
  });
};
