const ServiceImages = require("../models/ServiceImages");

module.exports = () => {
  const addServiceImages = (data) => {
    return new Promise(function (resolve, reject) {
      ServiceImages.create(data).then(resolve).catch(reject);
    });
  };

  const fetch = (id) => {
    return new Promise(function (resolve, reject) {
      let orm = ServiceImages.findById(id).select("-__v");
      orm.then(resolve).catch(reject);
    });
  };

  const fetchByQuery = (query) => {
    console.log("ServiceImagesService => fetchByQuery");
    return new Promise(function (resolve, reject) {
      let orm = ServiceImages.findOne(query).select("").sort({ _id: -1 });
      orm.then(resolve).catch(reject);
    });
  };

  const updateServiceImages = (ServiceImagesId, data) => {
    console.log("ServiceImagesService => updateServiceImages");
    return new Promise(async function (resolve, reject) {
      await ServiceImages.findByIdAndUpdate({ _id: ServiceImagesId }, data)
        .then(resolve)
        .catch(reject);
    });
  };

  const fetchByQueryToEdit = (query) => {
    console.log("ServiceImagesService => fetchByQuery");
    return new Promise(function (resolve, reject) {
      let orm = ServiceImages.findOne(query).select("");

      orm.then(resolve).catch(reject);
    });
  };

  const getServiceImages = (query, page, limit) => {
    if (page) {
      page -= 1;
    }
    return new Promise(function (resolve, reject) {
      let orm = ServiceImages.find(query)
        .select("image title content")
        .sort({ rank: 1 })
        .skip(page * limit)
        .limit(limit);
      orm.then(resolve).catch(reject);
    });
  };

  const countServiceImages = (query) => {
    return new Promise(function (resolve, reject) {
      let orm = ServiceImages.countDocuments(query);
      orm.then(resolve).catch(reject);
    });
  };

  const deleteServiceImages = (id) => {
    return new Promise(function (resolve, reject) {
      let orm = ServiceImages.deleteOne({ _id: id });
      orm.then(resolve).catch(reject);
    });
  };

  return {
    addServiceImages,
    fetch,
    fetchByQuery,
    fetchByQueryToEdit,
    updateServiceImages,
    getServiceImages,
    countServiceImages,
    deleteServiceImages,
  };
};
