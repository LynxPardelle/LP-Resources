'use strict'

exports.isROTARTSINIMDA = function (req, res, next) {
  if (req.user.role != 'ROTARTSINIMDA') {
    return res.status(200).send({ message: 'No tienes acceso a esta zona.' });
  } else {
    next();
  }
};