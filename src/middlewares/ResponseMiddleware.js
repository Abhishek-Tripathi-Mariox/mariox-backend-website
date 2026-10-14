const messages = require("../util/messages");

module.exports = (req, res, next, customMsg = "") => {
  console.log("ResponseMiddleware => exports");

  const data = req.rData ? req.rData : {};
  const code = req.rCode !== undefined ? req.rCode : 1;
  const message = customMsg
    ? customMsg
    : req.msg
    ? messages()[req.msg]
    : "success";

  if (req.userData) {
    res.set(
      "X-User-Data",
      Buffer.from(JSON.stringify(req.userData)).toString("base64")
    );
  }

  const responseObj = {
    code,
    message,
    data,
  };

  let statusCode = 200;
  if (code === 3) statusCode = 401;
  else if (code === 4) statusCode = 403;
  else if (code === 0) statusCode = 400;
  else if (code === 5) statusCode = 404;

  res.status(statusCode).send(responseObj);
};
