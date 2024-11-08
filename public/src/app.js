//----------------------------------SPOTIFY API----------------------------------

// Function to handle the login button click event
window.onload = function () {
    const hash = window.location.hash.substring(1).split('&').reduce(function (initial, item) {
        if (item) {
            const parts = item.split('=');
            initial[parts[0]] = decodeURIComponent(parts[1]);
        }
        return initial;
    }, {});
    window.location.hash = '';

    const access_token = hash.access_token;

    // If the current page is the index.html page
    if (document.body.id === 'index-page') {
        if (access_token) {

            // Save the access token in the local storage
            localStorage.setItem('access_token', access_token);

            // Show the search form
            document.getElementById('search-btn').addEventListener('click', () => {
                const usersSearch = document.getElementById('users-Search').value;

                const loginLink = document.getElementById('login-link');
                if (loginLink) {
                    loginLink.style.display = 'none'; // Hide the login Button
                }

                if (usersSearch) {
                    fetchArtistLogo(usersSearch, access_token); // Search for an artist or track using the Spotify Web API
                    fetchYouTubeVideo(usersSearch);// Display a YouTube video related to the search query
                }
            });
        } else {
            alert('You need to log in to Spotify.');
        }
    } else if (document.body.id === 'similar-artists-page') { 
        // Similar artists page
        const urlParams = new URLSearchParams(window.location.search);
        const artistName = urlParams.get('artist');

        if (artistName) {
            fetchLastFmApiKey()
                .then(apiKey => fetchSimilarArtists(artistName, apiKey))
                .catch(error => console.error('Erro ao obter artistas semelhantes:', error));
        }

    } else if (document.body.id === 'musics-page') { 
        
        // Musics page
        const access_token = localStorage.getItem('access_token'); // Get the access token from the local storage
    
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('query');

        console.log('Query:', query); // Depuração
        console.log('Access token:', access_token); // Depuração

        if (query && access_token) {
            // Chama a função fetchArtistOrTrack para buscar músicas
            fetchArtistTrack(query, access_token);
        } else {
            console.error('Query ou access token não disponíveis.');
            const tracksContainer = document.getElementById('tracks');
            if (tracksContainer) {
                tracksContainer.innerHTML = '<p>No tracks found.</p>';
            }
        }
    }
};

// Function to search for an artist or track using the Spotify Web API
function fetchArtistTrack(query, token) {
    if (!query) { // Check if the query is empty
        console.error('Query is undefined or null.');
        return;
    }

    const url = `https://api.spotify.com/v1/search?q=${query}&type=artist,track`;

    fetch(url, {
        headers: {
            'Authorization': 'Bearer ' + token
        }       
    })
        .then(response => {
            if (!response.ok) {
                console.error('Erro ao procurar músicas:', response.status);
                throw new Error('Erro ao procurar músicas');
            }
            return response.json();
        })
        .then(data => {
            if (data.tracks?.items.length > 0) {
                displayArtistTracks(data); 
            } else {
                const tracksContainer = document.getElementById('tracks');
                if (tracksContainer) {
                    tracksContainer.innerHTML = '<p>No tracks found.</p>';
                }
            }
        })
        .catch(error => {
            console.error('Erro ao buscar músicas:', error);
        });
}


function fetchArtistLogo(query, token) {
    if (!query) { // Check if the query is empty
        console.error('Query is undefined or null.');
        return;
    }

    const url = `https://api.spotify.com/v1/search?q=${query}&type=artist,track`;

    fetch(url, {
        headers: {
            'Authorization': 'Bearer ' + token
        }       
    })
        .then(response => {
            if (!response.ok) {
                console.error('Error fetching artist logo:', response.status);
                throw new Error('Error fetching artist logo');
            }
            return response.json();
        })
        .then(data => {
            if (data.tracks?.items.length > 0) {
                displaySearchResults(data); 
            } else {
                const logoContainer = document.getElementById('artist-info');
                if (logoContainer) {
                    logoContainer.innerHTML = '<p>No artist Logo</p>';
                }
            }
        })
        .catch(error => {
            console.error('Error getting the artist logo:', error);
        });
}
// Function to display the search results on the page
function displaySearchResults(data) {
    const artistInfoContainer = document.getElementById('artist-info'); //artist info container

    // Clear the containers
    artistInfoContainer.innerHTML = '';

    const artistResults = data.artists?.items[0]; // Security verification (?) to see if there are 1 artist found 

    // Show found artist


    if (artistResults) {
        const artistDiv = document.createElement('div');
        artistDiv.innerHTML = `
            <h2>${artistResults.name}</h2>
            <img src="${artistResults.images[0]?.url}" alt="${artistResults.name}">
        `;
        artistInfoContainer.appendChild(artistDiv);
    }

    // Show message if no artists or tracks were found
    if (!artistResults === 0) {
        resultsContainer.innerHTML = '<p>Nenhum artista encontrado.</p>';
    }
}


