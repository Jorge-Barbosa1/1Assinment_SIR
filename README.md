# Spotify, Last.fm e YouTube Music Search App

Esta webApp permite ao utilizador buscar informações sobre artistas usando as APIs do Spotify, Last.fm e YouTube. O utili pode realizar buscas por músicas e artistas, visualizar sugestões de artistas semelhantes e assistir a vídeos do YouTube relacionados ao termo pesquisado.

## Recursos Principais

- **Autenticação Spotify**: Login e acesso a informações de músicas e artistas.
- **Busca de Artistas Semelhantes**: Utiliza a API do Last.fm para sugerir artistas relacionados.
- **Busca de Vídeos no YouTube**: Mostra vídeos relacionados ao artista ou música pesquisada.

## Requisitos de Ambiente

- Node.js (versão 14 ou superior)
- Conta no Spotify Developer, Last.fm e Google Cloud Console para obter as chaves de API

## Configuração do Ambiente

1. **Clonar o Repositório**:

    ```bash
    git clone https://github.com/seu_usuario/seu_repositorio.git
    cd seu_repositorio
    ```

2. **Instalar Dependências**:

    ```bash
    npm install express axios dotenv querystring
    ```

3. **Configurar Variáveis de Ambiente**:

    Crie um arquivo `.env` na raiz do projeto e adicione suas chaves de API:

    ```plaintext
    SPOTIFY_CLIENT_ID=your_spotify_client_id
    SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
    LASTFM_CLIENT_ID=your_lastfm_client_id
    YOUTUBE_API_KEY=your_youtube_api_key
    ```

4. **Definir o Redirect URI no Spotify Developer Dashboard**:

    No painel do Spotify Developer, defina `http://localhost:3000/callback` como o Redirect URI.

## Como Executar

1. **Inicie o Servidor**:

    ```bash
    node server.js
    ```

2. **Abra o Aplicativo**:

    Acesse `http://localhost:3000` em seu navegador.

## Estrutura de Arquivos

- **server.js**: Configurações do servidor e autenticação com o Spotify, além de rotas para a busca no Last.fm e YouTube.
- **public/app.js**: Manipulação do DOM e integração com as APIs para mostrar dados no front-end.
- **public/index.html**: Página inicial com o formulário de busca.
- **public/similar-artists.html**: Exibe artistas semelhantes.
- **public/musics.html**: Exibe uma lista de músicas de um artista.

## Endpoints

- **GET /login**: Redireciona para a autenticação do Spotify.
- **GET /callback**: Recebe o callback do Spotify com o token de acesso.
- **GET /refresh_token**: Atualiza o token de acesso do Spotify.
- **GET /lastfm-key**: Obtém a chave da API do Last.fm.
- **GET /youtube-search**: Realiza a busca por vídeos no YouTube.

## Funcionalidades e Fluxo do Aplicativo

1. **Autenticação com Spotify**:
    - O usuário faz login para permitir o uso da API do Spotify.
    - O token de acesso obtido é usado para buscar informações de músicas e artistas.

2. **Busca de Artistas Semelhantes (Last.fm)**:
    - Com base no nome do artista, a API do Last.fm sugere artistas relacionados.

3. **Busca de Vídeos no YouTube**:
    - A integração com a API do YouTube permite visualizar vídeos relacionados ao termo pesquisado.

## Erros Comuns e Soluções

- **TypeError: Cannot set properties of null**:
    - Verifique se os elementos DOM estão carregados antes de acessá-los. Garanta que os IDs usados nas funções estejam corretos e que as páginas correspondentes existam.


