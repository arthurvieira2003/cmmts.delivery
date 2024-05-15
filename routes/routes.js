const express = require("express");
const router = express.Router();
const loginController = require("../controllers/loginController");

router.get("/", (res) => {
  res.sendFile("index.html", { root: path.join(__dirname, "public/html") });
});

router.post("/Usuarios/Login", loginController.login);

module.exports = router;
