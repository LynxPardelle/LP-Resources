"use strict";

var jwt = require("jwt-simple");
var moment = require("moment");
var secret = require("../keys/secret");

exports.ensureAuth = function (req, res, next) {
  if (!req.headers.authorization) {
    return res.status(403).send({ message: "La petición no tiene la cabecera de autorización." });
  } else {
    var token = req.headers.authorization.replace(/['"]+/g, "");
  
    try {
      var payload = jwt.decode(token, secret);
      if (payload.exp <= moment().unix()) {
        throw new Error("El token ha expirado");
      } else {
        req.user = payload;
      
        next();
      }
    } catch (ex) {
      if(ex.message === "El token ha expirado"){
        return res.status(404).send({
          message: ex.message,
        });
      } else {
        return res.status(404).send({
          message: "El token no es válido",
        });
      }
    }
  }
};

exports.optionalAuth = function (req, res, next) {
  if (req && req.headers && req.headers.authorization) {
    var token = req.headers.authorization.replace(/['"]+/g, "");

    try {
      var payload = jwt.decode(token, secret);
      if (payload.exp <= moment().unix()) {
        throw new Error("El token ha expirado");
      } else {
        req.user = payload;
      }
    } catch (ex) {
      if(ex.message === "El token ha expirado"){
        return res.status(404).send({
          message: ex.message,
        });
      } else {
        return res.status(404).send({
          message: "El token no es válido",
        });
      }
    }

  }
  next();
};