// Function to display only the musics of the artist in a grid of 2x4
function displayArtistTracks(data) {
    const tracksContainer = document.getElementById('tracks'); // Tracks container

    if (!tracksContainer) {
        console.error("Track element does not exist.");
        return;
    }

    // Clear the container
    tracksContainer.innerHTML = '';

    const trackResults = data.tracks?.items.slice(0, 8); // Get up to 8 tracks

    if (!trackResults || trackResults.length === 0) {
        tracksContainer.innerHTML = '<p>No tracks found.</p>';
        return;
    }

    // Create a grid container
    const gridContainer = document.createElement('div');
    gridContainer.className = 'grid-container';

    // Display the tracks in a 2x4 grid
    trackResults.forEach(track => {
        const trackDiv = document.createElement('div');
        trackDiv.classList.add('track-item');
        trackDiv.innerHTML = `
            <img src="${track.album.images[0]?.url}" alt="${track.name}">
            <p><strong>${track.name}</strong> - ${track.artists.map(artist => artist.name).join(', ')}</p>
            <audio controls src="${track.preview_url}">Your browser does not support the audio element.</audio>
        `;
        gridContainer.appendChild(trackDiv);
    });

    tracksContainer.appendChild(gridContainer);
}

//----------------------------------LAST.FM API----------------------------------

// Function to fetch similar artists from the Last.fm API

function fetchLastFmApiKey() {
    return fetch('/lastfm-key')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch Last.fm API key.'); //Debugging
            } else {
                return response.json();
            }
        })
        .then(data => {
            //console.log('Last.fm API key:', data.apiKey); // Debugging
            return data.apiKey;
        })
        .catch(error => {
            console.error('Erro ao obter a chave da API:', error);
            return null;
        });
}

function fetchSimilarArtists(artistName, apiKey) {
    const url = `https://ws.audioscrobbler.com/2.0/?method=artist.getSimilar&artist=${encodeURIComponent(artistName)}&api_key=${apiKey}&format=json&limit=8`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log("Similar artists:", data); // Debugging
            if (data && data.similarartists && data.similarartists.artist.length > 0) {
                displaySimilarArtists(data.similarartists.artist);
            } else {
                console.error('No similar artist found.', data);
                displayNoSimilarArtists(); // Display a message if no similar artists were found
            }
        })
        .catch(error => {
            console.error('Error fetching similar artists:', error);
            displayNoSimilarArtists(); // Display a message if no similar artists were found
        });
}

// Function to display similar artists on the page
function displaySimilarArtists(artists) {
    const similarArtistsContainer = document.getElementById('similar-artists-container');

    if (!similarArtistsContainer) {
        console.error('Element not found: similar-artists-container');
        return;
    }

    similarArtistsContainer.innerHTML = '<h2>Artistas Semelhantes</h2>';

    const gridContainer = document.createElement('div');
    gridContainer.className = 'grid-container';

    artists.forEach(artist => {
        const artistDiv = document.createElement('div');
        artistDiv.className = 'track-item';

        const imageUrl = artist.image[2]['#text'] || 'https://via.placeholder.com/150';

        if(!imageUrl) {
            console.error('Image URL not found:', artist);  
        }

        artistDiv.innerHTML = `
            <img src="${imageUrl}" alt="${artist.name}">
            <p><strong>${artist.name}</strong></p>
        `;
        gridContainer.appendChild(artistDiv);
    });

    similarArtistsContainer.appendChild(gridContainer);
}

function displayNoSimilarArtists() {
    const similarArtistsContainer = document.getElementById('similar-artists-container');
    if (!similarArtistsContainer) {
        console.error("Elemento 'similar-artists-container' não encontrado.");
        return;
    }

    similarArtistsContainer.innerHTML = '<p>Nenhum artista semelhante encontrado.</p>';
}

//----------------------------------Youtube API-----------------------------------

function fetchYouTubeVideo(query) {
    // Check if the query is empty
    if (!query) {
        console.error('Query is undefined or null.');
        return;
    }

    fetch(`/youtube-search?text=${encodeURIComponent(query)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch YouTube video');
            }
            return response.json();
        })
        .then(data => {
            displayYouTubeVideo(data.videoUrl);
        })
        .catch(error => {
            console.error('Error fetching YouTube video:', error);
        });
}

// Function to display the YouTube video on the page
function displayYouTubeVideo(videoUrl) {
    const videoContainer = document.getElementById('youtube-video');
    videoContainer.innerHTML = ''; // Limpar o conteúdo anterior

    // Extrair o videoId da URL
    const videoId = new URL(videoUrl).searchParams.get('v');
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;

    // Criar e configurar o iframe
    const iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.width = '560';
    iframe.height = '315';
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;

    // Adicionar o iframe ao container
    videoContainer.appendChild(iframe);
}

//----------------------------------EVENT HANDLERS--------------------------------
// Função para redirecionar para a página de artistas semelhantes
function redirectToSimilarArtistsPage() {
    const usersSearch = document.getElementById('users-Search').value;
    if (usersSearch) {
        window.location.href = `similar-artists.html?artist=${encodeURIComponent(usersSearch)}`;
    }
}

// Função para redirecionar para a página inicial
function redirectToIndexPage() {
    window.location.href = 'index.html';
}

// Function to redirect to the musics.html page
function redirectToMusicsPage() {
    const usersSearch = document.getElementById('users-Search').value;
    if (usersSearch) {
        window.location.href = `musics.html?query=${encodeURIComponent(usersSearch)}`;
    }
}

