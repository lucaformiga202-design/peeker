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
        // Busca via API de Tópicos do DuckDuckGo
        const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`);
        const data = await response.json();

        const results = [];

        // Adiciona a resposta principal se existir
        if (data.AbstractText && data.AbstractURL) {
            results.push({
                title: data.Heading || query,
                url: data.AbstractURL,
                description: data.AbstractText
            });
        }

        // Adiciona os tópicos relacionados
        if (data.RelatedTopics && data.RelatedTopics.length > 0) {
            data.RelatedTopics.forEach(item => {
                if (item.FirstURL && item.Text) {
                    results.push({
                        title: item.Text.split(' - ')[0] || item.Text,
                        url: item.FirstURL,
                        description: item.Text
                    });
                }
            });
        }

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Erro interno na busca' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
