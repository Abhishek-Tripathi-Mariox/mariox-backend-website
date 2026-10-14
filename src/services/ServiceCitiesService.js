const ServiceCities = require("../models/ServicesCities");

module.exports = () => {
  const replaceCityPlaceholders = (input, cityName) => {
    if (!input) return input;

    if (typeof input === "string") {
      return input.replace(/{{city}}/g, cityName);
    }

    if (Array.isArray(input)) {
      return input.map((item) => replaceCityPlaceholders(item, cityName));
    }

    if (typeof input === "object") {
      const replaced = {};
      for (const key in input) {
        replaced[key] = replaceCityPlaceholders(input[key], cityName);
      }
      return replaced;
    }

    return input;
  };

  function convertH2ToSpan(html) {
    if (!html) return html;
    // Replace opening <h2 ...> with <span>
    let converted = html.replace(/<h2[^>]*>/gi, "<span>");
    // Replace closing </h2> with </span>
    converted = converted.replace(/<\/h2>/gi, "</span>");
    return converted;
  }

  const fetch = (id) => {
    return new Promise(function (resolve, reject) {
      let orm = ServiceCities.findById(id).select("-__v");
      orm.then(resolve).catch(reject);
    });
  };

  const fetchByQuery = (query) => {
    console.log("ServiceCitiesService => fetchByQuery");
    return new Promise(function (resolve, reject) {
      let orm = ServiceCities.findOne(query).select("").sort({ _id: -1 });
      orm.then(resolve).catch(reject);
    });
  };

  const fetchByQueryFAQs = async (query) => {
    console.log("ServiceCitiesService => fetchByQuery");

    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: "faqServiceCityIndividual",
          localField: "_id",
          foreignField: "serviceCityId",
          as: "individualFaqs",
        },
      },
      {
        $lookup: {
          from: "cities",
          pipeline: [
            { $match: { status: true, isTopCity: true } },
            { $project: { pageName: 1, slug: 1, _id: 0 } },
            { $limit: 5 },
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
          ],
          as: "topServices",
        },
      },
      {
        $lookup: {
          from: "servicePages",
          localField: "specializationId",
          foreignField: "_id",
          as: "mainService",
        },
      },
      {
        $lookup: {
          from: "specializationcityfaqs",
          let: { masterId: { $arrayElemAt: ["$mainService._id", 0] } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$specializationId", "$$masterId"] },
                    { $eq: ["$status", true] },
                  ],
                },
              },
            },
            { $project: { question: 1, answer: 1, _id: 0 } },
          ],
          as: "masterFaqs",
        },
      },
      {
        $lookup: {
          from: "servicecityimages",
          localField: "specializationId",
          foreignField: "serviceId",
          as: "images",
          pipeline: [
            { $sample: { size: 5 } },
            { $project: { image: 1, title: 1, content: 1, _id: 0 } },
          ],
        },
      },
    ];

    const result = await ServiceCities.aggregate(pipeline);
    const service = result[0];
    if (!service) return null;

    const matchedServicePage = service.mainService?.[0];
    const cityName = service.cityName.toLowerCase();

    // ------------------------
    // Dynamic Field Resolver
    // ------------------------

    const resolveDynamicField = (keyName, fallbackKey) => {
      const fieldName = service[keyName]; // e.g., h1BText
      return matchedServicePage?.[fieldName] || service[fallbackKey] || "";
    };

    const resolveSeoMeta = () => {
      const key = service.seoMetaName; // e.g. "seoCMeta"
      const seo = matchedServicePage?.[key] || {};

      return {
        title: replaceCityPlaceholders(
          seo.title || service.seoMeta?.title || "",
          cityName,
        ),
        description: replaceCityPlaceholders(
          seo.description || service.seoMeta?.description || "",
          cityName,
        ),
        keyword: Array.isArray(seo.keywords)
          ? replaceCityPlaceholders(seo.keywords[0] || "", cityName)
          : service.seoMeta?.keyword || "",
        robots: Array.isArray(seo.robots) ? seo.robots[0] : "",
      };
    };

    const replaceCityPlaceholders = (input, city) => {
      if (!input) return input;

      if (typeof input === "string") {
        return input
          .replaceAll("{{city}}", city)
          .replaceAll("{city}", city)
          .replaceAll(`{${city}}`, city)
          .replaceAll(`{{${city}}}`, city);

        // return input.replace(/{{city}}/g, cityName);
      }

      if (Array.isArray(input)) {
        return input.map((item) => replaceCityPlaceholders(item, city));
      }

      if (typeof input === "object") {
        const replaced = {};
        for (const key in input) {
          replaced[key] = replaceCityPlaceholders(input[key], city);
        }
        return replaced;
      }

      return input;
    };

    // ------------------------
    // Replace dynamic content
    // ------------------------
    service.h1Text = replaceCityPlaceholders(
      resolveDynamicField("h1Name", "h1Text"),
      cityName,
    );
    service.h2Text = replaceCityPlaceholders(
      resolveDynamicField("h2Name", "h2Text"),
      cityName,
    );
    service.h1Desc = replaceCityPlaceholders(
      resolveDynamicField("h1DescName", "h1Desc", "Desc"),
      cityName,
    );
    service.h2Desc = replaceCityPlaceholders(
      resolveDynamicField("h2DescName", "h2Desc", "Desc"),
      cityName,
    );
    // service.aboutService = replaceCityPlaceholders(
    //   resolveDynamicField("aboutName", "aboutService", "Service"),
    //   cityName
    // );

    /*
    Old */
    // service.aboutService = convertH2ToSpan(
    //   replaceCityPlaceholders(
    //     resolveDynamicField("aboutName", "aboutService", "Service"),
    //     cityName
    //   )
    // );

    // ------------------------
    // NEW ABOUT-SERVICE 1 to 6 LOGIC
    // ------------------------

    let aboutParts = [];

    // Check if aboutService1 exists (meaning new system applies)
    if (service.aboutService1) {
      for (let i = 1; i <= 6; i++) {
        const keyName = service[`aboutService${i}`]; // e.g. "aboutZService3"
        if (!keyName) continue; // skip empty

        const partHtml = matchedServicePage?.[keyName] || ""; // pull from main service

        if (partHtml && partHtml.trim() !== "") {
          aboutParts.push(
            convertH2ToSpan(replaceCityPlaceholders(partHtml, cityName)),
          );
        }
      }
    }

    // console.log("aboutParts=>>", aboutParts);
    if (service.aboutName && service.aboutName.length > 15) {
      // service.aboutService = service.aboutName;

      const dynamicField = service.aboutName; // e.g., "aboutDentalImplants"

      // console.log("dynamicField=>>", dynamicField);
      aboutText = dynamicField || "";

      service.aboutService = convertH2ToSpan(
        replaceCityPlaceholders(aboutText, cityName),
      );
    }
    // If we successfully got parts, join them as final about content
    else if (aboutParts && aboutParts.length > 0) {
      service.aboutService = aboutParts.join("\n\n");
    } else {
      // 🔥 Fallback to old aboutName logic
      service.aboutService = convertH2ToSpan(
        replaceCityPlaceholders(
          resolveDynamicField("aboutName", "aboutService", "Service"),
          cityName,
        ),
      );
    }

    if (
      !service.aboutService ||
      service.aboutService.trim() == "" ||
      service.aboutService == ""
    ) {
      // aboutText = service.aboutService;
      const dynamicField = service.aboutName; // e.g., "aboutDentalImplants"

      // console.log("dynamicField=>>", dynamicField);
      aboutText = dynamicField || "";

      service.aboutService = convertH2ToSpan(
        replaceCityPlaceholders(aboutText, cityName),
      );
    }

    /**
     * Images
     */
    // service.images = (service.images || []).map((img) => ({
    //   image: img.image,
    //   title: replaceCityPlaceholders(img.title, cityName),
    //   content: replaceCityPlaceholders(img.content, cityName),
    // }));

    // // Repurpose first image's title/content into h1 and h2Desc fields
    // if (service.images && service.images.length > 0) {
    //   service.images[0].title = `<h2>${service.images[0].title}</h2>`;
    //   // service.images[0].content = service.images[0].content;
    // }

    // service.seoMeta = replaceCityPlaceholders(resolveSeoMeta(), cityName);
    const meta = resolveSeoMeta();
    service.seoMeta = {
      title: meta.title,
      description: meta.description,
      keyword: meta.keyword,
      robots: meta.robots, // optional
    };

    // ------------------------
    // Clean up dynamic keys
    // ------------------------
    delete service.h1Name;
    delete service.h2Name;
    delete service.h1DescName;
    delete service.h2DescName;
    delete service.aboutName;
    delete service.seoMetaName;
    delete service.mainService;

    // ------------------------
    // FAQs
    // ------------------------
    const allFaqs = [
      ...(service.masterFaqs || []),
      ...(service.individualFaqs?.[0]?.faqs || []),
    ];
    const shuffledFaqs = allFaqs.sort(() => 0.5 - Math.random()).slice(0, 12);

    const [basePageName] = service.pageName?.split(" in ") || [];
    const [baseSlug] = service.slug?.split("-in-") || [];

    service.faqs = shuffledFaqs.map((faq) => ({
      question: faq.question
        ?.replace(/{{service}}/g, basePageName)
        ?.replace(/{{city}}/g, cityName)
        ?.replace(/{service}/g, basePageName)
        ?.replace(/{city}/g, cityName),
      answer: faq.answer
        ?.replace(/{{service}}/g, basePageName)
        ?.replace(/{{city}}/g, cityName)
        ?.replace(/{service}/g, basePageName)
        ?.replace(/{city}/g, cityName),
    }));

    // ------------------------
    // Top Cities
    // ------------------------
    const currentCitySlug = service.slug?.split("-in-")[1];
    service.topCities = (service.topCities || [])
      .filter(
        (city) => city.slug?.toLowerCase() !== currentCitySlug?.toLowerCase(),
      )
      .map((city) => ({
        pageName: `${basePageName} in ${city.pageName}`,
        slug: `${baseSlug}-in-${city.slug}`,
      }));

    // ------------------------
    // Replace city in image content
    // ------------------------
    service.images = (service.images || []).map((img) => ({
      image: img.image,
      title: replaceCityPlaceholders(img.title, cityName),
      content: replaceCityPlaceholders(img.content, cityName),
    }));

    return service;
  };

  // const fetchByQueryFAQs = async (query) => {
  //   console.log("ServiceCitiesService => fetchByQuery");

  //   const pipeline = [
  //     { $match: query },
  //     {
  //       $lookup: {
  //         from: "faqServiceCityIndividual",
  //         localField: "_id",
  //         foreignField: "serviceCityId",
  //         as: "individualFaqs",
  //       },
  //     },
  //     {
  //       $lookup: {
  //         from: "cities",
  //         pipeline: [
  //           { $match: { status: true, isTopCity: true } },
  //           { $project: { pageName: 1, slug: 1, _id: 0 } },
  //           { $limit: 5 },
  //         ],
  //         as: "topCities",
  //       },
  //     },
  //     {
  //       $lookup: {
  //         from: "servicePages",
  //         pipeline: [
  //           { $match: { status: true, isTopService: true } },
  //           { $project: { pageName: 1, slug: 1, _id: 0 } },
  //         ],
  //         as: "topServices",
  //       },
  //     },
  //     // {
  //     //   $lookup: {
  //     //     from: "servicePages",
  //     //     let: { serviceSlug: "$serviceSlug" },
  //     //     pipeline: [
  //     //       { $match: { $expr: { $eq: ["$slug", "$$serviceSlug"] } } },
  //     //       // { $project: { _id: 0 } }, // Include everything from servicePages
  //     //     ],
  //     //     as: "mainService",
  //     //   },
  //     // },
  //     {
  //       $lookup: {
  //         from: "servicePages",
  //         localField: "specializationId",
  //         foreignField: "_id",
  //         as: "mainService",
  //       },
  //     },
  //     {
  //       $addFields: {
  //         h1Text: {
  //           $let: {
  //             vars: {
  //               raw: {
  //                 $ifNull: [
  //                   {
  //                     $getField: {
  //                       input: { $arrayElemAt: ["$mainService", 0] },
  //                       field: { $concat: ["h1", "$h1Name"] }, // e.g., h1ZText
  //                     },
  //                   },
  //                   "",
  //                 ],
  //               },
  //             },
  //             in: {
  //               $replaceAll: {
  //                 input: "$$raw",
  //                 find: "{city}",
  //                 replacement: "$cityName",
  //               },
  //             },
  //           },
  //         },
  //         h2Text: {
  //           $let: {
  //             vars: {
  //               raw: {
  //                 $ifNull: [
  //                   {
  //                     $getField: {
  //                       input: { $arrayElemAt: ["$mainService", 0] },
  //                       field: { $concat: ["h2", "$h2Name"] }, // e.g., h2AText
  //                     },
  //                   },
  //                   "",
  //                 ],
  //               },
  //             },
  //             in: {
  //               $replaceAll: {
  //                 input: "$$raw",
  //                 find: "{city}",
  //                 replacement: "$cityName",
  //               },
  //             },
  //           },
  //         },
  //         h1Desc: {
  //           $let: {
  //             vars: {
  //               raw: {
  //                 $ifNull: [
  //                   {
  //                     $getField: {
  //                       input: { $arrayElemAt: ["$mainService", 0] },
  //                       field: { $concat: ["h1", "$h1DescName", "Desc"] }, // e.g., h1ADesc
  //                     },
  //                   },
  //                   "",
  //                 ],
  //               },
  //             },
  //             in: {
  //               $replaceAll: {
  //                 input: "$$raw",
  //                 find: "{city}",
  //                 replacement: "$cityName",
  //               },
  //             },
  //           },
  //         },
  //         h2Desc: {
  //           $let: {
  //             vars: {
  //               raw: {
  //                 $ifNull: [
  //                   {
  //                     $getField: {
  //                       input: { $arrayElemAt: ["$mainService", 0] },
  //                       field: { $concat: ["h2", "$h2DescName", "Desc"] }, // e.g., h2BDesc
  //                     },
  //                   },
  //                   "",
  //                 ],
  //               },
  //             },
  //             in: {
  //               $replaceAll: {
  //                 input: "$$raw",
  //                 find: "{city}",
  //                 replacement: "$cityName",
  //               },
  //             },
  //           },
  //         },
  //         aboutService: {
  //           $let: {
  //             vars: {
  //               raw: {
  //                 $ifNull: [
  //                   {
  //                     $getField: {
  //                       input: { $arrayElemAt: ["$mainService", 0] },
  //                       field: { $concat: ["about", "$aboutName", "Service"] }, // e.g., aboutCService
  //                     },
  //                   },
  //                   "",
  //                 ],
  //               },
  //             },
  //             in: {
  //               $replaceAll: {
  //                 input: "$$raw",
  //                 find: "{city}",
  //                 replacement: "$cityName",
  //               },
  //             },
  //           },
  //         },
  //         seoMeta: {
  //           $let: {
  //             vars: {
  //               raw: {
  //                 $ifNull: [
  //                   {
  //                     $getField: {
  //                       input: { $arrayElemAt: ["$mainService", 0] },
  //                       field: { $concat: ["seo", "$seoMetaName", "Meta"] }, // e.g., seoDMeta
  //                     },
  //                   },
  //                   {},
  //                 ],
  //               },
  //             },
  //             in: {
  //               title: {
  //                 $replaceAll: {
  //                   input: { $ifNull: ["$$raw.title", ""] },
  //                   find: "{city}",
  //                   replacement: "$cityName",
  //                 },
  //               },
  //               description: {
  //                 $replaceAll: {
  //                   input: { $ifNull: ["$$raw.description", ""] },
  //                   find: "{city}",
  //                   replacement: "$cityName",
  //                 },
  //               },
  //               keyword: {
  //                 $replaceAll: {
  //                   input: { $ifNull: ["$$raw.keyword", ""] },
  //                   find: "{city}",
  //                   replacement: "$cityName",
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //     {
  //       $lookup: {
  //         from: "specializationcityfaqs",
  //         let: { masterId: { $arrayElemAt: ["$mainService._id", 0] } }, // 👈 capture the joined mainService._id
  //         pipeline: [
  //           {
  //             $match: {
  //               $expr: {
  //                 $and: [
  //                   { $eq: ["$specializationId", "$$masterId"] }, // 👈 join on correct key
  //                   { $eq: ["$status", true] },
  //                 ],
  //               },
  //             },
  //           },
  //           {
  //             $project: {
  //               question: 1,
  //               answer: 1,
  //               _id: 0,
  //             },
  //           },
  //         ],
  //         as: "masterFaqs",
  //       },
  //     },
  //     {
  //       $lookup: {
  //         from: "servicecityimages",
  //         localField: "specializationId",
  //         foreignField: "serviceId",
  //         as: "images",
  //         pipeline: [{ $project: { image: 1, title: 1, content: 1, _id: 0 } }],
  //       },
  //     },
  //     {
  //       $addFields: {
  //         images: {
  //           $map: {
  //             input: "$images",
  //             as: "img",
  //             in: {
  //               image: "$$img.image",
  //               title: {
  //                 $replaceAll: {
  //                   input: "$$img.title",
  //                   find: "{city}",
  //                   replacement: "$cityName",
  //                 },
  //               },
  //               content: {
  //                 $replaceAll: {
  //                   input: "$$img.content",
  //                   find: "{city}",
  //                   replacement: "$cityName",
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //     {
  //       $project: {
  //         pageName: 1,
  //         cityName: 1,
  //         slug: 1,
  //         serviceSlug: 1,
  //         seoMeta: 1,
  //         seoMetaName: 1,
  //         aboutService: 1,
  //         aboutName: 1,
  //         h1Desc: 1,
  //         h1DescName: 1,
  //         h1Text: 1,
  //         h1Name: 1,
  //         h2Text: 1,
  //         h2Name: 1,
  //         images: 1,
  //         topCities: 1,
  //         topServices: 1,
  //         mainService: 1,
  //         allFaqs: {
  //           $concatArrays: [
  //             { $ifNull: ["$masterFaqs", []] },
  //             { $ifNull: ["$individualFaqs.faqs", []] },
  //           ],
  //         },
  //       },
  //     },
  //   ];

  //   const result = await ServiceCities.aggregate(pipeline);
  //   const service = result[0];
  //   if (!service) return null;

  //   const matchedServicePage = service.mainService?.[0];

  //   // Helper to resolve fields from matchedServicePage using service's *Name keys
  //   const resolveDynamicField = (keyName, fallbackKey) => {
  //     const dynamicKey = service[keyName];
  //     const resolvedValue =
  //       dynamicKey && matchedServicePage && matchedServicePage[dynamicKey];

  //     // console.log(
  //     //   `Resolving ${keyName} => "${dynamicKey}" =>`,
  //     //   resolvedValue ? "✅ FOUND" : "❌ NOT FOUND"
  //     // );

  //     // console.log("resolvedValue=>>", resolvedValue);
  //     // console.log("service[fallbackKey];=>>", service[fallbackKey]);
  //     return resolvedValue || service[fallbackKey];
  //   };

  //   // Apply dynamic replacements
  //   service.seoMeta = resolveDynamicField("seoMetaName", "seoMeta");
  //   service.aboutService = resolveDynamicField("aboutName", "aboutService");
  //   service.h1Desc = resolveDynamicField("h1DescName", "h1Desc");
  //   service.h1Text = resolveDynamicField("h1Name", "h1Text");
  //   service.h2Text = resolveDynamicField("h2Name", "h2Text");

  //   // Replace {{city}} placeholders in all major text fields
  //   const cityName = service.cityName;
  //   service.seoMeta = replaceCityPlaceholders(service.seoMeta, cityName);
  //   service.aboutService = replaceCityPlaceholders(
  //     service.aboutService,
  //     cityName
  //   );
  //   service.h1Desc = replaceCityPlaceholders(service.h1Desc, cityName);
  //   service.h1Text = replaceCityPlaceholders(service.h1Text, cityName);
  //   service.h2Text = replaceCityPlaceholders(service.h2Text, cityName);

  //   // Clean up unnecessary name keys
  //   delete service.seoMetaName;
  //   delete service.aboutName;
  //   delete service.h1DescName;
  //   delete service.h1Name;
  //   delete service.h2Name;
  //   delete service.mainService;

  //   // Handle FAQs
  //   const allFaqs = Array.isArray(service.allFaqs) ? service.allFaqs : [];
  //   const shuffledFaqs = allFaqs.sort(() => 0.5 - Math.random()).slice(0, 10);
  //   const flatFaqs = shuffledFaqs.flat().slice(0, 12);

  //   const [basePageName] = service.pageName?.split(" in ") || [];
  //   const [baseSlug] = service.slug?.split("-in-") || [];

  //   service.faqs = flatFaqs.map((faq) => ({
  //     question: faq.question
  //       ?.replace(/{{service}}/g, basePageName)
  //       ?.replace(/{{city}}/g, service.cityName)
  //       ?.replace(/{service}/g, service.basePageName)
  //       ?.replace(/{city}/g, service.cityName),
  //     answer: faq.answer
  //       ?.replace(/{{service}}/g, basePageName)
  //       ?.replace(/{{city}}/g, service.cityName)
  //       ?.replace(/{service}/g, service.basePageName)
  //       ?.replace(/{city}/g, service.cityName),
  //   }));

  //   const currentCitySlug = service.slug?.split("-in-")[1];

  //   service.topCities = (service.topCities || [])
  //     .filter(
  //       (city) => city.slug?.toLowerCase() !== currentCitySlug?.toLowerCase()
  //     )
  //     .map((city) => ({
  //       pageName: `${basePageName} in ${city.pageName}`,
  //       slug: `${baseSlug}-in-${city.slug}`,
  //     }));

  //   delete service.allFaqs;

  //   return service;
  // };

  const fetchByQueryToEdit = (query) => {
    console.log("ServiceCitiesService => fetchByQuery");
    return new Promise(function (resolve, reject) {
      let orm = ServiceCities.findOne(query).select("");

      orm.then(resolve).catch(reject);
    });
  };

  const getServiceCities = (query, page, limit) => {
    if (page) {
      page -= 1;
    }
    return new Promise(function (resolve, reject) {
      let orm = ServiceCities.find(query)
        .select(" -__v")
        .sort({ rank: 1 })
        .skip(page * limit)
        .limit(limit);
      orm.then(resolve).catch(reject);
    });
  };

  const countServiceCities = (query) => {
    return new Promise(function (resolve, reject) {
      let orm = ServiceCities.countDocuments(query);
      orm.then(resolve).catch(reject);
    });
  };

  return {
    fetch,
    fetchByQuery,
    fetchByQueryToEdit,
    getServiceCities,
    countServiceCities,
    fetchByQueryFAQs,
  };
};
