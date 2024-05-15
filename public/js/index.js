document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form");
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const nickname = document.getElementById("username").value;
    const senha = document.getElementById("password").value;

    const data = {
      "nickname": nickname,
      "senha": senha
    };

    fetch("/Usuarios/Login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Sucesso:", data);
        window.location.href = "./html/mapa.html";
      })
      .catch((error) => {
        console.error("Erro:", error);
      });
  });
});
