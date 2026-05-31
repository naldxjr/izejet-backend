require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const path = require("path");
const { graphqlHTTP } = require("express-graphql");

const schema = require("./graphql/schema");
const Perfil = require("./models/Perfil");
const usuarios = require("./routes/usuarios");
const catalogo = require("./routes/catalogo");
const reservas = require("./routes/reservas");

const app = express();

const isProduction = process.env.NODE_ENV === "production";
const mongoUri = process.env.MONGO_URI;
const mongoDbName = process.env.MONGO_DB_NAME;

if (!mongoUri) {
  process.exit(1);
}

const mongoOptions = mongoDbName ? { dbName: mongoDbName } : {};

mongoose.connect(mongoUri, mongoOptions)
  .then(() => {
    console.log("[IzeJet API] Conexao com o MongoDB estabelecida.");
    return Perfil.syncIndexes();
  })
  .catch(err => {
    console.error("[IzeJet API] Erro critico ao conectar no MongoDB:", err.message);
  });

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10kb" }));

app.use("/api/usuarios", usuarios);
app.use("/api/catalogo", catalogo);
app.use("/api/reservas", reservas);
app.use("/api/perfil", require("./routes/perfil"));

const pastaAdminBuild = path.join(__dirname, "admin/dist");
app.use(express.static(pastaAdminBuild));

app.use("/graphql", (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ") && process.env.JWT_SECRET) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (err) {
    }
  }
  next();
}, graphqlHTTP(req => ({
  schema,
  graphiql: !isProduction,
  context: { user: req.user }
})));

app.get("*", (req, res) => {
  if (!req.path.startsWith("/api") && !req.path.startsWith("/graphql")) {
    res.sendFile(path.join(pastaAdminBuild, "index.html"));
  }
});

app.use((err, req, res, next) => {
  res.status(500).json({
    msg: isProduction ? "Erro interno no servidor." : err.message
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[IzeJet API] Servidor operacional na porta ${PORT}`);
  console.log(`[IzeJet API] Ambiente ativo: ${isProduction ? "Producao" : "Desenvolvimento"}`);
});

const encerarProcessoLimpo = () => {
  if (server) {
    server.close(() => {
      mongoose.connection.close(false)
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGTERM", () => encerarProcessoLimpo());
process.on("SIGINT", () => encerarProcessoLimpo());

process.on("unhandledRejection", (err) => {
  console.error("[IzeJet API] Rejeicao nao tratada detectada:", err);
  encerarProcessoLimpo();
});

process.on("uncaughtException", (err) => {
  console.error("[IzeJet API] Excecao nao tratada detectada:", err);
  encerarProcessoLimpo();
});