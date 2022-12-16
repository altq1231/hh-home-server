const Result = require("./status-handle.js");

const {
  insertDoc,
  insertMany,
  findDoc,
  updateDocById,
  updateDocOne,
  // removeDocById,
} = require("../mongodb/method.js");

module.exports = (router, mongodbConnection, GoodsTable) => {
  /* 获取所有物品 */
  router.get("/goods/getAllGoods", (req, res) => {
    try {
      findDoc(GoodsTable)
        .then((allGoods) => {

          console.log("获取所有商品 ==", allGoods);
          new Result(allGoods, "获取所有商品成功").success(res);
        })
        .catch((err) => {
          console.log(err);
          new Result("获取所有商品失败").fail(res);
        });
    } catch (err) {
      console.log("getAdmin err:==", err);
      new Result("查询管理员错误").fail(res);
    }
  });


  /* 创建商品 */
  router.post("/goods/addAGoods", async (req, res) => {
    try {
      console.log(req.body);

      insertDoc(GoodsTable, req.body).then(
        (resGoods) => {
          new Result(resGoods.id, "创建商品成功").success(res);
        }
      );
    } catch (err) {
      console.error("addAGoods error:==", err);

      new Result("fail", "创建商品失败").fail(res);
    }
  });
};