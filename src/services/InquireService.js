const Inquire = require("../models/Inquire");

module.exports = () => {
  const addInquire = (data) => {
    console.log("InquireService => addInquire");

    return new Promise(function (resolve, reject) {
      Inquire.create(data).then(resolve).catch(reject);
    });
  };

  const fetch = (id) => {
    console.log("InquireService => fetch");

    return new Promise(function (resolve, reject) {
      let orm = Inquire.findById(id).select("-__v");
      orm.then(resolve).catch(reject);
    });
  };

  const fetchByQuery = (query) => {
    console.log("InquireService => fetchByQuery");
    return new Promise(function (resolve, reject) {
      let orm = Inquire.findOne(query).select("").sort({ _id: -1 });
      orm.then(resolve).catch(reject);
    });
  };

  const updateInquire = (InquireId, data) => {
    console.log("InquireService => updateInquire");
    return new Promise(async function (resolve, reject) {
      await Inquire.findByIdAndUpdate({ _id: InquireId }, data)
        .then(resolve)
        .catch(reject);
    });
  };

  const fetchByQueryToEdit = (query) => {
    console.log("InquireService => fetchByQuery");
    return new Promise(function (resolve, reject) {
      let orm = Inquire.findOne(query).select("");

      orm.then(resolve).catch(reject);
    });
  };

  const getInquire = (query, page, limit) => {
    if (page) {
      page -= 1;
    }

    return new Promise(function (resolve, reject) {
      let orm = Inquire.find(query)
        .select(" -__v")
        .sort({ _id: -1 })
        .skip(page * limit)
        .limit(limit);
      orm.then(resolve).catch(reject);
    });
  };

  const countInquire = (query) => {
    return new Promise(function (resolve, reject) {
      let orm = Inquire.countDocuments(query);
      orm.then(resolve).catch(reject);
    });
  };

  const deleteInquire = (id) => {
    return new Promise(function (resolve, reject) {
      let orm = Inquire.deleteOne({ _id: id });
      orm.then(resolve).catch(reject);
    });
  };

  return {
    addInquire,
    fetch,
    fetchByQuery,
    fetchByQueryToEdit,
    updateInquire,
    getInquire,
    countInquire,
    deleteInquire,
  };
};
