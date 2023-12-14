"use strict";

var validator = require("validator");
var fs = require("fs");
var path = require("path");
var moment = require("moment");
var nodemailer = require("nodemailer");
const cheerio = require("cheerio");
const getUrls = require("get-urls");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { parse } = require("tldts");

var controller = {
  datosAutor(req, res) {
    return res.status(200).send({
      autor: "Lynx Pardelle",
      url: "https://www.lynxpardelle.com",
    });
  },

  async toKBorMB(req, res) {
    try {
      let size = parseInt(req.params.size);
      let nSize = await ((size) => {
        if (typeof size === "number") {
          switch (true) {
            case size < 1024:
              nSize = size.toFixed(2) + "bytes";
              return nSize;
              break;
            case size > 1024 && size < 1048576:
              nSize = size / 1024;
              nSize = nSize.toFixed(2) + "kb";
              return nSize;
              break;
            case size > 1048576 && size < 1073741824:
              nSize = size / 1048576;
              nSize = nSize.toFixed(2) + "mb";
              return nSize;
              break;
            case size > 1073741824:
              nSize = size / 1048576;
              nSize = nSize.toFixed(2) + "gb";
              return nSize;
              break;
          }
        } else {
          return null;
        }
      })();
      if (!nSize) {
        throw new Error("No se pudo convertir");
      } else {
        return res.status(200).send({
          status: "success",
          size: nSize,
        });
      }
    } catch (e) {
      return res.status(500).send({
        status: "error",
        message: e.message,
      });
    }
  },

  async hexToRGBOut(req, res) {
    let hex = req.params.hex;
    let R = await hexToR(hex);
    let G = await hexToG(hex);
    let B = await hexToB(hex);

    let rgb = R + ", " + G + ", " + B;

    return res.status(200).send({
      status: "success",
      rgb: rgb,
    });

    function hexToR(h) {
      return parseInt(cutHex(h).substring(0, 2), 16);
    }
    function hexToG(h) {
      return parseInt(cutHex(h).substring(2, 4), 16);
    }
    function hexToB(h) {
      return parseInt(cutHex(h).substring(4, 6), 16);
    }
    function cutHex(h) {
      return h.charAt(0) == "#" ? h.substring(1, 7) : h;
    }
  },

  async toLinearGradientProgress(req, res) {
    let color = req.params.color;
    let progress = parseInt(req.params.progress);
    let progress_5 = progress + 5;
    if (progress_5 >= 100) {
      let progress_5 = 100;
    }
    let lG =
      "linear-gradient( 90deg, rgba(" +
      this.controller.hexToRGB(color) +
      ", 1) 0%, rgba(" +
      this.controller.hexToRGB(color) +
      ", 1) " +
      progress +
      "%, rgba(" +
      this.controller.hexToRGB(color) +
      ", 0) " +
      progress_5 +
      "%, rgba(0, 0, 0, 0) 100%)";

    return res.status(200).send({
      status: "success",
      lG: lG,
    });
  },

  scrapeMetatags(req, res) {
    // Recoger parametros por post
    var text = req.body.text;

    var urls = Array.from(getUrls(text));

    const request = urls.map(async (url) => {
      const res = await fetch(url);

      const html = await res.text();
      const $ = cheerio.load(html);

      const getMetatag = (name) =>
        $(`meta[name=${name}]`).attr("content") ||
        $(`meta[property="og:${name}"]`).attr("content") ||
        $(`meta[property="twitter:${name}"]`).attr("content");

      return {
        url,
        title: $("title").first().text(),
        favicon: $('link[rel="shortcut icon"]').attr("href"),
        description: getMetatag("description"),
        image: getMetatag("image"),
        author: getMetatag("author"),
      };
    });

    Promise.all(request).then((request) => {
      return res.status(200).send({
        message: "success",
        request,
      });
    });
  },

  async linkify(req, res) {
    try {
      let text = req.body.text;
      let textcolor = req.body.textcolor;
      let linkcolor = req.body.linkcolor;

      if (text.includes("\n")) {
        let cuts = text.split("\n");

        let textcuttedOld = "";
        let textcutted = "";
        let i = 0;
        for (let cut of cuts) {
          i++;
          if (i == 0) {
            textcutted = cut + " <br /> ";
          } else {
            textcutted = textcuttedOld + cut + " <br /> ";
          }

          textcuttedOld = textcutted;
        }

        text = textcutted;
      }

      let matches = text.match(
        /\b([A-Z])+[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?\S/gi
      );

      let realMatches = [];

      if (matches) {
        let textsplits = "";

        let harshes = [];

        let noImg = false;

        for (let i = 0; i < matches.length; i++) {
          if (matches[i] == matches[0]) {
            textsplits = '<div style="color: ' + textcolor + ' !important;" >';
          }

          let harshN = this.controller.harshify(16);

          harshes.push(harshN);

          if (
            matches[i].includes(".jpg") ||
            matches[i].includes(".png") ||
            matches[i].includes(".gif") ||
            matches[i].includes(".webp") ||
            matches[i].includes(".apng") ||
            matches[i].includes(".ico") ||
            matches[i].includes(".cur") ||
            matches[i].includes(".jfif") ||
            matches[i].includes(".pjpeg") ||
            matches[i].includes(".pjp") ||
            matches[i].includes(".svg")
          ) {
            let imagestypes = [
              ".jpg",
              ".png",
              ".gif",
              ".webp",
              ".jpeg",
              ".apng",
              ".ico",
              ".cur",
              ".jfif",
              ".pjpeg",
              ".pjp",
              ".svg",
            ];
            let iIMG = 0;
            let match = matches[i];
            for (let imgtype of imagestypes) {
              if (match.includes(imgtype)) {
                let index = match.indexOf(imgtype);

                let endOfMatch = match.length - imgtype.length;

                if (index == endOfMatch) {
                  textsplits =
                    textsplits +
                    text.replace(
                      match,
                      '<a href="' +
                        harshes[i] +
                        "1" +
                        '" target="_blank" title="' +
                        harshes[i] +
                        "2" +
                        '" >' +
                        '<img src="' +
                        harshes[i] +
                        "3" +
                        '" alt="' +
                        harshes[i] +
                        "4" +
                        '" width="90%" style="display: block; margin: 0 auto;" />' +
                        "</a>"
                    );
                } else if (iIMG >= imagestypes.length) {
                  noImg = true;
                }
              } else if (iIMG >= imagestypes.length) {
                noImg = true;
              }
            }
          } else {
            noImg = true;
          }

          if (noImg == true) {
            if (this.controller.checkForDomainSuffix(matches[i]) == true) {
              if (matches[i] == matches[0]) {
                let index = text.indexOf(matches[i]);

                let textsplit = text.split(matches[i]);

                if (index == 0) {
                  textsplits =
                    textsplits +
                    '<a style="color: ' +
                    linkcolor +
                    ' !important;" href="' +
                    harshes[0] +
                    "1" +
                    '" title="' +
                    harshes[0] +
                    "2" +
                    '" target="_blank">' +
                    harshes[0] +
                    "3" +
                    "</a>" +
                    textsplit[0];
                } else {
                  textsplits =
                    textsplits +
                    textsplit[0] +
                    '<a style="color: ' +
                    linkcolor +
                    ' !important;" href="' +
                    harshes[0] +
                    "1" +
                    '" title="' +
                    harshes[0] +
                    "2" +
                    '" target="_blank">' +
                    harshes[0] +
                    "3" +
                    "</a>";
                }

                if (textsplit[1]) {
                  textsplits = textsplits + textsplit[1];
                }
              }

              if (matches[i] != matches[0]) {
                let textsplit = text.split(matches[i]);

                textsplits =
                  textsplit[0] +
                  '<a style="color: ' +
                  linkcolor +
                  ' !important;" href="' +
                  harshes[i] +
                  "1" +
                  '" title="' +
                  harshes[i] +
                  "2" +
                  '" target="_blank">' +
                  harshes[i] +
                  "3" +
                  "</a>";

                if (textsplit[1]) {
                  textsplits = textsplits + textsplit[1];
                }
              }

              realMatches.push(matches[i]);
            } else {
              let textsplit = text.split(matches[i]);
              textsplits = textsplit[0] + harshes[i] + "1";
              if (textsplit[1]) {
                textsplits = textsplits + textsplit[1];
              }
            }
          }

          if (i >= matches.length - 1) {
            textsplits = textsplits + "</div>";
          }

          text = textsplits;
        }

        for (let i = 0; i < harshes.length; i++) {
          text = text.replace(harshes[i] + "1", matches[i]);
          text = text.replace(harshes[i] + "2", matches[i]);
          text = text.replace(harshes[i] + "3", matches[i]);
          text = text.replace(harshes[i] + "4", matches[i]);
        }
      } else {
        text =
          '<div style="color: ' +
          textcolor +
          ' !important;" >' +
          text +
          "</div>";
      }

      return res.status(200).send({
        status: "success",
        result: { text: text, matches: realMatches },
      });
    } catch (err) {
      return res.status(200).send({
        status: "success",
        message: err.message,
      });
    }
  },

  harshifyOut(req, res) {
    let length = parseInt(req.params.length);
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 -+/*%$#!&/()=.,{}´+¨*[]:;_¡?¿|°";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return res.status(200).send({
      status: "success",
      result: result,
    });
  },

  // Inside
  async hexToRGBOut(hex) {
    let R = await hexToR(hex);
    let G = await hexToG(hex);
    let B = await hexToB(hex);

    let rgb = R + ", " + G + ", " + B;

    return rgb;

    function hexToR(h) {
      return parseInt(cutHex(h).substring(0, 2), 16);
    }
    function hexToG(h) {
      return parseInt(cutHex(h).substring(2, 4), 16);
    }
    function hexToB(h) {
      return parseInt(cutHex(h).substring(4, 6), 16);
    }
    function cutHex(h) {
      return h.charAt(0) == "#" ? h.substring(1, 7) : h;
    }
  },

  checkForDomainSuffix(string) {
    let stringparsed = parse(string);

    if (stringparsed.isIcann == true) {
      return true;
    } else {
      return false;
    }
  },

  harshify(length) {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 -+/*%$#!&/()=.,{}´+¨*[]:;_¡?¿|°";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  },
}; //end controller

module.exports = controller;
