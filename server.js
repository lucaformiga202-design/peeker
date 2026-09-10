const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

// Lista de instâncias públicas do SearXNG para alternância automática
const SEARX_INSTANCES = [
    'https://searx.be',
    'https://searx.prvcy.eu',
    'https://searxng.site',
    'https://searx.space'
];

app.get('/', (req, res) => {
    res.send('API Peeker Ativa!');
});

app.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Termo ausente' });

    let results = [];
    let success = false;

    // Tenta cada instância até uma responder com sucesso
    for (const instance of SEARX_INSTANCES) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

            const response = await fetch(`${instance}/search?q=${encodeURIComponent(query)}&format=json`, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                if (data.results && data.results.length > 0) {
                    results = data.results.map(item => ({
                        title: item.title,
                        url: item.url,
                        description: item.content || 'Sem descrição disponível.'
                    }));
                    success = true;
                    break;
                }
            }
        } catch (e) {
            // Se falhar, tenta a próxima instância do loop
            continue;
        }
    }

    if (success) {
        res.json(results);
    } else {
        res.status(502).json({ error: 'Nenhum motor de busca respondeu no momento.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
