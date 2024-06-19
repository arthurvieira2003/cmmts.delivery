const axios = require("axios");

exports.deleteWaypoint = async (req, res) => {
    try {
        const cdWaypoint = req.body;
        const retornoWaypoint = await axios.post(
            "https://glad-reliably-lion.ngrok-free.app/Roteirizador/FinalizarEntrega",
            cdWaypoint
        );
        res.send(retornoWaypoint.data);
    } catch (erro) {
        console.error("Um erro ocorreu: " + erro);
        res.status(500).json({ erro: "Erro no backend" });
    }
};