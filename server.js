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

    try {
        // Faz a busca no HTML leve do DuckDuckGo
        const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) {
            return res.status(502).json({ error: 'Erro ao conectar ao motor de busca' });
        }

        const html = await response.text();
        const results = [];

        // Expressão regular para extrair links, títulos e trechos (snippets)
        const regex = /<a class="result__url" href="([^"]+)".*?>[\s\S]*?<\/a>[\s\S]*?<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
        let match;

        while ((match = regex.exec(html)) !== null && results.length < 12) {
            const rawUrl = match[1].trim();
            const rawSnippet = match[2].replace(/<[^>]+>/g, '').trim();

            // Decodifica a URL redirecionada do DuckDuckGo se necessário
            let cleanUrl = rawUrl;
            if (rawUrl.includes('uddg=')) {
                cleanUrl = decodeURIComponent(rawUrl.split('uddg=')[1].split('&')[0]);
            }

            // Garante que o link seja absoluto
            if (cleanUrl.startsWith('//')) {
                cleanUrl = 'https:' + cleanUrl;
            }

            results.push({
                title: query,
                url: cleanUrl,
                description: rawSnippet || 'Sem descrição disponível.'
            });
        }

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Erro interno no servidor de busca' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
