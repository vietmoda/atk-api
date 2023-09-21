const express = require("express");
const sanitizers = require("./middleware/sanitizers");
var cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const { devNull } = require("os");
const log4js = require("./config/log4j");
const logger = log4js.getLogger();

//environment
require("dotenv").config({
  path: "./environment.env",
});

//db config
const dbconfig =
  process.env.NODE_ENV === "production"
    ? require("./config/config.prod.json")
    : require("./config/config.dev.json");
//Set cache?
if (process.env.USE_CACHE == 1) {
  logger.info("Caching solution established!");
  console.log("Caching solution established!");
} else {
  logger.info("Caching solution was disabled!");
  console.log("Caching solution was disabled!");
}
//connect mongodb server
const connectionString = dbconfig.DATABASE_SERVER + dbconfig.DATABASE_NAME;
mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", (err) => {
  logger.error(err);
});
db.once("open", () => {
  logger.info(`MongoDB server connected`);
});

const app = express();
app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//escape HTML with sanitizeHTML
logger.info("Enable sanitize GET method with all of params and query");
console.log("Enable sanitize GET method with all of params and query");
app.use(sanitizers);

app.get('/', (req, res) => {
    return res.status(200).send('Hello World');
});

//start api server
const PORT = dbconfig.PORT_SERVER || 3000;
app.listen(PORT, () => {
  console.log(`API Server is running on port ${PORT}`);
  logger.info(`API Server is running on port ${PORT}`);
});

//public directory
app.use(dbconfig.PUBLIC_URL_FILE, express.static(dbconfig.PUBLIC_DIR_PHYSICAL));

//public API url
const userRouter = require("./routers/UserRouter");
const fileRouter = require("./routers/FileRouter");
const roleRouter = require("./routers/RoleRouter");
const groupRouter = require("./routers/GroupRouter");
const categoryRouter = require("./routers/CategoryRouter");
const itemRouter = require("./routers/ItemRouter");
const organizationRouter = require("./routers/OrganizationRouter");
const fixeddataRouter = require("./routers/FixedDataRouter");
const newscategoryRouter = require("./routers/NewsCategoryRouter");
const videoRouter = require("./routers/VideoRouter");
const albumRouter = require("./routers/AlbumRouter");
const weblinkRouter = require("./routers/WeblinkRouter");
const newsRouter = require("./routers/NewsRouter");
const bookingsRouter = require("./routers/BookingRouter");
const suggestedmenusRouter = require("./routers/SuggestedMenuRouter");
const ordermenusRouter = require("./routers/OrderMenuRouter");
const logcommandRouter = require("./routers/LogcommandRouter");
const systemconfigRouter = require("./routers/SystemConfigRouter");
const areaRouter = require("./routers/AreaRouter");
const apiaccountRouter = require("./routers/APIAccountRouter");
const sendemailRouter = require("./routers/SendEmailRouter");
const historicalsiteRouter = require("./routers/HistoricalSiteRouter");
const publicAPIRouter = require("./routers/PublicAPIRouter");

app.use("/api/users", userRouter);
app.use("/api/files", fileRouter);
app.use("/api/roles", roleRouter);
app.use("/api/groups", groupRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/items", itemRouter);
app.use("/api/organizations", organizationRouter);
app.use("/api/fixeddata", fixeddataRouter);
app.use("/api/newscategories", newscategoryRouter);
app.use("/api/videos", videoRouter);
app.use("/api/albums", albumRouter);
app.use("/api/weblinks", weblinkRouter);
app.use("/api/news", newsRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/suggestedmenus", suggestedmenusRouter);
app.use("/api/ordermenus", ordermenusRouter);
app.use("/api/logcommands", logcommandRouter);
app.use("/api/systemconfigs", systemconfigRouter);
app.use("/api/areas", areaRouter);
app.use("/api/apiaccounts", apiaccountRouter);
app.use("/api/emails", sendemailRouter);
app.use("/api/historicalsites", historicalsiteRouter);
//public api for other systems
app.use("/api/public", publicAPIRouter);
