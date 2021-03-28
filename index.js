const express = require('express');
const cors = require('cors');
const {MongoClient} = require('mongodb');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());

const {DB_USER, DB_PASS, DB_NAME, PORT}=process.env;

const port = PORT || 4000;

const uri = `mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.ernz8.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
  const productsContainer = client.db(DB_NAME).collection("products");

  const ordersContainer = client.db(DB_NAME).collection("orders");

  const admin = client.db(DB_NAME).collection("admin");

  app.post("/addProduct", (req, res) => {
    const product = req.body;
    productsContainer.insertOne(product)
    .then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/products", (req, res) => {
    productsContainer.find({}).limit(20)
    .toArray((err, documents) => {
      res.send(documents)
    })
  });

  app.get("/product/:key", (req, res) => {
    productsContainer.find({key: req.params.key})
    .toArray((err, documents) => {
      res.send(documents[0])
    })
  });

  app.post('/productsByKeys', (req, res) => {
    const keys = req.body;
    productsContainer.find({
      key: { $in: keys}
    })
    .toArray((err, documents) => {
      res.send(documents)
    })
  });

  app.post('/placeOrder', (req, res)=>{
    const orderDetails = req.body;
    ordersContainer.insertOne(orderDetails)
    .then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/emmaJhonsAdmin", (req, res) => {
    admin.find({})
    .toArray((err, documents) => {
      res.send(documents[0])
    })
  });

});

app.get('/', (req, res) => {
  res.send('Hello Emma John!')
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});