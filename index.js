"use strict";

var mongoose = require("mongoose");
var express = require("express");
var app = require("./app");
var port = 666;
// var port = process.env.PORT || 666;

mongoose.Promise = global.Promise;
mongoose
  .connect("mongodb://localhost:27017/LynxPardelle", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(
      "la conexión a la base de datos de Lynx Pardelle Resources se ha realizado correctamente."
    );

    // Crear servidor y escuchar peticiones http
    var server = app.listen(port, () => {
      console.log("Servidor corriendo en https://localhost:666");
    });

    app.use(express.static("client"));
  })
  .catch((err) => console.log(err));
