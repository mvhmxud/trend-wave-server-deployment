const Category = require("../models/category");
const Product = require("../models/product");
const Order = require("../models/order");
const User = require("../models/users");
const { validationResult } = require("express-validator");
const Stripe = require("stripe");

const STRIPE_SECRET_KEY =
  "sk_test_51LgwaMCyPfOzbfRzzbdQYjgVNl5Zg7JBTrbiMwhS9lYtCdNfVlKzOlydmkzFuUj4SuZ0FzpPVXdOhG4CTOGvB1ga00bvPILRNN";
const stripe = new Stripe(STRIPE_SECRET_KEY);

exports.addCategory = (req, res, next) => {
  const { title } = req.body;
  const cat = new Category({
    title: title,
  });
  cat
    .save()
    .then((cat) => {
      res.status(200).json({
        category: cat,
      });
    })
    .catch((err) => {
      err.statusCode = 400;
      next(err);
    });
};

exports.getAllProducts = (req, res, next) => {
  let cat = req.query.cat;
  const page = parseInt(req.query.page) || 1; // Ensure page is a number
  const limit = 6;
  const query = cat ? { category: cat } : { category: { $exists: true } };

  Product.countDocuments(query)
    .then((count) => {
      if (page > Math.ceil(count / limit)) {
        return res.status(404).json({ message: "Page not found" });
      }

      return Product.find(query)
        .limit(limit)
        .skip((page - 1) * limit)
        .populate("category")
        .then((products) => {
          res.status(200).json({
            products,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
          });
        });
    })
    .catch((err) => {
      err.statusCode = 400;
      next(err);
    });
};

exports.AddProduct = (req, res, next) => {
  const { title, description, price, category, images } = req.body;
  
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg);
    error.statusCode = 422;
    throw error;
  }

  const imagesArray = req.files.map((image) => "/images/" + image.filename);
  const product = new Product({
    title: title,
    description: description,
    price: price,
    category: category,
    images: imagesArray,
  });
  product
    .save()
    .then((product) => {
      res.status(200).json({
        product: product,
      });
    })
    .catch((err) => {
      err.statusCode = 400;
      next(err);
    });
};

exports.getAllCategories = (req, res, next) => {
  Category.find()
    .then((catDoc) => {
      res.status(200).json({
        categories: catDoc,
      });
    })
    .catch((err) => {
      err.statusCode = 400;
      next(err);
    });
};

exports.deleteProduct = (req, res, next) => {
  const { id } = req.body;

  Product.findOne({ _id: id })
    .then((product) => {
      if (product) {
        Product.findOneAndDelete({ _id: id }).then((productDoc) => {
          res.status(200).json({
            message: "Product deleted successfully",
          });
        });
      } else {
        const error = new Error("Found no product with that id");
        error.statusCode = 404;
        throw error;
      }
    })
    .catch((err) => {
      err.statusCode = 400;
      next(err);
    });
};

exports.editProduct = (req, res, next) => {
  const { id } = req.params;
  const updated = ({ description, title, price, category } = req.body);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg);
    error.statusCode = 422;
    throw error;
  }

  const imagesArray = req.files.map((image) => "/images/" + image.filename);
  if (imagesArray.length > 0) {
    updated["images"] = imagesArray;
  }

  Product.findByIdAndUpdate({ _id: id }, updated)
    .then((productDoc) => {
      if (productDoc) {
        res.status(200).json({
          message: "Product updated successfully",
        });
      } else {
        const error = new Error("Found no product with that id");
        error.statusCode = 404;
        throw error;
      }
    })
    .catch((err) => {
      err.statusCode = 400;
      next(err);
    });
};

exports.addOrder = (req, res, next) => {
  const { items } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg);
    error.statusCode = 422;
    throw error;
  }

  const userId = req.userId;
  const order = new Order({
    items: items,
    user: userId,
  });
  order
    .save()
    .then((order) => {
      res.status(200).json({
        message: "order placed successfully!",
        order: order,
      });
    })
    .catch((err) => {
      err.message = "error while saving order";
      err.statusCode = 400;
      next(err);
    });
};

