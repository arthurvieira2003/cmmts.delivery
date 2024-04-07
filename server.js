const express = require("express");
const userRoutes = require("./routes/userRoutes");
const User = require("./models/user"); // Importe o modelo User
const app = express();
const port = 3000;

app.use(express.json());
app.use("/users", userRoutes);

// Cria a tabela de usuários se ela não existir
User.sync().then(() => {
  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
});
