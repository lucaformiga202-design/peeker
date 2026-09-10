const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

// Nós públicos do SearXNG que agregam resultados globais (Google, Bing, DuckDuckGo, Brave, etc)
const SEARX_NODES = [
    'https://searx.prvcy.eu',
    'https://searxng.site',
    'https://searx.space',
    'https://searx.be'
];

app.get('/', (req, res) => {
    res.send('API Peeker Meta-Search Ativa!');
});

app.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Termo ausente' });

    let results = [];
    let success = false;

    // Tenta cada nó da rede até obter resposta completa
    for (const node of SEARX_NODES) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3500); // Timeout de 3.5s por nó

            const response = await fetch(`${node}/search?q=${encodeURIComponent(query)}&format=json`, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                if (data.results && data.results.length > 0) {
                    results = data.results.slice(0, 12).map(item => ({
                        title: item.title,
                        url: item.url,
                        description: item.content || 'Sem descrição disponível.'
                    }));
                    success = true;
                    break;
                }
            }
        } catch (e) {
            // Se o nó falhar ou der timeout, passa para o próximo
            continue;
        }
    }

    if (success) {
        res.json(results);
    } else {
        res.status(502).json({ error: 'Nenhum nó de busca respondeu no momento.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
