const express = require("express");
const router = express.Router();
const productController = require("../controllers/Product");
const isAuthenticated = require("../middlewares/isAuthenticated");
const { body } = require("express-validator");

// get all products '/products' GET
router.get("/" , productController.getAllProducts);
// add product '/products' POST
router.post(
  "/",
  [
    body("title").not().isEmpty().withMessage("title could not be empty"),
    body("description")
      .not()
      .isEmpty()
      .withMessage("description could not be empty"),
    body("price")
      .isNumeric()
      .withMessage("price should be a numeric value and could not be empty")
      .not()
      .isEmpty()
      .withMessage("price could not be empty"),
    body("category").not().isEmpty().withMessage("category could not be empty"),
  ],
  productController.AddProduct
);
// delete product '/category' DELETE
router.delete("/", productController.deleteProduct);
// edit product '/category' PUT
router.put(
  "/:id",
  [
    body("title")
      .optional()
      .not()
      .isEmpty()
      .withMessage("title could not be empty"),
    body("description")
      .optional()
      .not()
      .isEmpty()
      .withMessage("description could not be empty"),
    body("price")
      .optional()
      .isNumeric()
      .withMessage("price should be a numeric value and could not be empty")
      .not()
      .isEmpty()
      .withMessage("price could not be empty"),
    body("category")
      .optional()
      .not()
      .isEmpty()
      .withMessage("category could not be empty"),
  ],
  productController.editProduct
);

// add category '/category' POST
router.post("/category", productController.addCategory);
// get all categories '/category' GET
router.get("/category", productController.getAllCategories);

// add order '/order' POST
router.post(
  "/order",
  [
    body("items")
    .isArray({min : 1}).withMessage("orders should be array of products and it should have at least one product !"),
  ],
  isAuthenticated,
  productController.addOrder
);

// get order by user id GET '/order/:userId
router.get("/orders" , isAuthenticated , productController.findOrderByUserId )

// get product by id GET "/products/:productId"
router.get("/:productId" , productController.findProductById)

//get product by cat Id GET "/products/categories/:catId"
router.get("/categories/:catId"  , productController.getProductsByCategory)

router.post("/payment"  , productController.PaymentHandler)

router.post("/webhook" , express.raw({type: 'application/json'}) ,productController.StripeWebHook)

module.exports = router;
