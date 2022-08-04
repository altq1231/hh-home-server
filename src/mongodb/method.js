module.exports = {
  /**
   * 在集合(表)中插入一条新数据(文档)
   * @param {已经实例化的表(名)} Table required
   * @param {需要插入的数据, json格式} jsonData required
   */
  insertDoc: (Table, jsonData) =>
    new Promise((resolve, reject) => {
      new Table(jsonData).save((err, doc) => {
        if (err) {
          reject(err);
        } else {
          resolve(doc);
        }
      });
    }),
  // insertMany
  insertMany: (Table, objArray) =>
    new Promise((resolve, reject) => {
      Table.insertMany(objArray, (err, doc) => {
        if (err) {
          reject(err);
        } else {
          resolve(doc);
        }
      });
    }),
  /**
   * 简单查询，基于简单的json格式条件, 如不传入条件，则查询出所有
   * @param {已经实例化的表(名)} Table required
   * @param {查询条件json格式} jsonData
   */
  findDoc: (Table, matchCondition) =>
    new Promise((resolve, reject) => {
      Table.find(matchCondition).exec((err, resp) => {
        if (err) {
          reject(err);
        } else {
          resolve(resp);
        }
      });
    }),
  /**
   * 简单查询，基于简单的json格式条件
   * @param {已经实例化的表(名)} Table required
   * @param {查询条件-id} _id
   * @param {待更新数据json格式} updateData
   */
  updateDocById: (Table, id, updateData) =>
    new Promise((resolve, reject) => {
      Table.findByIdAndUpdate(id, updateData, {
        new: true, // return the updated doc
      }).exec((err, resp) => {
        if (err) {
          reject(err);
        } else {
          resolve(resp);
        }
      });
    }),
  /**
   * 更新条件更新
   * @param {已经实例化的表(名)} Table required
   * @param {查询条件} keys
   * @param {待更新数据json格式} updateData
   */
  updateDocOne: (Table, keys, updateData) =>
    new Promise((resolve, reject) => {
      Table.updateOne(keys, { $set: updateData }).exec((err, resp) => {
        if (err) {
          reject(err);
        } else {
          resolve(resp);
        }
      });
    }),
  /**
   * 简单查询，基于简单的json格式条件
   * @param {已经实例化的表(名)} Table required
   * @param {查询条件-id} _id
   * @param {待更新数据json格式} jsonData
   */
  removeDocById: (Table, id) =>
    new Promise((resolve, reject) => {
      Table.findByIdAndRemove(id).exec((err, resp) => {
        if (err) {
          reject(err);
        } else {
          resolve(resp);
        }
      });
    }),

  removeManyByCondition: (Table, matchCondition) =>
    new Promise((resolve, reject) => {
      Table.deleteMany(matchCondition).exec((err) => {
        if (err) {
          reject(err);
        } else {
          resolve("success");
        }
      });
    }),
};
