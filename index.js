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
  // await client.connect();
  // await client.db("admin").command({ ping: 1 });
  // console.log("Pinged your deployment. You successfully connected to MongoDB!");

  const DB = client.db("Prodify");
  const productCollection = DB.collection("products");

  app.post("/jwt", async (req, res) => {
    const { email } = req.body;
    const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET);
    res.send({ token });
  });

  const verifyToken = (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).send({ message: "unauthorized access 49" });
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        console.log("err 56");

        return res.status(401).send({ message: "unauthorized access 55" });
      }
      req.user = { email: decoded };
      next();
    });
  };

  app.get("/products", async (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = parseInt(req.query.offset, 10) || 0;
    const { search, sort, minPrice, maxPrice, category, brand } = req.query;
    const matchStage = {};

    // Text search filter
    if (search) {
      matchStage.$text = { $search: search };
    }

    // Price range filter
    if (minPrice) {
      matchStage.price = { ...matchStage.price, $gte: parseFloat(minPrice) };
    }
    if (maxPrice) {
      matchStage.price = { ...matchStage.price, $lte: parseFloat(maxPrice) };
    }

    // Category filter
    if (category) {
      matchStage.category = category;
    }

    // Brand filter
    if (brand) {
      matchStage.brandName = brand;
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

  app.get("/products/:id", verifyToken, async (req, res) => {
    const result = await productCollection.findOne({
      _id: new ObjectId(req.params.id),
    });
    res.send(result);
  });

  app.get("/brands", async (req, res) => {
    try {
      const brands = await productCollection
        .aggregate([
          {
            $group: {
              _id: null,
              brands: { $addToSet: "$brandName" }, // Collect unique brand names
            },
          },
          {
            $project: {
              _id: 0,
              brands: 1,
            },
          },
        ])
        .toArray();

      res.send(brands[0] ? brands[0].brands : []);
    } catch (err) {
      res.status(500).send({ error: "Failed to fetch brands" });
    }
  });

  app.get("/categories", async (req, res) => {
    try {
      const categories = await productCollection
        .aggregate([
          {
            $group: {
              _id: null,
              categories: { $addToSet: "$category" }, // Collect unique categories
            },
          },
          {
            $project: {
              _id: 0,
              categories: 1,
            },
          },
        ])
        .toArray();

      res.send(categories[0] ? categories[0].categories : []);
    } catch (err) {
      res.status(500).send({ error: "Failed to fetch categories" });
    }
  });

  app.get("/price-range", async (req, res) => {
    try {
      const priceRange = await productCollection
        .aggregate([
          {
            $group: {
              _id: null,
              minPrice: { $min: "$price" }, // Find the minimum price
              maxPrice: { $max: "$price" }, // Find the maximum price
            },
          },
          {
            $project: {
              _id: 0,
              minPrice: 1,
              maxPrice: 1,
            },
          },
        ])
        .toArray();

      res.send(priceRange[0] ? priceRange[0] : { minPrice: 0, maxPrice: 0 });
    } catch (err) {
      res.status(500).send({ error: "Failed to fetch price range" });
    }
  });
})();

app.get("/", (req, res) => {
  res.send("server is running");
});
app.listen(port, () => {
  console.log("server is running on " + port);
});
