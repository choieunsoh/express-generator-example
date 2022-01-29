const express = require("express");
const cors = require("cors");
const app = express();

const whitelist = ["http://localhost:3000", "https://localhost:3443"];
const corsOptionsDelegate = (req, callback) => {
  console.log("Origin: ", req.header("Origin"));
  const corsOptions = { origin: whitelist.includes(req.header("Origin")) };
  callback(null, corsOptions, req);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);
