const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

// Insira sua chave gratuita da Tavily (obtenha em https://tavily.com)
const TAVILY_API_KEY = "SUA_CHAVE_TAVILY_AQUI";

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
            return res.status(response.status).json({ error: 'Erro no provedor de busca' });
        }

        const data = await response.json();

        const results = (data.results || []).map(item => ({
            title: item.title,
            url: item.url,
            description: item.content || 'Sem descrição disponível.'
        }));

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
