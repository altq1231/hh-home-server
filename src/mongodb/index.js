/**
 * @class     MongoDB 封装
 * @param     url                  数据库地址 默认: mongodb://localhost:27017/  可选
 * @author    altq 2021/12/01
 */
// Using Node.js `require()`
const mongoose = require("mongoose");
const url =
  process.env.DB_URL + process.env.DB_NAME ||
  "mongodb://localhost:27017/" + process.env.DB_NAME;

module.exports = () =>
  new Promise((resolve, reject) => {
    // mongoose.connect('mongodb://username:password@host:port/database?options...')
    const connection = mongoose.createConnection(
      url,
      {
        /**
         * 默认为重试30次，间隔1秒，也就是30秒以后放弃
         * 连接超时时间，主要用于IP地址不通的测试
         * 如果将参数改的太小，容易出问题
         */
        // connectTimeoutMS: testConnectDBTimeout,
        // socketTimeoutMS: testConnectDBTimeout,
        // reconnectTries: 1,
        // keepAlive: true,
      },
      (err) => {
        if (err) {
          reject(err);
        } else {
          console.log(`mongodb connected successful to${url}`); //eslint-disable-line
          resolve(connection);
        }
      }
    );
  });
