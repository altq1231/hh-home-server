// 封装响应结果

class Result {
  constructor(data, msg = "操作成功", options) {
    this.data = null;
    this.state = true;
    if (arguments.length === 0) {
      this.msg = "操作成功";
    } else if (arguments.length === 1) {
      this.msg = data;
    } else {
      this.data = data;
      this.msg = msg;
      if (options) {
        this.options = options;
      }
    }
  }

  createResult() {
    let base = {
      state: this.state,
      msg: this.msg,
    };
    if (this.data) {
      base.data = this.data;
    }
    if (this.options) {
      base = { ...base, ...this.options };
    }
    return base;
  }

  json(res) {
    res.send(this.createResult());
  }

  success(res) {
    this.state = true;
    this.json(res);
  }

  fail(res) {
    this.state = false;
    this.json(res);
  }

  expired(res) {
    this.state = false;
    this.json(res);
  }
}
module.exports = Result;
