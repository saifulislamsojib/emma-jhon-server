const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());

const port = process.env.PORT || 4000;

const db_name = process.env.DB_NAME;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ernz8.mongodb.net/${db_name}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

(async () => {
  const db = client.db(db_name);
  const productsCollection = db.collection("products");
  const ordersContainer = db.collection("orders");
  const admin = db.collection("admin");

  app.post("/addProduct", (req, res) => {
    const product = req.body;
    productsCollection.insertOne(product).then((result) => {
      res.send(result.acknowledged);
    });
  });

  app.get("/products", (req, res) => {
    productsCollection
      .find({})
      .limit(20)
      .toArray((err, documents) => {
        res.send(documents);
      });
  });

  app.get("/product/:key", (req, res) => {
    productsCollection
      .find({ key: req.params.key })
      .toArray((err, documents) => {
        res.send(documents[0]);
      });
  });

  app.post("/productsByKeys", (req, res) => {
    const keys = req.body;
    productsCollection
      .find({
        key: { $in: keys },
      })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });

  app.post("/placeOrder", (req, res) => {
    const orderDetails = req.body;
    ordersContainer.insertOne(orderDetails).then((result) => {
      res.send(result.acknowledged);
    });
  });

  app.get("/emmaJhonsAdmin", (req, res) => {
    admin.find({}).toArray((err, documents) => {
      res.send(documents[0]);
    });
  });
})().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello Emma John!");
});

app.listen(port, () => {
  console.log("listening on port " + port);
});
