const Services = require("../models/ServicesPage");

module.exports = () => {
  const addServices = (data) => {
    return new Promise(function (resolve, reject) {
      Services.create(data).then(resolve).catch(reject);
    });
  };

  const fetch = (id) => {
    return new Promise(function (resolve, reject) {
      let orm = Services.findById(id).select("-__v");
      orm.then(resolve).catch(reject);
    });
  };

  const fetchByQuery = (query) => {
    console.log("ServicesService => fetchByQuery");
    return new Promise(function (resolve, reject) {
      let orm = Services.findOne(query)
        .select(
          "-seoAMeta -seoBMeta -seoCMeta -seoZMeta -h1AText -h1BText -h1CText -h1ZText -h2AText -h2BText -h2CText -h2ZText -h1ADesc -h1BDesc -h1CDesc -h1ZDesc -aboutAService -aboutBService -aboutCService -aboutZService -isTopService -__v -_id"
        )
        .sort({ _id: -1 });
      orm.then(resolve).catch(reject);
    });
  };

  const fetchByQueryFAQs = async (query) => {
    console.log("ServicesService => fetchByQueryFAQs");

    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: "faqServiceIndividual",
          localField: "_id",
          foreignField: "serviceId",
          as: "individualFaqs",
        },
      },
      {
        $lookup: {
          from: "faqServiceMaster",
          let: { serviceId: "$_id" },
          pipeline: [
            { $match: { $expr: { $in: ["$$serviceId", "$serviceIds"] } } },
            { $project: { faqs: 1, _id: 0 } },
          ],
          as: "masterFaqs",
        },
      },
      {
        $lookup: {
          from: "cities",
          pipeline: [
            { $match: { status: true, isTopCity: true } },
            { $project: { pageName: 1, slug: 1, _id: 0 } },
            { $limit: 5 }, // ✅ Only top 5 cities
          ],
          as: "topCities",
        },
      },
      {
        $lookup: {
          from: "servicePages",
          pipeline: [
            { $match: { status: true, isTopService: true } },
            { $project: { pageName: 1, slug: 1, _id: 0 } },
            // { $limit: 5 }, // ✅ Only top 5 cities
          ],
          as: "topServices",
        },
      },
      {
        $lookup: {
          from: "serviceimages",
          localField: "_id",
          foreignField: "serviceId",
          as: "images",
          pipeline: [{ $project: { image: 1, title: 1, content: 1 } }],
        },
      },
      {
        $project: {
          pageName: 1,
          slug: 1,
          seoMeta: 1,
          h1Desc: 1,
          h1Text: 1,
          h2Text: 1,
          aboutService: 1,
          topCities: 1,
          topServices: 1,
          images: 1,
          allFaqs: {
            $concatArrays: [
              { $ifNull: [{ $arrayElemAt: ["$masterFaqs.faqs", 0] }, []] },
              { $ifNull: ["$individualFaqs.faqs", []] },
            ],
          },
        },
      },
    ];

    const result = await Services.aggregate(pipeline);
    const service = result[0];

    if (!service) {
      console.warn("⚠️ No service matched the query:", query);
      return null;
    }

    const allFaqs = Array.isArray(service.allFaqs) ? service.allFaqs : [];

    const shuffledFaqs = allFaqs.sort(() => 0.5 - Math.random()).slice(0, 10);

    const flatFaqs = shuffledFaqs.flat().slice(0, 12);

    service.faqs = flatFaqs.map((faq) => ({
      question: faq.question.replace(/{{service}}/g, service.pageName),
      answer: faq.answer.replace(/{{service}}/g, service.pageName),
    }));

    service.topCities = (service.topCities || []).map((city) => ({
      pageName: `${service.pageName} in ${city.pageName}`,
      slug: `${service.slug}-in-${city.slug}`,
    }));

    delete service.allFaqs;
    return service;
  };

  const updateServices = (ServicesId, data) => {
    console.log("ServicesService => updateServices");
    return new Promise(async function (resolve, reject) {
      await Services.findByIdAndUpdate({ _id: ServicesId }, data)
        .then(resolve)
        .catch(reject);
    });
  };

  const fetchByQueryToEdit = (query) => {
    console.log("ServicesService => fetchByQuery");
    return new Promise(function (resolve, reject) {
      let orm = Services.findOne(query).select("");

      orm.then(resolve).catch(reject);
    });
  };

  const getServices = (query, page, limit) => {
    if (page) {
      page -= 1;
    }
    return new Promise(function (resolve, reject) {
      let orm = Services.find(query)
        .select(" -__v")
        .sort({ rank: 1 })
        .skip(page * limit)
        .limit(limit);
      orm.then(resolve).catch(reject);
    });
  };

  const countServices = (query) => {
    return new Promise(function (resolve, reject) {
      let orm = Services.countDocuments(query);
      orm.then(resolve).catch(reject);
    });
  };

  const deleteServices = (id) => {
    return new Promise(function (resolve, reject) {
      let orm = Services.deleteOne({ _id: id });
      orm.then(resolve).catch(reject);
    });
  };

  return {
    addServices,
    fetch,
    fetchByQuery,
    fetchByQueryToEdit,
    updateServices,
    getServices,
    countServices,
    deleteServices,
    fetchByQueryFAQs,
  };
};
