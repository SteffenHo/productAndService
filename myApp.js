var express = require('express');
var repo = require('./repo');
var bodyParser = require('body-parser');
var semaphore = require('semaphore')(1);
require('dotenv').config();
var app = express();

console.log("Hello World");

app.use(bodyParser.json());

app.post("/product", async (req, res) => {
  semaphore.take(async () => {
    let result = await repo.createNewProduct(req.body);
    res.status(result.status);
    res.json(result.json);
    semaphore.leave();
  });
});

app.get("/product", async (req, res) => {
  let result = await repo.getProducts();
  res.status(result.status);
  res.json(result.json);
});

app.put("/product", async(req, res) => {
  let result = await repo.updateProduct(req.body);
  res.status(result.status);
  res.json(result.json);
})

app.get("/product/:id", async (req, res) => {
  let result = await repo.searchProduct("id", req.params.id);
  res.status(result.status);
  res.json(result.json[0]);
});

app.get("/search", async (req, res) => {
  let result = await repo.searchProduct("name", req.query.product);
  res.status(result.status);
  res.json(result.json);
});

app.get("/product/:id/dependencies", async (req, res) => {
  let result = await repo.searchDependencies(req.params.id);
  res.status(result.status);
  res.json(result.json);
});

app.put("/product/:id/dependencies", async (req, res) => {
  let result = await repo.addDependencies(req.params.id, req.body);
  res.status(result.status);
  res.json(result.json);
});

module.exports = app;
