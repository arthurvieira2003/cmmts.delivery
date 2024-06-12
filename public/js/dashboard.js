async function BuscarItensDashboard() {
    try {
        const response = await fetch('http://localhost:5219/Roteirizador/Dashboard')
        const data = await response.json();
        return data;
    } catch {
        console.error('Fetch error:', error);
    }
}

async function atualizarDashboard() {
    const dados = await BuscarItensDashboard();

    if (dados) {
        // maracutaia pra tacar no front
        document.querySelector('.card:nth-child(1) h2').innerText = dados.entreguesHoje;
        document.querySelector('.card:nth-child(2) h2').innerText = dados.entregues;
        document.querySelector('.card:nth-child(3) h2').innerText = dados.naoEntregues;
        document.querySelector('.card:nth-child(4) h2').innerText = dados.emAndamento;
    }
}

window.onload = atualizarDashboard;