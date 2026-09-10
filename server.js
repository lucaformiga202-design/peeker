const express = require('express');
const cors = require('cors');
const { search } = require('duck-duck-scrape');

const app = express();
app.use(cors());

app.get('/', (req, res) => {
    res.send('API Peeker Ativa!');
});

app.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Termo ausente' });

    try {
        // Realiza busca na web inteira via DuckDuckGo
        const searchResults = await search(query, {
            safeSearch: 0
        });

        // Formata os resultados para o frontend
        const results = searchResults.results.map(item => ({
            title: item.title,
            url: item.url,
            description: item.snippet || 'Sem descrição disponível.'
        }));

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao realizar a busca na web' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
