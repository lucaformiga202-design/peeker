const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

// INSIRA A SUA CHAVE DO SERPER AQUI
const SERPER_API_KEY = "04ea87ee6b96fe5875c2820a21c2c9fa58dcd7cb";

app.get('/', (req, res) => {
    res.send('API Peeker Ativa!');
});

app.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Termo ausente' });

    try {
        const response = await fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: {
                'X-API-KEY': SERPER_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                q: query,
                gl: 'br',
                hl: 'pt-br'
            })
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: 'Erro na requisição da API' });
        }

        const data = await response.json();

        // Mapeia os resultados orgânicos do Google
        const results = (data.organic || []).map(item => ({
            title: item.title,
            url: item.link,
            description: item.snippet || 'Sem descrição disponível.'
        }));

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
