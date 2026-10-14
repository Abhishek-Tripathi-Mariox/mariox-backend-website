const ServiceCityCompany = require("../models/ServiceCityCompany");
const mongoose = require("mongoose");

module.exports = () => {
  function replaceCompanyName(input, companyName) {
    if (!input) return input;

    // Skip ObjectId
    if (input instanceof mongoose.Types.ObjectId) {
      return input;
    }

    if (typeof input === "string") {
      return input
        .replaceAll("{{company_name}}", companyName)
        .replaceAll("{{CompanyName}}", companyName)
        .replaceAll("{{COMPANY_NAME}}", companyName.toUpperCase());
    }

    if (Array.isArray(input)) {
      return input.map((item) => replaceCompanyName(item, companyName));
    }

    if (typeof input === "object") {
      const updated = {};
      for (const key in input) {
        updated[key] = replaceCompanyName(input[key], companyName);
      }
      return updated;
    }

    return input;
  }

  function deepReplaceCity(input, city) {
    if (!input) return input;

    // 🎯 Skip Mongo ObjectId (very important)
    if (input instanceof mongoose.Types.ObjectId) {
      return input;
    }

    // Format city versions
    const cityLower = city.toLowerCase();
    const cityTitle = cityLower.charAt(0).toUpperCase() + cityLower.slice(1);

    // If string → do text replacement
    if (typeof input === "string") {
      return input
        .replaceAll("{{city}}", cityLower)
        .replaceAll("{city}", cityLower)
        .replaceAll("{{City}}", cityTitle)
        .replaceAll("{City}", cityTitle)
        .replaceAll("{{CITY}}", city.toUpperCase())
        .replaceAll("{CITY}", city.toUpperCase());
    }

    // If array → recursively process each item
    if (Array.isArray(input)) {
      return input.map((item) => deepReplaceCity(item, city));
    }

    // If object → recursively process each key
    if (typeof input === "object") {
      const updated = {};
      for (const key in input) {
        updated[key] = deepReplaceCity(input[key], city);
      }
      return updated;
    }

    return input;
  }

  const addServiceCityCompany = (data) => {
    return new Promise(function (resolve, reject) {
      ServiceCityCompany.create(data).then(resolve).catch(reject);
    });
  };

  const fetch = (id) => {
    return new Promise(function (resolve, reject) {
      let orm = ServiceCityCompany.findById(id).select("-__v");
      orm.then(resolve).catch(reject);
    });
  };

  // const fetchByQuery = (query) => {
  //   console.log("ServiceCityCompanyService => fetchByQuery");
  //   return new Promise(function (resolve, reject) {
  //     let orm = ServiceCityCompany.findOne(query);
  //     orm.then(resolve).catch(reject);
  //   });
  // };

  const fetchByQuery = async (query) => {
    console.log("ServiceCityCompanyService => fetchByQuery");

    const result = await ServiceCityCompany.findOne(query).lean();

    if (!result) return null;

    // If no city, return raw
    if (!result.city) return result;

    // 🔥 Apply replacement everywhere in the object
    const updated = deepReplaceCity(result, result.city);

    // 🔥 Replace {{company_name}} per company
    if (Array.isArray(updated.companies)) {
      updated.companies = updated.companies.map((company) => {
        return replaceCompanyName(company, company.name);
      });
    }

    return updated;
  };

  const updateServiceCityCompany = (ServiceCityCompanyId, data) => {
    console.log("ServiceCityCompanyService => updateServiceCityCompany");
    return new Promise(async function (resolve, reject) {
      await ServiceCityCompany.findByIdAndUpdate(
        { _id: ServiceCityCompanyId },
        data
      )
        .then(resolve)
        .catch(reject);
    });
  };

  const fetchByQueryToEdit = (query) => {
    console.log("ServiceCityCompanyService => fetchByQuery");
    return new Promise(function (resolve, reject) {
      let orm = ServiceCityCompany.findOne(query).select("");

      orm.then(resolve).catch(reject);
    });
  };

  const getServiceCityCompany = (query, page, limit) => {
    if (page) {
      page -= 1;
    }
    return new Promise(function (resolve, reject) {
      let orm = ServiceCityCompany.find(query)
        .select("image title content")
        .sort({ rank: 1 })
        .skip(page * limit)
        .limit(limit);
      orm.then(resolve).catch(reject);
    });
  };

  const countServiceCityCompany = (query) => {
    return new Promise(function (resolve, reject) {
      let orm = ServiceCityCompany.countDocuments(query);
      orm.then(resolve).catch(reject);
    });
  };

  const deleteServiceCityCompany = (id) => {
    return new Promise(function (resolve, reject) {
      let orm = ServiceCityCompany.deleteOne({ _id: id });
      orm.then(resolve).catch(reject);
    });
  };

  return {
    addServiceCityCompany,
    fetch,
    fetchByQuery,
    fetchByQueryToEdit,
    updateServiceCityCompany,
    getServiceCityCompany,
    countServiceCityCompany,
    deleteServiceCityCompany,
  };
};
