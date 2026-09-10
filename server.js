const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                api_key: TAVILY_API_KEY,
                query: query,
                search_depth: "advanced",
                include_answer: false,
                max_results: 10
            })
        });

        if (!response.ok) return res.status(response.status).json({ error: 'Erro de busca' });

        const data = await response.json();

        // Ordena para garantir que a home oficial (.com, .org) fique em 1º lugar
        let rawResults = data.results || [];
        rawResults.sort((a, b) => {
            const isHomeA = new URL(a.url).pathname === '/' || new URL(a.url).pathname === '';
            const isHomeB = new URL(b.url).pathname === '/' || new URL(b.url).pathname === '';
            return isHomeB - isHomeA;
        });

        // Formata e limita o texto da descrição (máximo 120 caracteres)
        const results = rawResults.map(item => {
            let shortSnippet = item.content || 'Sem descrição disponível.';
            if (shortSnippet.length > 120) {
                shortSnippet = shortSnippet.substring(0, 120) + '...';
            }

            return {
                title: item.title,
                url: item.url,
                description: shortSnippet
            };
        });

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
