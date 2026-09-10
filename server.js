const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

// Crie uma conta gratuita em https://tavily.com e cole sua API Key abaixo
const TAVILY_API_KEY = "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";

app.get('/', (req, res) => {
    res.send('API Peeker Web Global Ativa!');
});

app.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Termo ausente' });

    try {
        const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                api_key: TAVILY_API_KEY,
                query: query,
                search_depth: "basic",
                include_answer: false,
                max_results: 10
            })
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: 'Erro ao consultar a API de busca' });
        }

        const data = await response.json();

        const results = (data.results || []).map(item => ({
            title: item.title,
            url: item.url,
            description: item.content || 'Sem descrição disponível.'
        }));

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
