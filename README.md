# Product Catalog API

This is a Node.js-based API for a product catalog, allowing users to search, filter, and sort products by various criteria such as price, category, brand, and more. The API is built using Express and MongoDB.

## Features

- **Search Products**: Full-text search on product names and descriptions.
- **Filter by Price Range**: Get products within a specified price range.
- **Filter by Category**: Retrieve products belonging to a specific category.
- **Filter by Brand**: Retrieve products from a specific brand.
- **Sort Products**: Sort products by price (low to high, high to low) or by the date added (newest first).
- **Pagination**: Limit the number of products returned and implement pagination.

## Installation

Follow these steps to set up and run the project on your local machine:

### 1. Clone the repository

First, clone the repository to your local machine:

```bash
git clone https://github.com/shaishabcoding/Prodify-server.git
```

### 2. Install dependencies

Next, install the necessary dependencies by running:

```bash
npm install
```

This will install all the packages listed in the `package.json` file.

### 3. Set up environment variables

Create a `.env` file in the root of your project and add the following environment variables:

```bash
MONGODB_URI=your-mongodb-uri
PORT=5000
```

- **`MONGODB_URI`**: The connection string for your MongoDB database. Replace `your-mongodb-uri` with the actual URI.
- **`PORT`**: The port on which your server will run. The default is set to `5000`, but you can choose any available port.

### 4. Run the server

Start the server with the following command:

```bash
npm start
```

The server will start on `http://localhost:5000`. You can now use the API endpoints described in the `README.md` file to interact with the product catalog.

### 5. Testing the API

You can use tools like Postman, cURL, or your browser to test the API endpoints. Make sure your MongoDB instance is running and properly connected to the server.

## API Endpoints

### GET /products

Retrieve products with optional filters, sorting, and pagination.

**Query Parameters:**

- `search` (optional): Full-text search query.
- `limit` (optional): Number of products to return (default: 10).
- `offset` (optional): Number of products to skip for pagination (default: 0).
- `sort` (optional): Sort by:
  - `priceLowToHigh`: Sort by price in ascending order.
  - `priceHighToLow`: Sort by price in descending order.
  - `dateNewest`: Sort by the newest products first.
- `minPrice` (optional): Minimum price filter.
- `maxPrice` (optional): Maximum price filter.
- `category` (optional): Filter by category name.
- `brand` (optional): Filter by brand name.

---

### GET /brands

Retrieve all unique brand names from the product catalog.

---

### GET /categories

Retrieve all unique category names from the product catalog.

---

### GET /price-range

Retrieve the minimum and maximum prices available in the product catalog.

