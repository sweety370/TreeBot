"use strict";

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const mineflayer = require("mineflayer");

const app = express();
const server = http.createServer(app);

const PORT = Number(process.env.PORT) || 3000;

app.use(
  cors({
    origin: "*"
  })
);

app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

const bots = new Map();

/* =========================
   HEALTH
========================= */

app.get("/", (req, res) => {
  res.json({
    name: "TreeBot",
    status: "online",
    bots: bots.size
  });
});

/* =========================
   LIST BOTS
========================= */

app.get("/api/bots", (req, res) => {
  const result = [];

  for (const bot of bots.values()) {
    result.push({
      id: bot.id,
      username: bot.username,
      host: bot.host,
      port: bot.port,
      version: bot.version,
      status: bot.status
    });
  }

  res.json(result);
});

/* =========================
   START BOT
========================= */

app.post("/api/bots/start", (req, res) => {
  const {
    id,
    username,
    host,
    port = 25565,
    version
  } = req.body || {};

  if (!id || !username || !host) {
    return res.status(400).json({
      error: "id, username and host are required"
    });
  }

  if (bots.has(id)) {
    return res.status(409).json({
      error: "A bot with this id is already running."
    });
  }

  let bot;

  try {
    bot = mineflayer.createBot({
      host,
      port: Number(port),
      username,
      version: version || undefined
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }

  const botData = {
    id,
    username,
    host,
    port: Number(port),
    version: version || "auto",
    status: "connecting",
    bot
  };

  bots.set(id, botData);

  bot.once("spawn", () => {
    botData.status = "online";

    io.emit("bot:status", {
      id,
      status: "online"
    });

    console.log(
      `[TreeBot] ${username} connected to ${host}:${port}`
    );
  });

  bot.on("end", () => {
    botData.status = "offline";

    io.emit("bot:status", {
      id,
      status: "offline"
    });

    console.log(
      `[TreeBot] ${username} disconnected`
    );
  });

  bot.on("error", (error) => {
    botData.status = "error";

    io.emit("bot:status", {
      id,
      status: "error",
      message: error.message
    });

    console.error(
      `[TreeBot] ${username} error:`,
      error.message
    );
  });

  bot.on("chat", (username, message) => {
    io.emit("bot:chat", {
      id,
      username,
      message
    });
  });

  return res.status(201).json({
    success: true,
    id,
    status: "connecting"
  });
});

/* =========================
   STOP BOT
========================= */

app.post("/api/bots/stop", (req, res) => {
  const { id } = req.body || {};

  if (!id) {
    return res.status(400).json({
      error: "id is required"
    });
  }

  const botData = bots.get(id);

  if (!botData) {
    return res.status(404).json({
      error: "Bot not found"
    });
  }

  try {
    botData.bot.quit("Stopped from TreeBot");
  } catch (error) {
    console.error(
      `[TreeBot] Error stopping ${id}:`,
      error.message
    );
  }

  botData.status = "offline";

  bots.delete(id);

  io.emit("bot:status", {
    id,
    status: "offline"
  });

  return res.json({
    success: true
  });
});

/* =========================
   SOCKET.IO
========================= */

io.on("connection", (socket) => {
  console.log(
    `[TreeBot] Dashboard connected: ${socket.id}`
  );

  socket.emit(
    "bots",
    [...bots.values()].map((bot) => ({
      id: bot.id,
      username: bot.username,
      host: bot.host,
      port: bot.port,
      version: bot.version,
      status: bot.status
    }))
  );

  socket.on("disconnect", () => {
    console.log(
      `[TreeBot] Dashboard disconnected: ${socket.id}`
    );
  });
});

/* =========================
   ERROR HANDLER
========================= */

app.use((error, req, res, next) => {
  console.error(error);

  res.status(500).json({
    error: "Internal server error"
  });
});

/* =========================
   START SERVER
========================= */

server.listen(PORT, "0.0.0.0", () => {
  console.log(
    `[TreeBot] Backend running on port ${PORT}`
  );
});
