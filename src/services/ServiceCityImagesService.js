const ServiceCityImages = require("../models/ServiceCityImages");

module.exports = () => {
  const addServiceCityImages = (data) => {
    return new Promise(function (resolve, reject) {
      ServiceCityImages.create(data).then(resolve).catch(reject);
    });
  };

  const fetch = (id) => {
    return new Promise(function (resolve, reject) {
      let orm = ServiceCityImages.findById(id).select("-__v");
      orm.then(resolve).catch(reject);
    });
  };

  const fetchByQuery = (query) => {
    console.log("ServiceCityImagesService => fetchByQuery");
    return new Promise(function (resolve, reject) {
      let orm = ServiceCityImages.findOne(query).select("").sort({ _id: -1 });
      orm.then(resolve).catch(reject);
    });
  };

  const updateServiceCityImages = (ServiceCityImagesId, data) => {
    console.log("ServiceCityImagesService => updateServiceCityImages");
    return new Promise(async function (resolve, reject) {
      await ServiceCityImages.findByIdAndUpdate(
        { _id: ServiceCityImagesId },
        data
      )
        .then(resolve)
        .catch(reject);
    });
  };

  const fetchByQueryToEdit = (query) => {
    console.log("ServiceCityImagesService => fetchByQuery");
    return new Promise(function (resolve, reject) {
      let orm = ServiceCityImages.findOne(query).select("");

      orm.then(resolve).catch(reject);
    });
  };

  const getServiceCityImages = (query, page, limit) => {
    if (page) {
      page -= 1;
    }
    return new Promise(function (resolve, reject) {
      let orm = ServiceCityImages.find(query)
        .select("image title content")
        .sort({ rank: 1 })
        .skip(page * limit)
        .limit(limit);
      orm.then(resolve).catch(reject);
    });
  };

  const countServiceCityImages = (query) => {
    return new Promise(function (resolve, reject) {
      let orm = ServiceCityImages.countDocuments(query);
      orm.then(resolve).catch(reject);
    });
  };

  const deleteServiceCityImages = (id) => {
    return new Promise(function (resolve, reject) {
      let orm = ServiceCityImages.deleteOne({ _id: id });
      orm.then(resolve).catch(reject);
    });
  };

  return {
    addServiceCityImages,
    fetch,
    fetchByQuery,
    fetchByQueryToEdit,
    updateServiceCityImages,
    getServiceCityImages,
    countServiceCityImages,
    deleteServiceCityImages,
  };
};
