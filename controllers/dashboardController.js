const axios = require("axios");

exports.getDashboard = async (res) => {
    try {
        const retornoDashboard = await axios.get(
            "https://glad-reliably-lion.ngrok-free.app/Roteirizador/Dashboard"
        );
        res.send(retornoDashboard.data);
    } catch (erro) {
        console.error("Um erro ocorreu: " + erro);
        res.status(500).json({ erro: "Erro no backend" });
    }
};