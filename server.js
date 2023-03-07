const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(cors());
const port = 3000;

// secret key for JWT token
const secretKey = "mysecretkey";

// sample product data
let products = [
  { id: 1, name: "Product 1", price: 10 },
  { id: 2, name: "Product 2", price: 20 },
  { id: 3, name: "Product 3", price: 30 },
];

// middleware to parse request body
app.use(bodyParser.json());

// middleware to authenticate requests
function authenticate(req, res, next) {
  // get the JWT token from the Authorization header
  const token = req.headers?.authorization?.split?.(" ")?.[1];
  if (token) {
    // verify the token
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token" });
      }
      // add the decoded user object to the request object
      req.user = decoded;
      next();
    });
  } else {
    return res.status(401).json({ message: "Not authorized" });
  }
}

// login route to generate JWT token
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  console.log("req.body: ", req.body);
  // check the username and password (for simplicity, we'll just use hardcoded values here)
  if (username === "admin" && password === "admin123") {
    // generate JWT token with a user object
    const token = jwt.sign({ username: "admin" }, secretKey);
    return res.json({ token });
  }
  return res.status(401).json({ message: "Invalid credentials" });
});

// route to get all products
app.get("/products", authenticate, (req, res) => {
  //connect to db
  //get products
  res.json(products);
});

// route to create a new product
app.post("/products", authenticate, (req, res) => {
  const { name, price } = req.body;
  // generate a new ID for the product
  const id = products.length + 1;
  const newProduct = { id, name, price };
  products.push(newProduct);
  res.json(newProduct);
});

// route to update a product
app.put("/products/:id", authenticate, (req, res) => {
  const id = parseInt(req.params.id);
  const { name, price } = req.body;
  const index = products.findIndex((p) => p.id === id);
  if (index >= 0) {
    products[index].name = name;
    products[index].price = price;
    res.json(products[index]);
  } else {
    res.status(404).json({ message: `Product with ID ${id} not found` });
  }
});

// route to delete a product
app.delete("/products/:id", authenticate, (req, res) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex((p) => p.id === id);
  if (index >= 0) {
    products.splice(index, 1);
    res.json({ message: `Product with ID ${id} deleted` });
  } else {
    res.status(404).json({ message: `Product with ID ${id} not found` });
  }
});

// start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
