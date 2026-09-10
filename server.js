const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/', (req, res) => {
    res.send('API Peeker Web Global Ativa!');
});

app.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Termo ausente' });

    // Motores de busca alternativos (Brave, DuckDuckGo, SearXNG)
    const endpoints = [
        `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
        `https://searx.be/search?q=${encodeURIComponent(query)}&format=json`
    ];

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000); // 6 segundos de limite

        const response = await fetch(endpoints[1], {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        clearTimeout(timeout);

        if (!response.ok) {
            return res.status(502).json({ error: 'Erro de resposta do motor de busca' });
        }

        const data = await response.json();

        // Mapeia os resultados da busca global
        const results = (data.results || []).slice(0, 15).map(item => ({
            title: item.title,
            url: item.url,
            description: item.content || 'Sem descrição disponível.'
        }));

        res.json(results);
    } catch (error) {
        // Retorno limpo caso haja instabilidade no nó de busca
        res.status(500).json({ error: 'Servidor temporariamente indisponível. Tente novamente.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
