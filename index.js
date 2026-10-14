const express = require("express");
require("dotenv").config();
const PORT = process.env.PORT || 9110;
const app = express();
var bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const connectDB = require("./src/models/index");
connectDB();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(
  fileUpload({
    limits: { fileSize: 100000000 },
  })
);

app.use((req, res, next) => {
  const ip =
    req.headers["x-forwarded-for"]?.split(",").shift() || // if behind proxy (like Nginx/Cloudflare)
    req.socket?.remoteAddress || // direct connection
    req.connection?.remoteAddress;

  console.log(
    `Incoming Request: ${req.method} ${req.originalUrl} from IP: ${ip}`
  );
  next();
});

require("./src/models");
app.use("/v1/api", require("./src/routes"));

// app.use("/", (req, res) => {
//   res.send("Hello from user service");
// });

app.listen(PORT, () => {
  console.log("Server listening on port " + PORT);
});
