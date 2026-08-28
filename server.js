
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const mineflayer = require("mineflayer");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

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

/* =========================
   BOT STORAGE
========================= */

const bots = new Map();

/* =========================
   HEALTH CHECK
========================= */

app.get("/", (req, res) => {
  res.json({
    name: "TreePots",
    status: "online",
    bots: bots.size
  });
});

/* =========================
   BOT LIST
========================= */

app.get("/api/bots", (req, res) => {
  const list = [...bots.values()].map((bot) => ({
    id: bot.id,
    username: bot.username,
    host: bot.host,
    port: bot.port,
    status: bot.status
  }));

  res.json(list);
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
  } = req.body;

  if (!id || !username || !host) {
    return res.status(400).json({
      error: "id, username and host are required"
    });
  }

  if (bots.has(id)) {
    return res.status(409).json({
      error: "Bot already exists"
    });
  }

  let bot;

  try {
    bot = mineflayer.createBot({
      host,
      port: Number(port),
      username,
      version: version || false
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

    io.emit("botStatus", {
      id,
      status: "online"
    });

    console.log(
      `Bot ${id} connected to ${host}:${port}`
    );
  });

  bot.on("end", () => {
    botData.status = "offline";

    io.emit("botStatus", {
      id,
      status: "offline"
    });

    console.log(`Bot ${id} disconnected`);
  });

  bot.on("error", (error) => {
    botData.status = "error";

    io.emit("botStatus", {
      id,
      status: "error",
      message: error.message
    });

    console.error(
      `Bot ${id} error:`,
      error.message
    );
  });

  res.json({
    success: true,
    id,
    status: "connecting"
  });
});

/* =========================
   STOP BOT
========================= */

app.post("/api/bots/stop", (req, res) => {
  const { id } = req.body;

  const botData = bots.get(id);

  if (!botData) {
    return res.status(404).json({
      error: "Bot not found"
    });
  }

  try {
    botData.bot.quit("Stopped from TreePots");
  } catch (error) {
    console.error(
      "Bot stop error:",
      error.message
    );
  }

  bots.delete(id);

  io.emit("botStatus", {
    id,
    status: "offline"
  });

  res.json({
    success: true
  });
});

/* =========================
   SOCKET.IO
========================= */

io.on("connection", (socket) => {
  console.log(
    "Dashboard connected:",
    socket.id
  );

  socket.emit(
    "bots",
    [...bots.values()].map((bot) => ({
      id: bot.id,
      username: bot.username,
      host: bot.host,
      port: bot.port,
      status: bot.status
    }))
  );

  socket.on("disconnect", () => {
    console.log(
      "Dashboard disconnected:",
      socket.id
    );
  });
});

/* =========================
   ERROR HANDLER
========================= */

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    error: "Internal server error"
  });
});

/* =========================
   START SERVER
========================= */

server.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `TreePots backend running on port ${PORT}`
    );
  }
);
