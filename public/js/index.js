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
      .then((response) => {
        if (!response.ok) {
          throw new Error('Erro na resposta do servidor');
        }
        return response.json();
      })
      .then((data) => {
        console.log(data)
        if (data.successo) {
          console.log("Sucesso:", data);
          window.location.href = "./html/dashboard.html";
        } else {
          console.error("Erro de login:", data.message);
          alert("Falha no login: " + data.message);
        }
      })
      .catch((error) => {
        console.error("Erro:", error);
        alert("Ocorreu um erro ao tentar fazer login. Tente novamente mais tarde.");
      });
  });
});
