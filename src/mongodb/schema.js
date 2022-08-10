/** Schema类型 可以如下首字母大写 或者单引号全部小写
String      字符串
Number      数字
Date        日期
Buffer      二进制
Boolean     布尔值
Mixed       混合类型
ObjectId    对象ID
Array       数组
 */
const mongoose = require("mongoose");

const { Schema } = mongoose;

module.exports = {
  NormalUserSchema: new Schema({
    userName: String,
    userPwd: String,
    userDesc: String,
    isAdmin: Boolean,
    email: String,
  }),
  CaptchaSchema: new Schema({
    userName: String,
    email: String,
    code: Number,
    effectiveTime: String,
    failureTime: String,
  }),
  CityCodeSchema: new Schema({
    cityName: String,
    cityCode: String,
    adCode: String,
  }),
  OperationRecordSchema: new Schema({
    userId: String,
    operationDate: Date,
    manageType: "shop" | "video" | "music",
    operationType: "add" | "delete" | "update",
    operationObj: String,
  }),
  DataSourceSchema: new Schema({
    name: String,
    type: String,
    ip: String,
    port: String,
    userName: String,
    pwd: String,
    targetDb: String,
  }),
  QuotaSchema: new Schema({
    name: String,
    minutes: String,
    seconds: String,
    quotaDataSource: String,
    apiOrSqlString: String,
    apiOrSqlOrStaticResultData: Schema.Types.Mixed,
  }),
  ScreenSchema: new Schema({
    name: String,
    resolutionX: Number,
    resolutionY: Number,
    createTime: Date,
    belongTo: String,
    isTemplate: Boolean,
  }),
  // AdminUserSchema: new Schema({
  //   adminName: String,
  //   adminPwd: String,
  // }),
  ComSchema: new Schema({
    name: String,
    type: String,
    chnName: String,
    comParams: Schema.Types.Mixed,
    comWrapperParams: Schema.Types.Mixed,
    configItems: Schema.Types.Mixed,
    belongTo: String,
    comPathPrefix: String,
    imgOrVideoName: String,
  }),
};
