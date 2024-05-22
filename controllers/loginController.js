const axios = require("axios");

exports.login = async (req, res) => {
  try {
    const dadosLogin = req.body;
    const retornoLogin = await axios.post(
      "http://localhost:5219/Usuarios/Login",
      dadosLogin
    );
    res.send(retornoLogin.data);
  } catch (erro) {
    console.error("Um erro ocorreu: " + erro);
    res.status(500).json({ erro: "Erro no backend" });
  }
};