const express = require("express");
const router = express.Router();
const NewsController = require("../controllers/NewsController");
const NewsCategoryController = require("../controllers/NewsCategoryController");
const caching = require("../middleware/caching");

router.get(
  "/getnewsbycat",
  caching,
  NewsController.getbycategory
);

router.get(
  "/countnewsbycat",
  caching,
  NewsController.countbycategory
);

router.get(
  "/getnewsbyid",
  caching,
  NewsController.getbyid
);

router.get(
  "/getcatbyid",
  caching,
  NewsCategoryController.getbyid
);

module.exports = router;
