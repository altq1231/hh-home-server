const jwt = require("jsonwebtoken");
const jwtSalt = "blog";
const base64url = require("base64url");
const Result = require("./status-handle.js");
const moment = require("moment");
const busboy = require("busboy");
const path = require("path");
const fs = require("fs");
const ip = require("ip");
const port = process.env.PORT || 3301;
const {
  v4: uuidv4
} = require('uuid')

const sendCode = require("../utils/captcha");

const {
  insertDoc,
  findDoc,
  updateDocById,
  updateDocOne,
  // removeDocById,
} = require("../mongodb/method.js");

const DEFAULT_ADMIN_ACCOUNT = {
  adminName: "admin",
  adminPwd: "admin",
};

module.exports = (router, mongodbConnection, NormalUserTable, CaptchaTable) => {
  /* 获取管理员 */
  router.get("/user/getAdmin", (req, res) => {
    try {
      findDoc(NormalUserTable, {
        isAdmin: true,
      }).then((respAdminInfoArray) => {
        /* if admin account exist then response it */
        if (respAdminInfoArray.length > 0) {
          // console.log("respAdminInfoArray[0]", respAdminInfoArray[0]);
          const temp = {
            userName: respAdminInfoArray[0].userName,
            userPwd: respAdminInfoArray[0].userPwd,
            userDesc: respAdminInfoArray[0].userDesc,
            _id: respAdminInfoArray[0]._id,
            email: respAdminInfoArray[0].email,
            isAdmin: respAdminInfoArray[0].isAdmin,
          };
          console.log("获取管理员信息成功 ==", temp);
          new Result(temp, "获取管理员信息成功").success(res);
        } else {
          /* create it */
          insertDoc(NormalUserTable, {
            userName: DEFAULT_ADMIN_ACCOUNT.adminName,
            userPwd: DEFAULT_ADMIN_ACCOUNT.adminPwd,
            userDesc: "管理员账户用于创建模板",
            email: "2783956045@qq.com",
            isAdmin: true,
          }).then((respCreatedAdmin) => {
            const temp = {
              userName: respCreatedAdmin.userName,
              userPwd: respCreatedAdmin.userPwd,
              userDesc: respCreatedAdmin.userDesc,
              email: "2783956045@qq.com",
              _id: respCreatedAdmin._id,
              isAdmin: true,
            };
            console.log("插入管理员信息成功 ==", temp);
            new Result(temp, "获取管理员信息成功").success(res);
          });
        }
      });
    } catch (err) {
      console.log("getAdmin err:==", err);
      new Result("查询管理员错误").fail(res);
    }
  });

  /* 创建普通用户 */
  router.post("/user/register", async (req, res) => {
    try {
      const {
        userName,
        userPwd,
        userDesc = "普通用户",
        email,
        code,
      } = req.body;
      const reg = new RegExp(userName, "i");
      const regEmail = new RegExp(email, "i"); //不区分大小写

      const codeRes = await findDoc(CaptchaTable, {
        email: email
      });
      const nowT = moment();
      // console.log(nowT.valueOf(), code, codeRes[0], code === codeRes[0].code);
      if (nowT.valueOf() > codeRes[0].failureTime) {
        new Result("验证码过期").fail(res);
      } else {
        if (Number(code) === codeRes[0].code) {
          const temp = {
            failureTime: moment(),
          };
          // console.log("update---------", userRes);
          updateDocOne(CaptchaTable, {
              email
            }, temp)
            .then(() => {
              findDoc(NormalUserTable, {
                $or: [
                  //多条件，数组
                  {
                    userName: {
                      $regex: reg
                    }
                  },
                  {
                    email: {
                      $regex: regEmail
                    }
                  },
                ],
              }).then((respUserArray) => {
                if (respUserArray.length > 0) {
                  const userInfo = {
                    userName: userName,
                    userPwd: userPwd,
                    userDesc: userDesc,
                    email: email,
                    isAdmin: respUserArray[0].isAdmin,
                  };
                  updateDocOne(
                    NormalUserTable, {
                      _id: respUserArray[0]._id
                    },
                    userInfo
                  ).then(() => {
                    new Result({
                        userName,
                        userPwd,
                        userDesc,
                        email,
                        isAdmin: respUserArray[0].isAdmin,
                        _id: respUserArray[0]._id,
                      },
                      "更新用户信息成功"
                    ).success(res);
                  });
                } else {
                  const userInfo = {
                    userName: userName,
                    userPwd: userPwd,
                    userDesc: userDesc,
                    email: email,
                    isAdmin: false,
                  };
                  insertDoc(NormalUserTable, userInfo).then(
                    (respCreatedUser) => {
                      // console.log(respCreatedUser);
                      userInfo._id = respCreatedUser._id;
                      // console.log("插入普通用户信息成功 ==", userInfo);
                      new Result(userInfo, "注册成功").success(res);
                    }
                  );
                }
              });
            })
            .catch((err) => {
              console.error("过期验证码 error:==", err);
              new Result("验证码错误").fail(res);
            });
        } else {
          new Result("验证码错误").fail(res);
        }
      }
    } catch (err) {
      console.error("createNormalUser error:==", err);

      new Result("fail", "创建普通用户失败").fail(res);
    }
  });

  /* 获取所有用户 */
  router.get("/user/getAllUser", (req, res) => {
    // return new Promise((resolve, reject) => {
    findDoc(NormalUserTable)
      .then((allUser) => {
        const temp = allUser.map((item) => {
          let user = {};
          user.userName = item.userName;
          user.userPwd = item.userPwd;
          user.userDesc = item.userDesc;
          user.email = item.email;
          user.isAdmin = item.isAdmin;
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

  /* 登录 */
  router.post("/user/login", (req, res) => {
    // console.log("login", req.body.userName);
    if (req.body.userName && req.body.userPwd) {
      const {
        userName,
        userPwd
      } = req.body;
      const postName = userName;
      const postPwd = userPwd;
      /* get user info from db */
      findDoc(NormalUserTable, {
          userName: postName
        })
        .then((respUserArray) => {
          // console.log("login", userName, userPwd);
          if (respUserArray.length > 0) {
            const {
              userPwd,
              isAdmin,
              _id
            } = respUserArray[0];
            if (postPwd === userPwd) {
              const jwtToken = jwt.sign({
                  _id,
                  userName,
                  isAdmin,
                },
                jwtSalt
              );
              res.cookie("jwtToken", jwtToken);

              new Result({
                  _id,
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
    } else {
      new Result("请输入正确用户名/密码").fail(res);
    }
  });

  /* 验证码登录 */
  router.post("/user/captchaLogin", async (req, res) => {
    // console.log("login", req.body.userName);
    if (req.body.email && req.body.code) {
      const {
        email,
        code
      } = req.body;
      /* get user info from db */
      const userRes = await findDoc(NormalUserTable, {
        email: email
      });
      const codeRes = await findDoc(CaptchaTable, {
        email: email
      });
      const nowT = moment();
      // console.log(nowT.valueOf(), code, codeRes[0], code === codeRes[0].code);
      if (nowT.valueOf() > codeRes[0].failureTime) {
        new Result("验证码过期").fail(res);
      } else {
        if (Number(code) === codeRes[0].code) {
          const temp = {
            failureTime: moment(),
          };
          // console.log("update---------", userRes);
          updateDocOne(CaptchaTable, {
              email
            }, temp)
            .then(() => {
              if (userRes.length > 0) {
                // console.log("updateDocOne", respCaptchaArray);
                const {
                  userName,
                  isAdmin,
                  _id
                } = userRes[0];
                if (userName === "") {
                  new Result({
                    _id,
                    isNewUser: true
                  }, "登录成功").success(res);
                } else {
                  new Result({
                      userName: userName,
                      isAdmin,
                      _id
                    },
                    "登录成功"
                  ).success(res);
                }
              } else {
                const userInfo = {
                  userName: "",
                  userPwd: "",
                  userDesc: "",
                  email: email,
                  isAdmin: false,
                };
                insertDoc(NormalUserTable, userInfo).then((respNorUser) => {
                  new Result({
                      _id: respNorUser._id,
                      isNewUser: true
                    },
                    "登录成功"
                  ).success(res);
                });
              }
            })
            .catch((err) => {
              console.error("过期验证码 error:==", err);
              new Result("验证码错误").fail(res);
            });
        } else {
          new Result("验证码错误").fail(res);
        }
      }
    } else {
      new Result("验证码登录错误,请确认邮箱地址跟验证码").fail(res);
    }
  });

  /* 发送验证码 */
  router.post("/user/sendCaptcha", (req, res) => {
    // console.log("发送验证码", req.body.mail);
    if (req.body.email) {
      const {
        email
      } = req.body;
      // console.log(email);
      sendCode(email, (result) => {
        // console.log("发送==========", result.captchaNum);

        try {
          if (result.isSend) {
            findDoc(CaptchaTable, {
              email,
            }).then((respCaptchaArray) => {
              if (respCaptchaArray.length > 0) {
                // console.log("respAdminInfoArray[0]", respAdminInfoArray[0]);

                const temp = {
                  effectiveTime: moment().valueOf(),
                  failureTime: moment().add(5, "m").valueOf(),
                  code: result.captchaNum,
                };
                // console.log("update---------", temp);
                updateDocOne(CaptchaTable, {
                    email
                  }, temp)
                  .then(() => {
                    // console.log("updateDocOne", respCaptchaArray);
                    new Result("发送成功,验证码5分钟内有效").success(res);
                  })
                  .catch((err) => {
                    console.error("updateDocOne error:==", err);
                    new Result("发送失败").fail(res);
                  });
              } else {
                /* create it */
                const temp = {
                  email: email,
                  effectiveTime: moment().valueOf(),
                  failureTime: moment().add(5, "m").valueOf(),
                  code: result.captchaNum,
                };
                // console.log("insert-----------", temp);
                insertDoc(CaptchaTable, temp)
                  .then(() => {
                    // console.log("插入验证码 ==", respCaptchaArray);
                    new Result("发送成功,验证码5分钟内有效").success(res);
                  })
                  .catch((err) => {
                    console.error("updateDocOne error:==", err);
                    new Result("发送失败").fail(res);
                  });
              }
            });
          } else {
            new Result("发送失败,请输入正确邮箱").fail(res);
          }
        } catch (err) {
          console.log(err);
          new Result("发送失败").fail(res);
        }
      });
    } else {
      new Result("请输入正确邮箱").fail(res);
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
    new Result("登出成功").success(res);
  });

  /* 第一次验证码登录更新信息 */
  router.post("/user/improveUserInfo", (req, res) => {
    try {
      const {
        userName,
        userPwd,
        _id,
        email
      } = req.body;
      console.log(userName, userPwd, _id);

      updateDocOne(NormalUserTable, {
        _id,
        email
      }, {
        userName,
        userPwd
      }).then(
        (updateResInfo) => {
          console.log("完善=======", updateResInfo);
          new Result({
            _id,
            userName
          }, "完善成功").success(res);
        }
      );
    } catch (err) {
      new Result(err, "完善错误").fail(err);
    }
  });

  /* 验证普通用户 */
  router.post("/user/modifyNormalUser", async (req, res) => {
    try {
      // console.log('modifyNormalUser req.body:==', req.body);
      const {
        userName,
        userPwd,
        userDesc,
        _id
      } = req.body;
      const userInfo = {
        userName: userName,
        userPwd: userPwd,
        userDesc: userDesc,
      };
      await updateDocById(NormalUserTable, {
        _id
      }, userInfo);

      new Result("success", "修改普通用户信息成功").success(res);
    } catch (err) {
      console.error("modifyNormalUser error:==", err);

      new Result("fail", "修改普通用户信息失败").fail(res);
    }
  });

  /* 获取所有普通用户 */
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

  /* 测试 */
  router.get("/user/testUpdate", (req, res) => {
    try {
      const temp = {
        effectiveTime: moment(),
        failureTime: moment().add(5, "m"),
        code: 22222,
      };
      updateDocOne(CaptchaTable, {
        email: "1149450846@qq.com"
      }, temp).then(
        (resUpdateInfo) => {
          console.log("return -========", resUpdateInfo);

          findDoc(CaptchaTable, {
            email: "1149450846@qq.com"
          }).then(
            (findRes) => {
              console.log("find return =====", findRes);
            }
          );
        }
      );

      new Result("更新成功", "更新成功").success(res);
    } catch (err) {
      console.log("测试更新 err:==", err);
      new Result("更新错误", "更新错误").success(res);
    }
  });

  /* uploadImageOrVideo */
  router.post("/uploadImageOrVideo", (req, res) => {
    try {
      const bb = busboy({
        headers: req.headers
      });
      let resInfo = {
        name: "",
        type: "",
        path: "",
      };
      bb.on("file", (fieldName, file, info) => {
        console.log("uploadImageOrVideo", fieldName, info);
        // const saveTo = path.join(
        //   __dirname,
        //   `../../static/upload/${fieldName}/${info.filename}`
        // );
        const uuidName = uuidv4()
        const extname = info.mimeType.split('/')[1]
        const keepName = uuidName + '.' + extname
        const saveTo = path.join(
          __dirname,
          `../../static/upload/${fieldName}/${keepName}`
        );

        resInfo.name = info.filename;
        resInfo.type = fieldName;
        resInfo.path = `http://${ip.address()}:${port}/static/upload/${fieldName}/${keepName}`;

        console.log('keepName', keepName);

        file.pipe(fs.createWriteStream(saveTo));
      });
      bb.on("field", (name, val, info) => {
        console.log(`Field [${name}]: value: %j`, val);
        new Result(`Field [${name}]: value: %j`, val, "文件上传失败").fail(res);
      });
      bb.on("close", (fieldName, file, info) => {
        console.log("上传文件-保存文件成功");
        new Result(resInfo, "文件上传成功").success(res);
      });
      req.pipe(bb);
    } catch (err) {
      console.log("uploadImageOrVideo", err);
      new Result("文件上传失败").fail(res);
    }
  });
};