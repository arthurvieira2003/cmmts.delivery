// Valida a senha com a confirmação de senha
document.getElementById("form").addEventListener("submit", function (event) {
  // Pega as senhas do formulário
  let password = document.getElementById("password");
  let confirmPassword = document.getElementById("password-confirm");

  // Verifica se as senhas são iguais
  if (password.value !== confirmPassword.value) {
    // Se as senhas não são iguais, muda a borda do campo para vermelho e mostra a mensagem de erro
    confirmPassword.style.borderColor = "red";
    document.getElementById("password-error").style.display = "block";
    event.preventDefault();
  } else {
    // Se as senhas são iguais, muda a borda do campo para verde e esconde a mensagem de erro
    confirmPassword.style.borderColor = "green";
    document.getElementById("password-error").style.display = "none";
  }
});

// Insere o registro do usuário no banco de dados, pela rota user
document.getElementById("form").addEventListener("submit", function (event) {
  event.preventDefault();

  let email = document.getElementById("email").value;
  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;

  fetch("/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      username: username,
      password: password,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});
