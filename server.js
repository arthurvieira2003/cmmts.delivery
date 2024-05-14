const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));
app.use(express.json());

app.get("/", (res) => {
  res.sendFile("index.html", { root: path.join(__dirname, "public/html") });
});

app.post("/Usuarios/Login", async (req, res) => {
  try {
    const dadosLogin = req.body

    const retornoLogin = await axios.post("http://localhost:5219/Usuarios/Login", dadosLogin)

    res.send(retornoLogin.data)
  } catch (erro){
    console.error("Um erro ocorreu: " + erro)
    res.status(500).json({ erro: "Erro no backend" })
  }
})

app.listen(3000, () => {
  console.log("on na 3000");
});