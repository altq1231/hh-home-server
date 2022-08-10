// const jwt = require('jsonwebtoken')
const fs = require("fs");
const path = require("path");
const Busboy = require("busboy");
const { v4: uuidv4 } = require("uuid");

const { insertDoc, findDoc, updateDocById, removeDocById, removeManyByCondition, insertMany } = require("../mongodb/method.js");

const comsLisRootPath = path.join(__dirname, "../../chart-library/src/components");
const screenShotRootPath = path.join(__dirname, "../static/snapshot");

module.exports = (router, mongodbConnection, ScreenTable, ComTable) => {
  /* getAllComsList */
  router.get("/cbs/getAllComsList", (req, res) => {
    try {
      fs.readdir(comsLisRootPath, "utf8", (readDirErr, bigTypeNamesArray) => {
        const filteredBigTypeNamesArray = bigTypeNamesArray.filter((name) => !name.startsWith(".")).sort();
        // console.log("filteredBigTypeNamesArray:==", filteredBigTypeNamesArray);
        const allTypeComsListObj = {};
        filteredBigTypeNamesArray.map((bigTypeName) => {
          // console.log("bigTypeName:==", bigTypeName);
          allTypeComsListObj[bigTypeName] = {};
          const toReadDirPath = path.join(comsLisRootPath, `/${bigTypeName}`);
          const oneTypeComsListNameArray = fs.readdirSync(toReadDirPath, "utf-8");
          // console.log("oneTypeComsListNameArray:==", oneTypeComsListNameArray);
          const filteredOneTypeComsListNameArray = oneTypeComsListNameArray.filter((name) => !name.startsWith("."));
          const hasSubType = filteredOneTypeComsListNameArray.includes("subType");
          allTypeComsListObj[bigTypeName].all = [];

          if (hasSubType) {
            console.log("hasSubType:==", oneTypeComsListNameArray);
            allTypeComsListObj[bigTypeName].subType = {};
            const toReadSubTypeDirPath = path.join(toReadDirPath, "subType");
            const subTypeDirNamesArray = fs.readdirSync(toReadSubTypeDirPath, "utf-8");
            const filteredSubTypeDirNamesArray = subTypeDirNamesArray.filter((name) => !name.startsWith("."));
            filteredSubTypeDirNamesArray.map((subDirName) => {
              const toReadSubTypeComsDirPath = path.join(toReadSubTypeDirPath, subDirName);
              const subTypeComsDirNameArray = fs.readdirSync(toReadSubTypeComsDirPath, "utf-8");
              const filteredSubTypeComsDirNameArray = subTypeComsDirNameArray.filter((name) => !name.startsWith("."));
              allTypeComsListObj[bigTypeName].subType[subDirName] = [];
              filteredSubTypeComsDirNameArray.map((subComName) => {
                const comInfoObj = {};
                comInfoObj.comPathPrefix = `${bigTypeName}/subType/${subDirName}`;
                comInfoObj.id = uuidv4();
                comInfoObj.comName = subComName;
                allTypeComsListObj[bigTypeName].all.push(comInfoObj);
                allTypeComsListObj[bigTypeName].subType[subDirName].push(comInfoObj);
              });
            });
          } else {
            filteredOneTypeComsListNameArray.map((comName) => {
              const comInfoObj = {};
              comInfoObj.comPathPrefix = `${bigTypeName}`;
              comInfoObj.id = uuidv4();
              comInfoObj.comName = comName;
              allTypeComsListObj[bigTypeName].all.push(comInfoObj);
            });
          }
        });
        allTypeComsListObj.media = {};
        allTypeComsListObj.media.subType = {};
        /* read images */
        allTypeComsListObj.media.subType.img = [];
        const toReadImgPath = path.join(__dirname, "../static/upload/images");
        const imgArray = fs.readdirSync(toReadImgPath, "utf-8");
        const filteredImgArray = imgArray.filter((name) => !name.startsWith("."));
        allTypeComsListObj.media.subType.img = filteredImgArray;
        /* read videos */
        allTypeComsListObj.media.subType.video = [];
        const toReadVideoPath = path.join(__dirname, "../static/upload/videos");
        const videoArray = fs.readdirSync(toReadVideoPath, "utf-8");
        const filteredVideoArray = videoArray.filter((name) => !name.startsWith("."));
        allTypeComsListObj.media.subType.video = filteredVideoArray;
        res.json({
          success: true,
          data: allTypeComsListObj,
        });
      });
    } catch (err) {
      console.error("getAllComsList err:==", err);
      res.json({
        success: false,
        data: "getAllComsList error",
      });
    }
  });

  /* getOneTypeComList */
  router.post("/cbs/getOneTypeComList", async (req, res) => {
    const { comPathPrefix } = req.body;
    // const comTypePath = path.join(comsLisRootPath, `/${comPathPrefix}`);
    const comTypePath = path.join(__dirname, `../../chart-library/src/components/${comPathPrefix}`);
    // console.log("comPathPrefix", comPathPrefix, comTypePath);
    try {
      fs.readdir(comTypePath, "utf8", (readDirErr, fileNameArr) => {
        const filteredOneTypeNamesArray = fileNameArr.filter((name) => !name.startsWith(".")).sort();
        // console.log("filteredOneTypeNamesArray:==", filteredOneTypeNamesArray);
        res.json({
          success: true,
          data: filteredOneTypeNamesArray,
        });
      });
    } catch (err) {
      console.error("getAllComsList err:==", err);
      res.json({
        success: false,
        data: "getAllComsList error",
      });
    }
  });

  // /* clear all coms on stage */
  // router.post("/cbs/clearAllComsOnStage", async (req, res) => {
  //   try {
  //     const { toClearScreenId } = req.body;
  //     await removeManyByCondition(ComTable, { belongTo: toClearScreenId });
  //     res.json({
  //       success: true,
  //       data: "clearAllComsOnStage success",
  //     });
  //   } catch (err) {
  //     console.error("clearAllComsOnStage err:==", err);
  //     res.json({
  //       success: false,
  //       data: "clearAllComsOnStage error",
  //     });
  //   }
  // });

  // /* getImgOrVideoComsList */
  // router.get("/cbs/getImgOrVideoComsList", async (req, res) => {
  //   try {
  //     const { imgOrVideo } = req.query;
  //     const imgOrVideoComsListPath = path.join(__dirname, `../static/upload/${imgOrVideo}`);
  //     const respImgOrVideoComsList = fs.readdirSync(imgOrVideoComsListPath, "utf-8");
  //     // console.log('getImgComsList respImgComsList:==', respImgComsList);
  //     const filteredImgNamesArray = respImgOrVideoComsList.filter((comName) => !comName.startsWith("."));
  //     const toResponseImgNamesArray = [];
  //     filteredImgNamesArray.map((name) => {
  //       const tempObj = {};
  //       tempObj.id = uuidv4();
  //       tempObj.name = name;
  //       toResponseImgNamesArray.push(tempObj);
  //     });
  //     res.json({
  //       success: true,
  //       data: toResponseImgNamesArray,
  //     });
  //   } catch (err) {
  //     console.error("getImgOrVideoComsList err:==", err);
  //     res.json({
  //       success: false,
  //       data: "getImgOrVideoComsList error",
  //     });
  //   }
  // });

  // /* create bs to corresponding user */
  // router.post("/cbs/createBs", async (req, res) => {
  //   try {
  //     const { screenInfo } = req.body;
  //     // console.log('createBs screenInfo:==', screenInfo);
  //     /* first create a new screen get the screen id */
  //     const respAddScreenInfo = await insertDoc(ScreenTable, screenInfo);
  //     // console.log('createBs respAddScreenInfo:==', respAddScreenInfo);
  //     res.json({
  //       success: true,
  //       data: respAddScreenInfo,
  //     });
  //   } catch (err) {
  //     console.error("createBs err:==", err);
  //     res.json({
  //       success: false,
  //       data: "createBs error",
  //     });
  //   }
  // });

  // /* hasSnapShot */
  // router.get("/cbs/hasSnapShot", async (req, res) => {
  //   try {
  //     const { screenName } = req.query;
  //     // console.log('hasSnapShot screenName:==', screenName);
  //     const toReadFilePath = `${screenShotRootPath}/${screenName}.png`;
  //     if (fs.existsSync(toReadFilePath)) {
  //       res.json({
  //         success: true,
  //         data: true,
  //       });
  //     } else {
  //       res.json({
  //         success: true,
  //         data: false,
  //       });
  //     }
  //   } catch (err) {
  //     console.error("hasSnapShot err:==", err);
  //     res.json({
  //       success: false,
  //       data: "hasSnapShot error",
  //     });
  //   }
  // });

  // /* delOneScreen */
  // router.post("/cbs/delOneScreen", async (req, res) => {
  //   try {
  //     const { _id } = req.body;
  //     // console.log('delOneScreen _id:==', _id);
  //     /* delete screen */
  //     await removeDocById(ScreenTable, _id);
  //     /* delete corresponding coms */
  //     await removeManyByCondition(ComTable, { belongTo: _id });
  //     res.json({
  //       success: true,
  //       data: "delOneScreen success",
  //     });
  //   } catch (err) {
  //     console.error("delOneScreen err:==", err);
  //     res.json({
  //       success: false,
  //       data: "delOneScreen error",
  //     });
  //   }
  // });

  // /* copyOneScreen */
  // router.post("/cbs/copyOneScreen", async (req, res) => {
  //   try {
  //     const { _id } = req.body;
  //     /* copy screen */
  //     const toCopyScreenInfo = await findDoc(ScreenTable, { _id });
  //     const toCopyScreenInfoObj = Object.assign({}, toCopyScreenInfo[0])._doc;
  //     delete toCopyScreenInfoObj._id;
  //     delete toCopyScreenInfoObj.__v;
  //     toCopyScreenInfoObj.createTime = new Date();
  //     const respCopiedScreenInfo = await insertDoc(ScreenTable, toCopyScreenInfoObj);
  //     const newScreenId = respCopiedScreenInfo._id;
  //     /* copy corresponding coms */
  //     const respToCopyComsArray = await findDoc(ComTable, { belongTo: _id });
  //     const toCopyComsArray = [];
  //     respToCopyComsArray.map((comInfo) => {
  //       const tempComInfo = Object.assign({}, comInfo)._doc;
  //       tempComInfo.belongTo = newScreenId;
  //       delete tempComInfo._id;
  //       delete tempComInfo.__v;
  //       toCopyComsArray.push(tempComInfo);
  //     });
  //     await insertMany(ComTable, toCopyComsArray);
  //     res.json({
  //       success: true,
  //       data: respCopiedScreenInfo,
  //     });
  //   } catch (err) {
  //     console.error("copyOneScreen err:==", err);
  //     res.json({
  //       success: false,
  //       data: "copyOneScreen error",
  //     });
  //   }
  // });

  // /* create bs to corresponding user */
  // router.get("/cbs/getCertainUserScreenInfo", async (req, res) => {
  //   try {
  //     const { userName } = req.query;
  //     const respScreenInfoArray = await findDoc(ScreenTable, { belongTo: userName });
  //     // console.log('respScreenInfoArray:==', respScreenInfoArray);
  //     res.json({
  //       success: true,
  //       data: respScreenInfoArray,
  //     });
  //   } catch (err) {
  //     console.error("getCertainUserScreenInfo err:==", err);
  //     res.json({
  //       success: false,
  //       data: "getCertainUserScreenInfo error",
  //     });
  //   }
  // });

  // /* getTemplates */
  // router.get("/cbs/getTemplates", async (req, res) => {
  //   try {
  //     const respTemplatesArray = await findDoc(ScreenTable, req.query);
  //     // console.log('respTemplatesArray:==', respTemplatesArray);
  //     res.json({
  //       success: true,
  //       data: respTemplatesArray,
  //     });
  //   } catch (err) {
  //     console.error("getTemplates err:==", err);
  //     res.json({
  //       success: false,
  //       data: "getTemplates error",
  //     });
  //   }
  // });

  // /* create bs to corresponding user */
  // router.post("/cbs/copyTemplateComs", async (req, res) => {
  //   try {
  //     const { toCopyScreenId, targetScreenId } = req.body;
  //     // console.log('copyTemplateComs req.body:==', req.body);
  //     /* get all to copy coms */
  //     const respToCopyComsArray = await findDoc(ComTable, { belongTo: toCopyScreenId });
  //     const toCopyComsArray = [];
  //     respToCopyComsArray.map((comInfo) => {
  //       const tempComInfo = Object.assign({}, comInfo)._doc;
  //       tempComInfo.belongTo = targetScreenId;
  //       delete tempComInfo._id;
  //       delete tempComInfo.__v;
  //       toCopyComsArray.push(tempComInfo);
  //     });
  //     // console.log('toCopyComsArray:==', toCopyComsArray);
  //     await insertMany(ComTable, toCopyComsArray);
  //     res.json({
  //       success: true,
  //       data: "copyTemplateComs success",
  //     });
  //   } catch (err) {
  //     console.error("copyTemplateComs err:==", err);
  //     res.json({
  //       success: false,
  //       data: "copyTemplateComs error",
  //     });
  //   }
  // });

  // /* getCurrentEditScreenInfo */
  // router.get("/cbs/getCurrentEditScreenInfo", async (req, res) => {
  //   try {
  //     const { _id } = req.query;
  //     const respScreenInfo = await findDoc(ScreenTable, { _id });
  //     // console.log('respScreenInfo[0]:==', respScreenInfo[0]);
  //     res.json({
  //       success: true,
  //       data: respScreenInfo[0],
  //     });
  //   } catch (err) {
  //     console.error("getCurrentEditScreenInfo err:==", err);
  //     res.json({
  //       success: false,
  //       data: "getCurrentEditScreenInfo error",
  //     });
  //   }
  // });

  // /* updateScreenInfo */
  // router.post("/cbs/updateScreenInfo", async (req, res) => {
  //   try {
  //     const { screenId, toUpdateObj } = req.body;
  //     const respScreenInfo = await findDoc(ScreenTable, { _id: screenId });
  //     const toUpdateObjKeysArray = Object.keys(toUpdateObj);
  //     toUpdateObjKeysArray.map((key) => {
  //       respScreenInfo[0][key] = toUpdateObj[key];
  //     });
  //     const respUpdateScreenInfo = await updateDocById(ScreenTable, screenId, respScreenInfo[0]);
  //     res.json({
  //       success: true,
  //       data: respUpdateScreenInfo,
  //     });
  //   } catch (err) {
  //     console.error("updateScreenInfo err:==", err);
  //     res.json({
  //       success: false,
  //       data: "updateScreenInfo error",
  //     });
  //   }
  // });

  // /* updateScreenInfo */
  // router.post("/cbs/saveScreenShot", async (req, res) => {
  //   try {
  //     const { dataURL, screenName } = req.body;
  //     /* 过滤data:URL */
  //     const base64Data = dataURL.split(";base64,").pop();
  //     const toWritePath = `${screenShotRootPath}/${screenName}.png`;
  //     fs.writeFile(toWritePath, base64Data, { encoding: "base64" }, () => {
  //       res.json({
  //         success: true,
  //         data: "保存大屏缩略图成功",
  //       });
  //     });
  //   } catch (err) {
  //     console.error("saveScreenShot err:==", err);
  //     res.json({
  //       success: false,
  //       data: "saveScreenShot error",
  //     });
  //   }
  // });

  /* getComPackageJson */
  router.post("/cbs/getComPackageJson", async (req, res) => {
    try {
      const { comPathPrefix, comName } = req.body;
      // console.log("getComPackageJson comInfoObj:==", comPathPrefix);
      const comPkgJsonPath = `/${comPathPrefix}/${comName}/common.json`;
      const toReadFilePath = path.join(comsLisRootPath, comPkgJsonPath);
      fs.readFile(toReadFilePath, "utf-8", (err, fileContent) => {
        const jsonFileContent = JSON.parse(fileContent);
        res.json({
          success: true,
          data: Object.assign(jsonFileContent, { comPathPrefix: comPathPrefix }),
        });
      });
    } catch (err) {
      console.error("getComPackageJson err:==", err);
      res.json({
        success: false,
        data: "getComPackageJson error",
      });
    }
  });

  // /* getComPackageJson */
  // router.post("/cbs/getImgComPackageJson", async (req, res) => {
  //   try {
  //     // console.log('getComPackageJson comInfoObj:==', comInfoObj);
  //     const toReadFilePath = path.join(__dirname, "../../componentsLib/ImageCommonCom/package.json");
  //     fs.readFile(toReadFilePath, "utf-8", (err, fileContent) => {
  //       res.json({
  //         success: true,
  //         data: JSON.parse(fileContent),
  //       });
  //     });
  //   } catch (err) {
  //     console.error("getImgComPackageJson err:==", err);
  //     res.json({
  //       success: false,
  //       data: "getImgComPackageJson error",
  //     });
  //   }
  // });

  // /* getVideoComPackageJson */
  // router.post("/cbs/getVideoComPackageJson", async (req, res) => {
  //   try {
  //     // console.log('getVideoComPackageJson comInfoObj:==', comInfoObj);
  //     const toReadFilePath = path.join(__dirname, "../../componentsLib/VideoCommonCom/package.json");
  //     fs.readFile(toReadFilePath, "utf-8", (err, fileContent) => {
  //       res.json({
  //         success: true,
  //         data: JSON.parse(fileContent),
  //       });
  //     });
  //   } catch (err) {
  //     console.error("getVideoComPackageJson err:==", err);
  //     res.json({
  //       success: false,
  //       data: "getVideoComPackageJson error",
  //     });
  //   }
  // });

  // /* uploadImageOrVideo */
  // router.post("/cbs/uploadImageOrVideo", (req, res) => {
  //   const busboy = new Busboy({ headers: req.headers });
  //   busboy.on("file", (fieldName, file, filename) => {
  //     // const saveTo = path.join(__dirname, `../static/upload/${fieldName}/${filename}`);
  //     const saveTo = path.join(__dirname, `../static/upload/${fieldName}/${filename.replace(/\s*/gi, "")}`);
  //     // console.log('path', saveTo)
  //     file.pipe(fs.createWriteStream(saveTo));
  //   });
  //   busboy.on("finish", () => {
  //     console.log("上传文件-保存文件成功");
  //     res.json({
  //       success: true,
  //       data: "文件上传成功",
  //     });
  //   });
  //   req.pipe(busboy);
  // });

  // /* delImg */
  // router.post("/cbs/delImgOrVideo", (req, res) => {
  //   const { imgOrVideo, imgOrVideoName } = req.body;
  //   const toDelImgPath = path.join(__dirname, `../static/upload/${imgOrVideo === "img" ? "images" : "videos"}/${imgOrVideoName}`);
  //   fs.unlink(toDelImgPath, (err) => {
  //     if (err) {
  //       console.error("delImgOrVideo error:==", err);
  //       res.json({
  //         success: false,
  //         data: "delImgOrVideo error",
  //       });
  //     } else {
  //       res.json({
  //         success: true,
  //         data: "delImgOrVideo success",
  //       });
  //     }
  //   });
  // });

  // /* addOneCom */
  // router.post("/cbs/addOneCom", async (req, res) => {
  //   try {
  //     const { toAddComInfo } = req.body;
  //     // console.log('addOneCom toAddComInfo:==', toAddComInfo);
  //     /* first create a new screen get the screen id */
  //     const respAddComInfo = await insertDoc(ComTable, toAddComInfo);
  //     // console.log('addOneCom respAddComInfo:==', respAddComInfo);
  //     res.json({
  //       success: true,
  //       data: respAddComInfo,
  //     });
  //   } catch (err) {
  //     console.error("addOneCom err:==", err);
  //     res.json({
  //       success: false,
  //       data: "addOneCom error",
  //     });
  //   }
  // });

  // /* getComsOnStage */
  // router.get("/cbs/getComsOnStage", async (req, res) => {
  //   try {
  //     const { screenId } = req.query;
  //     // console.log('getComsOnStage screenId:==', screenId);
  //     /* first create a new screen get the screen id */
  //     const respComsOnStage = await findDoc(ComTable, { belongTo: screenId });
  //     // console.log('getComsOnStage respComsOnStage:==', respComsOnStage);
  //     res.json({
  //       success: true,
  //       data: respComsOnStage,
  //     });
  //   } catch (err) {
  //     console.error("getComsOnStage err:==", err);
  //     res.json({
  //       success: false,
  //       data: "getComsOnStage error",
  //     });
  //   }
  // });

  // /* updateComRootParams */
  // router.post("/cbs/updateComRootParams", async (req, res) => {
  //   try {
  //     const { comId, toUpdateObj } = req.body;
  //     // console.log('tempToUpdateObj:==', toUpdateObj);
  //     const respUpdateComInfo = await updateDocById(ComTable, comId, toUpdateObj);
  //     res.json({
  //       success: true,
  //       data: respUpdateComInfo,
  //     });
  //   } catch (err) {
  //     console.error("updateComRootParams err:==", err);
  //     res.json({
  //       success: false,
  //       data: "updateComRootParams error",
  //     });
  //   }
  // });

  // /* updateComParams */
  // router.post("/cbs/updateComParams", async (req, res) => {
  //   try {
  //     const { comId, toUpdateObj } = req.body;
  //     const respComInfo = await findDoc(ComTable, { _id: comId });
  //     const toUpdateKeyValue = respComInfo[0].comParams;
  //     const tempToUpdateObj = Object.assign(toUpdateKeyValue, toUpdateObj);
  //     const respUpdateComInfo = await updateDocById(ComTable, comId, { comParams: tempToUpdateObj });
  //     res.json({
  //       success: true,
  //       data: respUpdateComInfo,
  //     });
  //   } catch (err) {
  //     console.error("updateComParams err:==", err);
  //     res.json({
  //       success: false,
  //       data: "updateComParams error",
  //     });
  //   }
  // });

  // /* updateComWrapperParams */
  // router.post("/cbs/updateComWrapperParams", async (req, res) => {
  //   try {
  //     const { comId, toUpdateObj } = req.body;
  //     const respComInfo = await findDoc(ComTable, { _id: comId });
  //     const toUpdateKeyValue = respComInfo[0].comWrapperParams;
  //     const tempToUpdateObj = Object.assign(toUpdateKeyValue, toUpdateObj);
  //     const respUpdateComInfo = await updateDocById(ComTable, comId, { comWrapperParams: tempToUpdateObj });
  //     res.json({
  //       success: true,
  //       data: respUpdateComInfo,
  //     });
  //   } catch (err) {
  //     console.error("updateComWrapperParams err:==", err);
  //     res.json({
  //       success: false,
  //       data: "updateComWrapperParams error",
  //     });
  //   }
  // });

  // /* updateComParamsArray */
  // router.post("/cbs/updateComParamsArray", async (req, res) => {
  //   try {
  //     const { toUpdateZIndexComsArray } = req.body;
  //     // console.log('toUpdateZIndexComsArray:==', toUpdateZIndexComsArray);
  //     const tempLength = toUpdateZIndexComsArray.length;
  //     let tick = 0;
  //     toUpdateZIndexComsArray.map((comObj) => {
  //       // console.log('comObj.comId:==', comObj.comId);
  //       // console.log('comObj.toUpdateObj:==', comObj.toUpdateObj);
  //       updateDocById(ComTable, comObj.comId, comObj.toUpdateObj)
  //         .then(() => {
  //           tick += 1;
  //           if (tick === tempLength) {
  //             res.json({
  //               success: true,
  //               data: "success",
  //             });
  //           }
  //         })
  //         .catch((err) => {
  //           console.err("updateComParamsArray error:==", err);
  //           res.json({
  //             success: false,
  //             data: "updateComParamsArray error",
  //           });
  //         });
  //     });
  //   } catch (err) {
  //     console.error("updateComParamsArray err:==", err);
  //     res.json({
  //       success: false,
  //       data: "updateComParamsArray error",
  //     });
  //   }
  // });

  // /* delOneComOnStage */
  // router.post("/cbs/delOneComOnStage", async (req, res) => {
  //   try {
  //     const { comId } = req.body;
  //     const respDeletedComInfo = await removeDocById(ComTable, comId);
  //     res.json({
  //       success: true,
  //       data: respDeletedComInfo,
  //     });
  //   } catch (err) {
  //     console.error("delOneComOnStage err:==", err);
  //     res.json({
  //       success: false,
  //       data: "delOneComOnStage error",
  //     });
  //   }
  // });

  // /* copyOneComOnStage */
  // router.post("/cbs/copyOneComOnStage", async (req, res) => {
  //   try {
  //     const { comId } = req.body;
  //     const respToCopyComInfo = await findDoc(ComTable, { _id: comId });
  //     const toCopyComObj = Object.assign({}, respToCopyComInfo[0]._doc);
  //     delete toCopyComObj._id;
  //     /* offset com position to distinct */
  //     toCopyComObj.comWrapperParams.posX += 10;
  //     toCopyComObj.comWrapperParams.posY += 10;
  //     const respCopiedComInfo = await insertDoc(ComTable, toCopyComObj);
  //     res.json({
  //       success: true,
  //       data: respCopiedComInfo,
  //     });
  //   } catch (err) {
  //     console.error("copyOneComOnStage err:==", err);
  //     res.json({
  //       success: false,
  //       data: "copyOneComOnStage error",
  //     });
  //   }
  // });
};
