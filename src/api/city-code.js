const Result = require("./status-handle.js");

const {
  insertMany,
  findDoc,
  updateDocById,
  updateDocOne,
  // removeDocById,
} = require("../mongodb/method.js");

const adCode = require("../../static/others/adCode.json");

module.exports = (router, mongodbConnection, CityCodeTable) => {
  /* 获取所有城市 */
  router.get("/getAllCity", (req, res) => {
    try {
      findDoc(CityCodeTable).then((resCityArr) => {
        console.log(resCityArr);
        if (resCityArr.length > 0) {
          new Result(resCityArr, "查询所有城市Code失败").success(res);
        } else {
          insertMany(CityCodeTable, adCode).then((insertResArr) => {
            new Result(insertResArr, "查询所有城市Code失败").success(res);
          });
        }
      });
    } catch (err) {
      console.log("getAllCity err:==", err);
      new Result("查询所有城市Code失败").fail(res);
    }
  });
  /* 获取城市adcode代码 */
  router.get("/getCityAdCode", (req, res) => {
    try {
      const { cityName } = req.query;
      findDoc(CityCodeTable, { cityName }).then((resCityArr) => {
        if (resCityArr.length > 0) {
          const cityData = {
            cityName: resCityArr[0].cityName,
            cityCode: resCityArr[0].cityCode,
            adCode: resCityArr[0].adCode,
          };
          new Result(cityData, "查询城市数据成功").success(res);
        } else {
          new Result("查询城市数据错误,请确认城市名称是否正确").fail(res);
        }
      });
    } catch (err) {
      console.log("getCityAdCode err:==", err);
      new Result("查询城市数据失败").fail(res);
    }
  });
};
