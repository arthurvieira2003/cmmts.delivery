const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
app.use(express.json());

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public/pages")));

// Rota que serve o index.html
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: path.join(__dirname, "public") });
});

app.post("/login", async (req, res) => {
  const { nickname, password } = req.body;

  try {
    const response = await axios.post("http://localhost:5219/Usuarios/Login", {
      nickname,
      password,
    });

    if (response.data.successo) {
      res.json({ sucesso: true });
    } else {
      res.status(401).json({ sucesso: false });
    }
  } catch (error) {
    console.error("Erro:", error);
    res.status(500).json({ sucesso: false });
  }
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
