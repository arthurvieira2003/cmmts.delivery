document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form");
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const nickname = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const data = { nickname, password };

    fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Sucesso:", data);
      })
      .catch((error) => {
        console.error("Erro:", error);
      });
  });
});
