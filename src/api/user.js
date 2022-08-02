const jwt = require("jsonwebtoken");
const jwtSalt = "blog";
const base64url = require("base64url");
const Result = require("./status-handle.js");

const {
  insertDoc,
  findDoc,
  updateDocById,
  // removeDocById,
} = require("../mongodb/method.js");

const DEFAULT_ADMIN_ACCOUNT = {
  adminName: "admin",
  adminPwd: "admin",
};

module.exports = (router, mongodbConnection, NormalUserTable) => {
  router.get("/user/getAllUser", (req, res) => {
    // return new Promise((resolve, reject) => {
    findDoc(NormalUserTable)
      .then((allUser) => {
        const temp = allUser.map((item) => {
          let user = {};
          user.userName = base64url.decode(item.userName);
          user.userPwd = base64url.decode(item.userPwd);
          user.userDesc = base64url.decode(item.userDesc);
          return user;
        });
        console.log("获取所有用户 ==", temp);
        new Result(temp, "获取所有用户信息成功").success(res);
      })
      .catch((err) => {
        console.log(err);
        new Result("获取所有用户信息失败").fail(res);
      });
    // });
  });

  router.post("/user/login", (req, res) => {
    const { userName, userPwd } = req.body;
    const postName = base64url.encode(userName);
    const postPwd = base64url.encode(userPwd);
    // console.log("login", postName);
    /* get user info from db */
    findDoc(NormalUserTable, { userName: postName })
      .then((respUserArray) => {
        // console.log("login", userName, userPwd);
        if (respUserArray.length > 0) {
          const { userPwd, isAdmin, _id } = respUserArray[0];
          if (postPwd === userPwd) {
            const jwtToken = jwt.sign(
              {
                userId: _id,
                userName,
                isAdmin,
              },
              jwtSalt
            );
            res.cookie("jwtToken", jwtToken);

            new Result(
              {
                userId: _id,
                userName,
                isAdmin,
              },
              "登录成功"
            ).success(res);
          } else {
            new Result("密码错误").fail(res);
          }
        } else {
          new Result("用户不存在").fail(res);
        }
      })
      .catch((err) => {
        console.error("login error:==", err);
        new Result("登录出错").fail(res);
      });
  });

  router.get("/user/getAdmin", async (req, res) => {
    try {
      const respAdminInfoArray = await findDoc(NormalUserTable, {
        isAdmin: true,
      });
      /* if admin account exist then response it */
      if (respAdminInfoArray.length > 0) {
        // console.log("respAdminInfoArray[0]", respAdminInfoArray[0]);
        const temp = {
          userName: base64url.decode(respAdminInfoArray[0].userName),
          userPwd: base64url.decode(respAdminInfoArray[0].userPwd),
          userDesc: base64url.decode(respAdminInfoArray[0].userDesc),
          isAdmin: respAdminInfoArray[0].isAdmin,
        };
        new Result(temp, "获取管理员信息成功").success(res);
      } else {
        /* create it */
        const respCreatedAdmin = await insertDoc(NormalUserTable, {
          userName: base64url.encode(DEFAULT_ADMIN_ACCOUNT.adminName),
          userPwd: base64url.encode(DEFAULT_ADMIN_ACCOUNT.adminPwd),
          userDesc: base64url.encode("管理员账户用于创建模板"),
          isAdmin: true,
        });

        const temp = {
          userName: base64url.decode(respCreatedAdmin.userName),
          userPwd: base64url.decode(respCreatedAdmin.userPwd),
          userDesc: base64url.decode(respCreatedAdmin.userDesc),
          ...respCreatedAdmin,
        };
        console.log("获取所有用户 ==", temp);
        new Result(temp, "获取管理员信息成功").success(res);
      }
    } catch (err) {
      console.log("getAdmin err:==", err);
      new Result("查询管理员错误").fail(res);
    }
  });
  /* 验证是否已经登录 */
  router.get("/user/authenticate", (req, res) => {
    // console.log('req.cookies.jwtToken:==', req.cookies.jwtToken);
    let decodedJwt = null;
    if (req.cookies.jwtToken) {
      try {
        decodedJwt = jwt.verify(req.cookies.jwtToken, jwtSalt);
        new Result(decodedJwt, "用户已登录").success(res);
      } catch (err) {
        // console.log("decodedJwt error:==", err);
        new Result("fail", "用户未登录").fail(res);
      }
    } else {
      new Result("fail", "用户未登录").fail(res);
    }
  });

  /* 用户登出清除 cookie */
  router.get("/user/logout", (req, res) => {
    // console.log('req.cookies.jwtToken:==', req.cookies.jwtToken);
    res.clearCookie("jwtToken");
    new Result("登出成功", "登出成功").success(res);
  });

  router.post("/user/createNormalUser", async (req, res) => {
    try {
      const { userName, userPwd, userDesc } = req.body;
      const userInfo = {
        userName: base64url.encode(userName),
        userPwd: base64url.encode(userPwd),
        userDesc: base64url.encode(userDesc),
        isAdmin: false,
      };
      const respNorUser = await insertDoc(NormalUserTable, userInfo);
      const respNorUserData = Object.assign({}, userInfo, {
        _id: respNorUser._id,
      });

      new Result(respNorUserData, "添加普通用户成功").success(res);
    } catch (err) {
      console.error("createNormalUser error:==", err);

      new Result("fail", "创建普通用户失败").fail(res);
    }
  });

  router.post("/user/modifyNormalUser", async (req, res) => {
    try {
      // console.log('modifyNormalUser req.body:==', req.body);
      const { userName, userPwd, userDesc, _id } = req.body;
      const userInfo = {
        userName: base64url.encode(userName),
        userPwd: base64url.encode(userPwd),
        userDesc: base64url.encode(userDesc),
      };
      await updateDocById(NormalUserTable, { _id }, userInfo);

      new Result("success", "修改普通用户信息成功").success(res);
    } catch (err) {
      console.error("modifyNormalUser error:==", err);

      new Result("fail", "修改普通用户信息失败").fail(res);
    }
  });

  router.get("/user/getAllNormalUser", async (req, res) => {
    try {
      const findResp = await findDoc(NormalUserTable);
      /* we should decode userName and password before send to client */
      const allNormalUserListArray = [...findResp];
      allNormalUserListArray.splice(0, 1);

      new Result(allNormalUserListArray, "查询所有普通用户成功").success(res);
    } catch (err) {
      console.log("getAllNormalUser err:==", err);
      new Result("查询普通用户错误", "查询普通用户错误").success(res);
    }
  });
};
