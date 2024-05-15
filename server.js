const express = require("express");
const cors = require("cors");
const routes = require("./routes/routes");
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("public"));
app.use(express.json());
app.use("/", routes);

app.listen(3000, () => {
  console.log("on na 3000");
});
