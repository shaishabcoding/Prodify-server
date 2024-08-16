const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

//middlewares
app.use(express.json());
app.use(cors());

const client = new MongoClient(process.env.DB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  },
});

(async () => {
  await client.connect();
  await client.db("admin").command({ ping: 1 });
  console.log("Pinged your deployment. You successfully connected to MongoDB!");

  const DB = client.db("Prodify");
  const productCollection = DB.collection("products");

  app.post("/jwt", async (req, res) => {
    const { email } = req.body;
    const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET);
    res.send({ token });
  });

  app.get("/products", async (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = parseInt(req.query.offset, 10) || 0;
    const { search, sort } = req.query;
    const matchStage = {};

    if (search) {
      matchStage.$text = { $search: search };
    }

    // Define sorting logic based on query parameters
    let sortStage = {};
    if (sort === "priceLowToHigh") {
      sortStage = { price: 1 }; // Ascending order
    } else if (sort === "priceHighToLow") {
      sortStage = { price: -1 }; // Descending order
    } else if (sort === "dateNewest") {
      sortStage = { productCreationDate: -1 }; // Newest first
    } else {
      sortStage = search ? { score: { $meta: "textScore" } } : { _id: 1 }; // Default sort
    }

    const products = await productCollection
      .aggregate([
        {
          $match: matchStage,
        },
        {
          $sort: sortStage,
        },
        {
          $skip: offset,
        },
        {
          $limit: limit,
        },
      ])
      .toArray();

    const productsCount = await productCollection.countDocuments(matchStage);
    res.send({ products, productsCount });
  });
})();

app.get("/", (req, res) => {
  res.send("server is running");
});
app.listen(port, () => {
  console.log("server is running on " + port);
});
