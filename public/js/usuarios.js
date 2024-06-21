// Primeiro, vamos definir a função que irá fazer a requisição e preencher a tabela
function carregarUsuarios() {
  // Fazendo a requisição para o endpoint fornecido
  fetch("http://localhost:5219/Usuarios")
    .then((response) => response.json()) // Convertendo a resposta para JSON
    .then((data) => {
      const tabela = document.querySelector("tbody"); // Selecionando o corpo da tabela no HTML
      tabela.innerHTML = ""; // Limpando o corpo da tabela para inserir os novos dados

      // Iterando sobre cada usuário retornado pela API
      data.forEach((usuario) => {
        const linha = document.createElement("tr"); // Criando uma nova linha para cada usuário

        // Criando e adicionando as células na linha
        linha.innerHTML = `
            <td>${usuario.nome}</td>
            <td>${usuario.nickname}</td>
            <td>${usuario.email}</td>
            <td>${usuario.tipoAcesso === 1 ? "Admin" : "Usuário"}</td>
            <td>${usuario.status ? "Ativo" : "Inativo"}</td>
          `;

        tabela.appendChild(linha); // Adicionando a linha no corpo da tabela
      });
    })
    .catch((error) => console.error("Erro ao carregar os usuários:", error)); // Tratando possíveis erros na requisição
}

// Chamando a função carregarUsuarios quando a página for carregada
document.addEventListener("DOMContentLoaded", carregarUsuarios);
