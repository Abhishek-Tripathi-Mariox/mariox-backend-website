const Cities = require("../models/ServicesPage");

module.exports = () => {
  const addCities = (data) => {
    return new Promise(function (resolve, reject) {
      Cities.create(data).then(resolve).catch(reject);
    });
  };

  const fetch = (id) => {
    return new Promise(function (resolve, reject) {
      let orm = Cities.findById(id).select("-__v");
      orm.then(resolve).catch(reject);
    });
  };

  const fetchByQuery = (query) => {
    console.log("CitiesService => fetchByQuery");
    return new Promise(function (resolve, reject) {
      let orm = Cities.findOne(query).select("").sort({ _id: -1 });
      orm.then(resolve).catch(reject);
    });
  };

  const updateCities = (CitiesId, data) => {
    console.log("CitiesService => updateCities");
    return new Promise(async function (resolve, reject) {
      await Cities.findByIdAndUpdate({ _id: CitiesId }, data)
        .then(resolve)
        .catch(reject);
    });
  };

  const fetchByQueryToEdit = (query) => {
    console.log("CitiesService => fetchByQuery");
    return new Promise(function (resolve, reject) {
      let orm = Cities.findOne(query).select("");

      orm.then(resolve).catch(reject);
    });
  };

  const getCities = (query, page, limit) => {
    if (page) {
      page -= 1;
    }
    return new Promise(function (resolve, reject) {
      let orm = Cities.find(query)
        .select(" -__v")
        .sort({ rank: 1 })
        .skip(page * limit)
        .limit(limit);
      orm.then(resolve).catch(reject);
    });
  };

  const countCities = (query) => {
    return new Promise(function (resolve, reject) {
      let orm = Cities.countDocuments(query);
      orm.then(resolve).catch(reject);
    });
  };

  const deleteCities = (id) => {
    return new Promise(function (resolve, reject) {
      let orm = Cities.deleteOne({ _id: id });
      orm.then(resolve).catch(reject);
    });
  };

  return {
    addCities,
    fetch,
    fetchByQuery,
    fetchByQueryToEdit,
    updateCities,
    getCities,
    countCities,
    deleteCities,
  };
};
