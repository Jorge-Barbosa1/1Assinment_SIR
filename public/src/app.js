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
    //console.log('Access Token:', access_token); // Debugging

    // If the current page is the index.html page
    if (document.body.id === 'index-page') {

        if (access_token) {
            document.getElementById('search-btn').addEventListener('click', () => {
                const usersSearch = document.getElementById('users-Search').value;

                //console.log('Search:', usersSearch); // Debugging
                //console.log('Access Token:', access_token); // Debugging

                const loginLink = document.getElementById('login-link');
                if (loginLink) {
                    loginLink.style.display = 'none'; // Hide the login Button
                }

                if (usersSearch) {
                    searchArtistOrTrack(usersSearch, access_token); // Search for an artist or track using the Spotify Web API
                    //fetchFlickrPhotos(usersSearch); // Fetch photos from the Flicker API
                    fetchYouTubeVideo(usersSearch); // Fetch video from the YouTube API
                }
            });
        } else {
            alert('You need to log in to Spotify.');
        }
    } else if (document.body.id === 'similar-artists-page') { // If the current page is the similar-artists.html page
        // Página de artistas semelhantes
        const urlParams = new URLSearchParams(window.location.search);
        const artistName = urlParams.get('artist');

        if (artistName) {
            fetchLastFmApiKey()
                .then(apiKey => fetchSimilarArtists(artistName, apiKey))
                .catch(error => console.error('Erro ao obter artistas semelhantes:', error));
        }
    }
};

// Function to search for an artist or track using the Spotify Web API
function searchArtistOrTrack(query, token) {
    if (!query) { // Check if the query is empty
        console.error('Query is undefined or null.');
        return;
    }

    /*  Debugging

    if (!token) { // Check if the token is empty
        console.error('Token is undefined or null.');
        return;
    } else {
        console.log('Token:', token); // Debugging
    }
    
    */
    const url = `https://api.spotify.com/v1/search?q=${query}&type=artist,track`;

    console.log('Request URL:', url); // Debugging

    fetch(url, {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
        .then(response => {
            if (!response.ok) {
                // If the response is not ok, throw an error
                console.error('Erro ao procurar o artista ou música:', response.status);
                throw new Error('Erro ao procurar o artista ou música:');
            }
            return response.json();
        })
        .then(data => {
            //Verify if there is an error in the response
            if (data.error) {
                console.error('Erro ao procurar o artista ou música:', data.error.message);
                return;
            }
            displaySearchResults(data);
        })
        .catch(error => {
            console.error('Erro ao procurar o artista ou música:', error);
        });
}

// Function to display the search results on the page
function displaySearchResults(data) {
    const artistInfoContainer = document.getElementById('artist-info'); //artist info container
    const tracksContainer = document.getElementById('tracks'); //tracks container

    // Clear the containers
    artistInfoContainer.innerHTML = '';
    tracksContainer.innerHTML = '';

    const artistResults = data.artists?.items[0]; // Security verification (?) to see if there are 1 artist found 
    const trackResults = data.tracks?.items.slice(0, 8) // Security verification (?) to see if there are 8 tracks found 

    // Show found artist
    if (artistResults) {
        const artistDiv = document.createElement('div');
        artistDiv.innerHTML = `
            <h2>${artistResults.name}</h2>
            <img src="${artistResults.images[0]?.url}" alt="${artistResults.name}">
        `;
        artistInfoContainer.appendChild(artistDiv);
    }

    // Mostrar as músicas encontradas
    trackResults.forEach(track => {
        const trackDiv = document.createElement('div');
        trackDiv.classList.add('track-item');
        trackDiv.innerHTML = `
            <img src="${track.album.images[0]?.url}" alt="${track.name}">
            <p><strong>${track.name}</strong> - ${track.artists.map(artist => artist.name).join(', ')}</p>
            <audio controls src="${track.preview_url}">Your browser does not support the audio element.</audio>
        `;
        tracksContainer.appendChild(trackDiv);
    });

    // Show message if no artists or tracks were found
    if (!artistResults === 0 && trackResults.length === 0) {
        resultsContainer.innerHTML = '<p>Nenhum artista ou música encontrado.</p>';
    }
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
        artistDiv.innerHTML = `
            <img src="${artist.image[2]['#text']}" alt="${artist.name}">
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

//----------------------------------FLICKER API-----------------------------------
/*
// Cache for storing recent search results
const flickrCache = {};

// Set a minimum time interval between requests (in milliseconds)
const FLICKR_REQUEST_INTERVAL = 1000; // 1 second
let lastFlickrRequestTime = 0; // Track the last time a request was made

// Function to fetch photos from Flickr API
function fetchFlickrPhotos(usersSearch) {
    // Check if the query is empty
    if (!usersSearch) {
        console.log('Query is undefined or null.');
        return;
    }

    // Check if the search term is in the cache
    if (flickrCache[usersSearch]) {
        console.log('Returning cached results for:', usersSearch);
        displayFlickrPhotos(flickrCache[usersSearch]); // Display cached photos
        return;
    }

    // Get the current time
    const currentTime = Date.now();

    // Check if enough time has passed since the last request
    if (currentTime - lastFlickrRequestTime < FLICKR_REQUEST_INTERVAL) {
        console.log('Please wait a moment before making another request.');
        return;
    }

    // Update the last request time to the current time
    lastFlickrRequestTime = currentTime;

    // Make the API request
    fetch(`/flickr-search?text=${encodeURIComponent(usersSearch)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch Flickr photos');
            }
            return response.json();
        })
        .then(data => {
            // Cache the results
            flickrCache[usersSearch] = data.photoUrls;

            // Display the photos on the page
            displayFlickrPhotos(data.photoUrls);
        })
        .catch(error => {
            console.error('Error fetching photos from Flickr:', error);
        });

}

// Function to display Flickr photos on the page
function displayFlickrPhotos(photoUrls) {
    const photosContainer = document.getElementById('flickr-photos');
    if (!photosContainer) {
        console.error("Element 'flickr-photos' not found.");
        return;
    }

    photosContainer.innerHTML = ''; // Clear previous photos

    photoUrls.forEach(url => {
        const img = document.createElement('img');
        img.src = url;
        img.alt = 'Flickr Photo';
        img.className = 'flickr-photo';
        photosContainer.appendChild(img);
    });
}
*/

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

