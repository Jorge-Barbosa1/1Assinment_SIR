// Código par o servidor Node.js que faz a autenticação com o Spotify
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const querystring = require('querystring');

const app = express();
const port = 3000;

// Spotify API Keys
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = 'http://localhost:3000/callback';

app.use(express.static(__dirname + '/public'));

// Rota para o login com Spotify
app.get('/login', (req, res) => {
    const scope = 'user-read-private user-read-email';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri
        }));
});

// Rota para receber o callback do Spotify
app.get('/callback', (req, res) => {
    const code = req.query.code || null;

    const authOptions = {
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        data: new URLSearchParams({
            code: code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code'
        }),
        headers: {
            'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    axios(authOptions)
        .then(response => {
            const access_token = response.data.access_token;
            const refresh_token = response.data.refresh_token;

            // Redireciona para a página principal com o token de acesso
            res.redirect('/#' +
                querystring.stringify({
                    access_token: access_token,
                    refresh_token: refresh_token
                }));
        })
        .catch(error => {
            console.error('Erro ao obter o token de acesso:', error);
            res.redirect('/#' +
                querystring.stringify({
                    error: 'invalid_token'
                }));
        });
});

// Rota para o refresh do token
app.get('/refresh_token', (req, res) => {
    const refresh_token = req.query.refresh_token;

    const authOptions = {
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        data: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        }),
        headers: {
            'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    axios(authOptions)
        .then(response => {
            const access_token = response.data.access_token;
            res.send({
                access_token: access_token
            });
        })
        .catch(error => {
            console.error('Erro ao atualizar o token:', error);
            res.status(500).send('Erro ao atualizar o token');
        });
});
//----------------------LastFM API----------------------------------------------
app.get('/lastfm-key', (req, res) => {
    const lastFmApiKey = process.env.LASTFM_CLIENT_ID;
    //console.log('LastFM API Key:', lastFmApiKey);// Debugging
    if (lastFmApiKey) {
        res.json({
            apiKey: lastFmApiKey
        });
    } else {
        console.error('Erro ao obter a chave da API do Last.fm');
        res.status(500).send('Erro ao obter a chave da API do Last.fm');
    }
});
//---------------------------Youtube API-----------------------------------------------

app.get('/youtube-search', async (req, res) => {
    const searchQuery = req.query.text;

    if (!searchQuery) {
        console.log('Missing search query');
        return res.status(400).send('Missing search query');
    }

    const youtubeApiKey = process.env.YOUTUBE_API_KEY;

    try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                part: 'snippet',
                q: searchQuery,
                key: youtubeApiKey,
                maxResults: 1,
                type: 'video'
            }
        });

        const video = response.data.items[0];
        if (!video) {
            console.log('No video found for the search query:', searchQuery);
            return res.status(404).send('No video found');
        }

        const videoUrl = `https://www.youtube.com/watch?v=${video.id.videoId}`;
        res.json({ videoUrl });
    } catch (error) {
        console.error('Error fetching video from YouTube:', error.message);
        res.status(500).send('Error fetching video from YouTube');
    }
});
//------------------------Start Server----------------------------------------------
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});