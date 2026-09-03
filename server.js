const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/', (req, res) => {
    res.send('API Peeker SearXNG Ativa!');
});

app.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Termo ausente' });

    try {
        // Usa uma instância pública estável do SearXNG
        const searchUrl = `https://searx.be/search?q=${encodeURIComponent(query)}&format=json`;
        
        const response = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: 'Erro ao consultar o motor de busca' });
        }

        const data = await response.json();
        
        // Formata os resultados da web obtidos de múltiplos motores (Google, Bing, DuckDuckGo, etc.)
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
