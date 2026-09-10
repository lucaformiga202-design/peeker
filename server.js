const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/', (req, res) => {
    res.send('API Peeker Ativa!');
});

app.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Termo ausente' });

    try {
        // Requisição para a instância JSON pública do SearXNG
        const response = await fetch(`https://searx.be/search?q=${encodeURIComponent(query)}&format=json`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) {
            // Se a instância padrão falhar, tenta uma instância alternativa
            const altResponse = await fetch(`https://searx.space/search?q=${encodeURIComponent(query)}&format=json`);
            const altData = await altResponse.json();
            
            const altResults = (altData.results || []).slice(0, 10).map(item => ({
                title: item.title,
                url: item.url,
                description: item.content || 'Sem descrição.'
            }));

            return res.json(altResults);
        }

        const data = await response.json();
        
        const results = (data.results || []).slice(0, 10).map(item => ({
            title: item.title,
            url: item.url,
            description: item.content || 'Sem descrição.'
        }));

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Falha ao processar requisição no servidor.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
