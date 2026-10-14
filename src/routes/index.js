const router = require("express").Router();
const HomeScreen = require("../controllers/HomeScreen");
const ResponseMiddleware = require("../middlewares/ResponseMiddleware");
const ErrorHandlerMiddleware = require("../middlewares/ErrorHandlerMiddleware");
const InquireController = require("../controllers/InquireController");

router.get(
  "/homeScreen/:slug",
  ErrorHandlerMiddleware(HomeScreen().HomeScreen),
  ResponseMiddleware
);

router.post(
  "/inquires",
  ErrorHandlerMiddleware(InquireController().addInquire),
  ResponseMiddleware
);

module.exports = router;
