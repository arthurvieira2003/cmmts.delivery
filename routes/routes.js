const express = require("express");
const router = express.Router();
const loginController = require("../controllers/loginController");
const cdController = require("../controllers/cdController");
const waypointController = require("../controllers/waypointController");
const rotaController = require("../controllers/rotaController");

router.get("/", (res) => {
  res.sendFile("index.html", { root: path.join(__dirname, "public/html") });
});

router.post("/Usuarios/Login", loginController.login);
router.post("/Roteirizador/AdicionarCentro", cdController.postCd);
router.post("/Roteirizador/AdicionarWaypoint", waypointController.postWaypoint);
router.post("/Roteirizador/AdicionarRota", rotaController.postRota);

router.get("/Roteirizador/BuscarCentrosDistribuicao", cdController.getCd);
router.get("/Roteirizador/BuscarWayPoints", waypointController.getWaypoint);
router.get("/Roteirizador/BuscarRotas", rotaController.getRota);

module.exports = router;
