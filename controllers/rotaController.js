const axios = require("axios");

exports.postRota = async (req, res) => {
    try {
        const dadosRota = req.body;
        const retornoRota = await axios.post(
            "http://localhost:5219/Roteirizador/AdicionarRota",
            dadosRota
        );
        res.send(retornoRota.data);
    } catch (erro) {
        console.error("Um erro ocorreu: " + erro);
        res.status(500).json({ erro: "Erro no backend" });
    }
};

exports.getRota = async (req, res) => {
    try {
        const dadosRota = req.body;
        const retornoRota = await axios.get(
            "http://localhost:5219/Roteirizador/BuscarRotas",
            dadosRota
        );
        res.send(retornoRota.data);
    } catch (erro) {
        console.error("Um erro ocorreu: " + erro);
        res.status(500).json({ erro: "Erro no backend" });
    }
};