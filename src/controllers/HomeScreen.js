// "use strict";

const CitiesService = require("../services/CitiesService");
const ServiceCitiesService = require("../services/ServiceCitiesService");
const ServicesService = require("../services/ServicesService");
const ServiceCityImagesService = require("../services/ServiceCityImagesService");
const ServiceCityCompanyService = require("../services/ServiceCityCompanyService");
const redis = require("../util/redis"); // adjust path if needed
const redisClient = redis(); // get the functions

module.exports = () => {
  const HomeScreen = async (req, res, next) => {
    console.log("HomeScreen => HomeScreen");

    const { slug } = req.params;
    const cacheKey = `homeScreen:${slug}`;

    try {
      // 1. Check Redis cache
      // const cachedResponse = await redisClient.getOtpFromRedis(cacheKey);
      // if (cachedResponse) {
      //   console.log("Serving from Redis cache...");
      //   req.rData = JSON.parse(cachedResponse);
      //   return next();
      // }

      // 2. Fetch from DB if not cached
      const results = await Promise.allSettled([
        ServicesService().fetchByQueryFAQs({
          slug,
          status: true,
        }),
        ServiceCitiesService().fetchByQueryFAQs({
          slug,
          status: true,
        }),
        ServiceCityCompanyService().fetchByQuery({
          slug,
        }),
      ]);

      const [serviceResult, serviceCityResult, ServiceCityCompany] = results;

      console.log("Results from DB:", results);

      let finalData = {};

      if (serviceResult.status === "fulfilled" && serviceResult.value) {
        const serviceData = serviceResult.value;

        // const serviceImagesResult =
        //   await ServiceImagesService().getServiceImages({
        //     slug: serviceData.slug,
        //     status: true,
        //   });

        // if (serviceImagesResult) {
        //   serviceData.images = serviceImagesResult;
        // } else {
        //   serviceData.images = [];
        // }
        finalData = serviceData;
      } else if (
        serviceCityResult.status === "fulfilled" &&
        serviceCityResult.value
      ) {
        const cityData = serviceCityResult.value;

        // const serviceCityImagesResult =
        //   await ServiceCityImagesService().getServiceCityImages({
        //     slug: cityData.serviceSlug,
        //     status: true,
        //   });
        // // if (
        // //   serviceCityImagesResult.status === "fulfilled" &&
        // //   serviceCityImagesResult.value
        // // ) {
        // if (serviceCityImagesResult) {
        //   cityData.images = serviceCityImagesResult;
        // } else {
        //   cityData.images = [];
        // }
        finalData = cityData;
      } else if (
        ServiceCityCompany.status === "fulfilled" &&
        ServiceCityCompany.value
      ) {
        // convert mongoose doc to plain JS object
        const companyData = ServiceCityCompany.value.toObject
          ? ServiceCityCompany.value.toObject()
          : ServiceCityCompany.value;

        // add flag only at the right place (not globally)
        companyData.isTopCity = true;

        finalData = companyData;
      }

      // 3. Save to Redis cache (10 min TTL)
      // await redisClient.storeOtpInRedis(cacheKey, finalData, 900);

      req.rData = finalData;
      next();
    } catch (err) {
      console.error("Error in HomeScreen with Redis:", err);
      req.rData = {};
      req.msg = "Internal server error";
      req.rCode = 500;
      next();
    }
  };

  // const HomeScreen = async (req, res, next) => {
  //   console.log("HomeScreen => HomeScreen");
  //   const { slug } = req.params;
  //   const cacheKey = `homeScreen:${slug}`;

  //   try {
  //     // 1. Redis Cache Check
  //     const cached = await redisClient.getOtpFromRedis(cacheKey);
  //     if (cached) {
  //       console.log("⚡ From Redis");
  //       req.rData = JSON.parse(cached);
  //       return next();
  //     }

  //     // 2. Try serviceCity first (more specific)
  //     let data = await ServiceCitiesService().fetchByQueryFAQs({
  //       slug,
  //       status: true,
  //     });

  //     if (!data) {
  //       data = await ServicesService().fetchByQueryFAQs({ slug, status: true });
  //     }

  //     if (!data) {
  //       req.rData = {};

  //       return next();
  //     }

  //     // 3. Cache Result
  //     await redisClient.storeOtpInRedis(cacheKey, data, 900); // 15 min TTL

  //     req.rData = data;
  //     return next();
  //   } catch (err) {
  //     console.error("❌ HomeScreen Error:", err);
  //     req.rData = {};
  //     req.msg = "Internal Server Error";
  //     req.rCode = 500;
  //     return next();
  //   }
  // };

  return {
    HomeScreen,
  };
};
