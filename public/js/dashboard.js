async function BuscarItensDashboard() {
  try {
    const response = await fetch(
      "http://localhost:5219/Roteirizador/Dashboard"
    );
    const data = await response.json();
    console.log(data);
    return data;
  } catch {
    console.error("Fetch error:", error);
  }
}

async function atualizarDashboard() {
  const dados = await BuscarItensDashboard();

  if (dados) {
    // maracutaia pra tacar no front
    document.querySelector(".card:nth-child(1) h2").innerText =
      dados.entreguesHoje;
    document.querySelector(".card:nth-child(2) h2").innerText = dados.entregues;
    document.querySelector(".card:nth-child(3) h2").innerText =
      dados.naoEntregues;
    document.querySelector(".card:nth-child(4) h2").innerText =
      dados.emAndamento;
  }
}

// Carrega a API de visualização e o pacote corechart
google.charts.load("current", { packages: ["corechart"] });

// Define a função de callback para quando a API for carregada
google.charts.setOnLoadCallback(drawChart);
google.charts.setOnLoadCallback(drawPieChart);

async function drawChart() {
  const dados = await BuscarItensDashboard();

  if (dados) {
    // Cria a tabela de dados
    var data = new google.visualization.DataTable();
    data.addColumn("string", "Categoria");
    data.addColumn("number", "Quantidade");
    data.addRows([
      ["Entregues Hoje", dados.entreguesHoje],
      ["Entregues", dados.entregues],
      ["Não Entregues", dados.naoEntregues],
      ["Em Andamento", dados.emAndamento],
    ]);

    // Opções do gráfico
    var options = {
      title: "Resumo de Entregas",
      width: 500,
      height: 400,
    };

    // Instancia e desenha o gráfico de barras, passando as opções
    var chart = new google.visualization.ColumnChart(
      document.getElementById("bar_chart_div")
    );
    chart.draw(data, options);
  }
}

async function drawPieChart() {
  const dados = await BuscarItensDashboard(); // Substitua por sua função de busca de dados

  if (dados) {
    // Cria a tabela de dados
    var data = new google.visualization.DataTable();
    data.addColumn("string", "Categoria");
    data.addColumn("number", "Quantidade");
    data.addRows([
      ["Entregues", dados.entregues],
      ["Não Entregues", dados.naoEntregues],
      ["Em Andamento", dados.emAndamento],
    ]);

    // Opções do gráfico
    var options = {
      title: "Status das Entregas",
      width: 550,
      height: 450,
    };

    // Instancia e desenha o gráfico de pizza, passando as opções
    var chart = new google.visualization.PieChart(
      document.getElementById("pie_chart_div")
    );
    chart.draw(data, options);
  }
}

window.onload = atualizarDashboard;
