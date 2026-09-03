const express = require('express');
const cors = require('cors');

const app = express();

// Permite requisições de qualquer origem
app.use(cors());

app.get('/', (req, res) => {
    res.send('Servidor do Peeker ativo!');
});

app.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).send('Termo ausente');

    try {
        const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
            }
        });

        if (!response.ok) {
            return res.status(response.status).send('Erro na resposta do motor de busca');
        }

        const htmlText = await response.text();
        res.send(htmlText);
    } catch (error) {
        res.status(500).send('Erro interno ao buscar');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
