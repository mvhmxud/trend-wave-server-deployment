const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");
const cors = require('cors');
const authRoute = require("./routes/authRoutes");
const userRoute = require("./routes/UserRoutes");
const productController = require("./controllers/Product");
const productRoute = require("./routes/ProductRoutes")
const isAuthenticated = require("./middlewares/isAuthenticated");

const app = express();

app.use(cors({
  origin: '*'
}));

dotenv.config();
// multer middlewares
const storage = multer.diskStorage({
  destination : (req ,file , cb)=>{
    cb(null , path.join(__dirname , 'public' , 'images'))
  } , 
  filename : (req ,file , cb)=>{
    cb(null , Date.now() + file.originalname )
  }
})

const upload = multer({storage : storage})

exports.upload = upload

app.use(express.static(path.join(__dirname , 'public')))
// parsers
app.use(bodyParser.urlencoded({ extended: true }));

// webhooks
app.post('/webhook' , express.raw({type : 'application/json'}) , productController.StripeWebHook )

// parse body
app.use(bodyParser.json());


// Routes
app.use('/products' , upload.array('images'), productRoute)
app.use('/auth' , authRoute)
app.use('/users' , isAuthenticated , userRoute)


app.use("/test" , isAuthenticated , (req, res, next) => {
  res.status(200).json({
    message: "TARSH",
  });
  next();
});

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    res.status(status).json({
      message: message,
    });
  });
  

app.listen(process.env.PORT, () => {
  mongoose
    .connect(
      `mongodb+srv://mvhmxud:${process.env.DATABASE_PASSWORD}@cluster0.i1zsn.mongodb.net`
    )
    .then((res) => {
      console.log(
        "Database connected and server listening on port ",
        process.env.PORT,
        "⚡🔌"
      );
    })
    .catch((err) => {
      console.log("err ======> ",err);
    });
});














// //
// const user = new User({
//     name: "Mahmoud",
//     email: "mvhmxud",
//     password: "123456789",
//     address: "21 MohamedALI st suez , egypt",
//     invoices: [],
//     role: "admin",
//   });

//   user
//     .save()
//     .then((res) => {
//       console.log("User created successfully ! ", res);
//     })
//     .catch((err) => {
//         console.log(err.message)
//     });
//  //