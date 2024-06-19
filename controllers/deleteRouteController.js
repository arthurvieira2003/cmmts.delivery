const axios = require("axios");

exports.deleteRoute = async (req, res) => {
    try {
        const cdRota = req.body;
        const retornoDeleteRota = await axios.delete(
            "https://glad-reliably-lion.ngrok-free.app/Roteirizador/DeletarRota",
            cdRota
        );
        res.send(retornoDeleteRota.data);
    } catch (erro) {
        console.error("Um erro ocorreu: " + erro);
        res.status(500).json({ erro: "Erro no backend" });
    }
};