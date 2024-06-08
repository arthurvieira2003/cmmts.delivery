async function BuscarItensDashboard(){
    return fetch('/Dashboard/BuscarItensDashboard')
    .then(data => {
        return data;
    })
}

document.addEventListener("DOMContentLoaded", () => {
    let dadosDashboard = BuscarItensDashboard();
    console.log(dadosDashboard)
    document.getElementById('teste').innerText = dadosDashboard.data;
})