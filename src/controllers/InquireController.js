"use strict";

const InquireService = require("../services/InquireService");
const RegexEscape = require("regex-escape");

module.exports = () => {
  const addInquire = async (req, res, next) => {
    console.log("InquireController => addInquire");

    const Inquire = await InquireService().addInquire(req.body);

    req.rData = Inquire;
    req.msg = "success";
    next();
  };

  return {
    addInquire,
  };
};
