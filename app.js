"use strict";

// Winklerbingo namespace
global.wb = {
  io: null,
  roomMap: null,
  wordMap: null
};

const express = require("express"),
  http = require("http"),
  favicon = require("serve-favicon"),
  path = require("path"),
  socket = require("socket.io"),
  debug = require("debug")("wb"),
  // wB scripts
  wB_Socket_In = require("./scripts/wB_Socket_In"),
  app = express();

app.set("port", /*process.env.PORT || */ 1510);

app.use(express.static(__dirname + "/public"));
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));

const server = http.createServer(app).listen(app.get("port"), () => {
  console.log("Meddl Loide! Port: " + app.get("port"));
});

global.wb.io = socket(server);
global.wb.io.on("connection", socket => {
  debug(` --- ${socket.id} connected --- `);
  wB_Socket_In.addEvents(socket);
});
