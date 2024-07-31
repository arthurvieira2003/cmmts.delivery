const axios = require("axios");

exports.postCd = async (req, res) => {
    try {
        const dadosCd = req.body;
        const retornoPostCd = await axios.post(
            "https://glad-reliably-lion.ngrok-free.app/Roteirizador/AdicionarCentro",
            dadosCd
        );
        res.send(retornoPostCd.data);
    } catch (erro) {
        console.error("Um erro ocorreu: " + erro);
        res.status(500).json({ erro: "Erro no backend" });
    }
};

exports.getCd = async (req, res) => {
    try {
        const dadosCd = req.body;
        const retornoPostCd = await axios.get(
            "https://glad-reliably-lion.ngrok-free.app/Roteirizador/BuscarCentrosDistribuicao",
            dadosCd
        );
        res.send(retornoPostCd.data);
    } catch (erro) {
        console.error("Um erro ocorreu: " + erro);
        res.status(500).json({ erro: "Erro no backend" });
    }
};