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
        // Usa o endpoint público de busca em formato JSON da web aberta
        const response = await fetch(`https://api.mojeek.com/search?q=${encodeURIComponent(query)}&fmt=json`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) {
            // Backup usando o endpoint da API publica do DuckDuckGo Instant Answer
            const fallbackResponse = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`);
            const fallbackData = await fallbackResponse.json();
            
            const results = (fallbackData.RelatedTopics || []).slice(0, 10).map(item => ({
                title: item.Text ? item.Text.split(' - ')[0] : query,
                url: item.FirstURL || '',
                description: item.Text || 'Sem descrição.'
            })).filter(item => item.url);

            return res.json(results);
        }

        const data = await response.json();

        const results = (data.response?.results || []).map(item => ({
            title: item.title,
            url: item.url,
            description: item.snippet || 'Sem descrição disponível.'
        }));

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao processar busca na web.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
