const axios = require("axios");

exports.postWaypoint = async (req, res) => {
    try {
        const dadosWaypoint = req.body;
        const retornoWaypoint = await axios.post(
            "http://localhost:5219/Roteirizador/AdicionarWaypoint",
            dadosWaypoint
        );
        res.send(retornoWaypoint.data);
    } catch (erro) {
        console.error("Um erro ocorreu: " + erro);
        res.status(500).json({ erro: "Erro no backend" });
    }
};

exports.getWaypoint = async (req, res) => {
    try {
        const dadosWaypoint = req.body;
        const retornoWaypoint = await axios.get(
            "http://localhost:5219/Roteirizador/BuscarWayPoints",
            dadosWaypoint
        );
        res.send(retornoWaypoint.data);
    } catch (erro) {
        console.error("Um erro ocorreu: " + erro);
        res.status(500).json({ erro: "Erro no backend" });
    }
};