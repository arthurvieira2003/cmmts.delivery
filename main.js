const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    if (parsedUrl.pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Olá, Node.js!');
    } else if (parsedUrl.pathname === '/about') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Página sobre!');
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Página não encontrada!');
    }
});

server.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
