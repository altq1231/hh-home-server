const nodemailer = require("nodemailer");
const moment = require("moment");
const crypto = require("crypto");
module.exports = (
  customAddress,
  sendCaptchaInfo,
  serviceEmailAddress,
  servicePass
) => {
  const tempAddres = serviceEmailAddress
    ? serviceEmailAddress
    : "2783956045@qq.com";
  const tempPass = servicePass ? servicePass : "zshfnkoxosyfdhbh";
  // 获取当前时间
  let sendTime = moment().format("YYYY-MM-DD hh:mm:ss");

  const captchaNum = crypto.randomInt(100000, 999999);

  let resultData = {
    isSend: true,
    msg: "邮件发送成功~",
    sendTime: sendTime,
    captchaNum: captchaNum,
  };
  //   console.log(captchaNum, customAddress);
  nodemailer.createTestAccount((err, account) => {
    // 填入自己的账号和密码
    let transporter = nodemailer.createTransport({
      // host: "pp.qq.com",
      service: "qq",
      port: 465,
      secure: true, // 如果是 true 则port填写465, 如果 false 则可以填写其它端口号
      secureConnection: true, // 使用了 SSL
      auth: {
        user: tempAddres, // 发件人邮箱
        pass: tempPass, // 发件人密码(用自己的...)
      },
    });
    // 填写发件人, 收件人
    let mailOptions = {
      // 发件人地址
      from: tempAddres,
      // 收件人列表, 向163邮箱, gmail邮箱, qq邮箱各发一封
      to: customAddress,
      // to: "18270893653@163.com",
      // 邮件主题
      subject: "验证码",
      // 文字内容
      text: "发送附件内容",
      // html内容
      html: "<p>验证码: &nbsp;" + captchaNum + " </p>",
      // 附件内容 是一个列表, 第一个是目录下的pack.json文件, 第二是御坂美琴的头像, 第三是作者在拍的图片的zip包
      // attachments: [{
      //     filename: 'package.json',
      //     path: path.resolve(__dirname, 'package.json')
      // }, {
      //     filename: 'bilibili.jpg',
      //     path: path.resolve(__dirname, 'bilibili.jpg')
      // }, {
      //     filename: 'room.zip',
      //     path: path.resolve(__dirname, 'room.zip')
      // }],
    };

    // 发送邮件
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        resultData.isSend = false;
        resultData.msg = "邮件发送失败，请稍后再试";
        resultData.captchaNum = null;
        sendCaptchaInfo(resultData);
        return console.log(error);
      }
      sendCaptchaInfo(resultData);
    });
  });
};
