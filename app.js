"use strict";

//Cargar modulos de node para crear servidos
var path = require("path");
var express = require("express");
var http = require("http");
var bodyParser = require("body-parser");
var cors = require("cors");

// Ejecutar express (http)
var app = express();

// Cargar rutas
var web_utility_routes = require("./routes/web-utility");

// Middlewares de body-parser
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000}));

// Config cabeceras y CORS
var allowedDomains = ["http://localhost:4200", "http://localhost:666",];
app.use(
  cors({
    origin: function (origin, callback) {
      // bypass the requests with no origin (like curl requests, mobile apps, etc )
      if (!origin) return callback(null, true);

      if (allowedDomains.indexOf(origin) === -1) {
        var msg = `This site ${origin} does not have an access. 
        Only specific domains are allowed to access it.`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);

// rutas body-parser
// app.use("/", express.static("client", { redirect: false }));
app.use("/api/web-utility", web_utility_routes);


/* 
app.get("*", function (req, res, next) {
  res.sendFile(path.resolve("client/index.html"));
});
 */
// Ruta o método de prueba para el API
app.get("/datos-autor", (req, res) => {
  console.log("Hola mundo");
  return res.status(200).send({
    autor: "Lynx Pardelle",
    url: "https://www.lynxpardelle.com",
  });
});

module.exports = app;
