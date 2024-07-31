const axios = require("axios");

exports.postWaypointRota = async (req, res) => {
    try {
        const dadosWaypointRota = req.body;
        const retornoWaypointRota = await axios.post(
            "https://glad-reliably-lion.ngrok-free.app/Roteirizador/RoteirizarWaypoint",
            dadosWaypointRota
        );
        res.send(retornoWaypointRota.data);
    } catch (erro) {
        console.error("Um erro ocorreu: " + erro);
        res.status(500).json({ erro: "Erro no backend" });
    }
};