exports.findOrderByUserId = (req, res, next) => {

  Order.find({ userId: req.userId })
    .then((order) => {
      if (order.length) {
        res.status(200).json({
          orders: order,
        });
      } else {
        res.status(404).json({
          message: "found no order associated with that user",
        });
      }
    })
    .catch((err) => {
      err.message = "error while fetching user's order";
      err.statusCode = 500;
      next(err);
    });
};

exports.findProductById = (req, res, next) => {
  const productId = req.params.productId;
  Product.findById(productId)
    .populate("category")
    .then((product) => {
      if (product) {
        res.status(200).json({
          product: product,
        });
      } else {
        res.status(404).json({
          message: "product not found",
        });
      }
    })
    .catch((err) => {
      err.message = "error while fetching product";
      next(err);
    });
};

exports.getProductsByCategory = (req, res, next) => {
  const { page } = req.query;
  const limit = 6;
  let count;
  console.log(req.params.catId);
  Product.find({ category: req.params.catId })
    .count()
    .then((cnt) => {
      count = cnt;
      if (page > Math.ceil(count / limit)) {
        res.status(404).json({
          message: "Page not Found",
        });
      }
    })
    .catch((err) => {
      err.message = "error while fetching products by category ";
      next(err);
    });

  Product.find({ category: req.params.catId })
    .limit(limit)
    .skip((page - 1) * limit)
    .then((products) => {
      if (products.length > 0) {
        res.status(200).json({
          products: products,
          currentPage: page,
          totalPages: Math.ceil(count / limit),
        });
      } else {
        res.status(404).json({
          message: "products not found",
        });
      }
    })
    .catch((err) => {
      err.message = "error while fetching products by category ";
      next(err);
    });
};

exports.PaymentHandler = async (req, res) => {
  if (req.method === "POST") {
    try {
      const metadata = {
        product_ids: req.body.items.map((item) => item.product_id),
      };

      const params = {
        submit_type: "pay",
        mode: "payment",
        payment_method_types: ["card"],
        billing_address_collection: "auto",
        line_items: req.body.items.map((item) => {
          const img = `http://${process.env.HOST}:${
            process.env.PORT
          }${item.image.toString()}`;
          return {
            price_data: {
              currency: "usd",
              product_data: {
                name: item.title,
              },
              unit_amount: item.price * 100,
            },
            quantity: item.qty,
          };
        }),
        customer_email: req.body.email,
        success_url: `${req.headers.origin}/checkout/success`,
        cancel_url: `${req.headers.origin}/`,
      };
      // Create Checkout Sessions from body params.
      const session = await stripe.checkout.sessions.create(params);
      res.status(200).json(session);
    } catch (err) {
      res.status(err.statusCode || 500).json(err.message);
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
};

const STRIPE_WEBHOOK_SECRET =
  "whsec_GPvKeQwVtc3tiC7NfhBNYtCtyuyw0n2p";

exports.StripeWebHook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let customer_email;
  let amount = 0;
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      customer_email = event.data.object.customer_email;
      amount = event.data.object.amount_total / 100;
      const { line_items } = await stripe.checkout.sessions.retrieve(
        event.data.object.id,
        {
          expand: ["line_items"],
        }
      );
      const items = line_items.data.map((item) => {
        return {
          title: item.description,
          qty: item.quantity,
        };
      });

      const order = new Order({ items: items, price: amount });

      User.findOne({ email: customer_email }).then((user) => {
        order.userId = user._id;
        order.save();
      });
    }

    res.status(200).json({
      message : "webhook recived successfully"
    });
  } catch (err) {
    console.error("Webhook Error:", err.message);
    res.status(400).json({
      message : "error while recieving stripe webhook"
    });
  }
};
