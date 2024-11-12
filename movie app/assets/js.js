const wishList = [];

const apiKey = 'YOUR API';
const baseUrl = 'https://api.themoviedb.org/3';
const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
const movieOfTheDayContainer = document.getElementById('movie-of-the-day');

const ratingsMap = JSON.parse(localStorage.getItem('movieRatings')) || {};

function saveRating(movieId, rating) {
    ratingsMap[movieId] = rating;
    localStorage.setItem('movieRatings', JSON.stringify(ratingsMap));
}

function getRating(movieId) {
    return ratingsMap[movieId] || null;
}

//trying to get movie of the day with api
async function fetchMovieOfTheDay() {
    try {
        const response = await fetch(`${baseUrl}/movie/popular?api_key=${apiKey}&language=en-US`);
        const data = await response.json();
        const movie = data.results[Math.floor(Math.random() * data.results.length)];
        displayMovieOfTheDay(movie);
    } catch (error) {
        console.error('Error loading the movie of the day:', error);
    }
}

//display movie of the day
function displayMovieOfTheDay(movie) {
    const posterPath = movie.poster_path ? `${imageBaseUrl + movie.poster_path}` : 'assets/default-poster.jpg';
    movieOfTheDayContainer.innerHTML = `
        <h2 class="movie-day">Film of the day</h2>
        <img src="${posterPath}" alt="${movie.title} Poster" class="movie-of-the-day__poster">
        <h3 class="movie-of-day-title">${movie.title}</h3>
        <p class="movie-view">${movie.overview}</p>
        <button class="info-button" onclick="showMovieDetails(${movie.id})">Overview</button>
    `;
}

async function fetchPopularMovies() {
    try {
        const response = await fetch(`${baseUrl}/movie/popular?api_key=${apiKey}&language=en-US&page=1`);
        const data = await response.json();
        displayPopularMovies(data.results);
    } catch (error) {
        console.error('Error loading popular movies:', error);
    }
}
//display the most popular movie by api
function displayPopularMovies(movies) {
    const moviesList = document.getElementById('popular-movies-list');
    moviesList.innerHTML = '';

    movies.forEach(movie => {
        const posterPath = movie.poster_path ? `${imageBaseUrl + movie.poster_path}` : 'assets/default-poster.jpg';
        const movieItem = document.createElement('div');
        movieItem.classList.add('movie-item');
        movieItem.innerHTML = `
            <img src="${posterPath}" alt="${movie.title} Poster" class="movie-poster">
            <h4 class="movie-title">${movie.title}</h4>
            <button class="info-button-films" onclick="showMovieDetails(${movie.id})">Overview</button>
        `;
        moviesList.appendChild(movieItem);
    });
}

//
document.addEventListener('DOMContentLoaded', () => {
    const addToWishlistButton = document.getElementById('add-to-wishlist');
if (addToWishlistButton) {
    addToWishlistButton.onclick = function() {
        const movieId = document.getElementById('movie-id').value;
        const movieTitle = document.getElementById('movie-title').innerText;
        const movie = { id: movieId, title: movieTitle };
        addToWishlist(movie);
    };
} else {
    console.error('add-to-wishlist button not found!');
}
    const addToWishlist = (movie) => {
        if (!wishList.some(item => item.id === movie.id)) {
            wishList.push(movie);
            console.log('Added to wishlist:', movie);
            alert('Movie added to wishlist!');
        } else {
            alert('Movie is already in the wishlist!');
        }
    };

    window.showMovieDetails = async function(movieId) {
        try {
            const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=700dc0f60d0439f79086e04cb4bdd932&language=en-US&append_to_response=videos,credits`);
            const movie = await response.json();

            document.getElementById('movie-title').innerText = movie.title;
            document.getElementById('movie-description').innerText = movie.overview;
            document.getElementById('movie-release-date').innerText = movie.release_date;
            document.getElementById('movie-country').innerText = movie.production_countries.map(c => c.name).join(', ');
            document.getElementById('movie-genres').innerText = movie.genres.map(g => g.name).join(', ');
            document.getElementById('movie-id').value = movie.id;

            const cast = movie.credits.cast.slice(0, 5).map(actor => actor.name).join(', ');
            document.getElementById('movie-cast').innerText = cast;

            const trailer = movie.videos.results.find(video => video.type === 'Trailer');
            const trailerContainer = document.getElementById('movie-trailer');
            if (trailer) {
                trailerContainer.innerHTML = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allowfullscreen></iframe>`;
            } else {
                trailerContainer.innerHTML = '<p>The trailer is not available.</p>';
            }

            addToWishlistButton.style.display = 'inline';

            addToWishlistButton.onclick = function() {
                addToWishlist({ id: movie.id, title: movie.title });
            };

            document.getElementById('movie-modal').style.display = 'block';
        } catch (error) {
            console.error('Error loading movie details:', error);
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        const closeModalButton = document.getElementById('close-modal');
    
        if (closeModalButton) {
            closeModalButton.onclick = function() {
                document.getElementById('movie-modal').style.display = 'none';
            };
        } else {
            console.error('Close modal button not found!');
        }
        window.onclick = function(event) {
            if (event.target === document.getElementById('movie-modal')) {
                document.getElementById('movie-modal').style.display = 'none';
            }
            if (event.target === document.getElementById('wishlist-modal')) {
                document.getElementById('wishlist-modal').style.display = 'none';
            }
        };
    });
    
});
//add wish list
function addToWishlist(movie) {
    if (!wishlist.some(item => item.id === movie.id)) {
        wishlist.push(movie);
        alert(`${movie.title} добавлен в избранное.`);
    } else {
        alert(`${movie.title} уже находится в избранном.`);
    }
}

//display wishlist
function displayWishlist() {
    const wishlistContainer = document.getElementById('wishlist-container');
    wishlistContainer.innerHTML = '';

    if (wishList.length === 0) {
        wishlistContainer.innerHTML = '<p>Your wish list is empty.</p>';
        return;
    }

    wishList.forEach(movie => {
        const movieItem = document.createElement('div');
        movieItem.classList.add('wishlist-item');
        movieItem.innerHTML = `
            <h4>${movie.title}</h4>
            <div class="wish-item__btns">
                <button onclick="removeFromWishlist(${movie.id})">Remove</button>
                <button onclick="showMovieDetails(${movie.id})">Overview</button>
            </div>
        `;
        wishlistContainer.appendChild(movieItem);
    });
}
//remove from wish list modal page
function removeFromWishlist(movieId) {
    wishList = wishList.filter(movie => movie.id !== movieId);
    displayWishlist();
}


document.addEventListener('DOMContentLoaded', () => {
    const addToWishlistButton = document.getElementById('add-to-wishlist');
    const closeModalButton = document.getElementById('close-modal');
    const wishlistButton = document.getElementById('wishlist-button');
if (wishlistButton) {
    wishlistButton.onclick = displayWishlist;
} else {
    console.error('Button with ID "wishlist-button" not found.');
}

    const submitRatingButton = document.getElementById('submit-rating');
    const movieRatingInput = document.getElementById('movie-rating');
    
    if (addToWishlistButton) {
        addToWishlistButton.onclick = function() {
            const movieId = document.getElementById('movie-id').value;
            const movieTitle = document.getElementById('movie-title').innerText;
            const movie = { id: movieId, title: movieTitle };
            addToWishlist(movie);
        };
    } else {
        console.error('Add to Wishlist button not found!');
    }

    if (closeModalButton) {
        closeModalButton.onclick = function() {
            document.getElementById('movie-modal').style.display = 'none';
        };
    } else {
        console.error('Close Modal button not found!');
    }

    if (wishlistButton) {
        wishlistButton.onclick = function() {
            displayWishlist();
            document.getElementById('wishlist-modal').style.display = 'block';
        };
    } else {
        console.error('Wishlist button not found!');
    }

    if (submitRatingButton && movieRatingInput) {
        submitRatingButton.onclick = function() {
            const ratingValue = movieRatingInput.value;
            const movieId = document.getElementById('movie-id').value;
            if (ratingValue && movieId) {
                saveRating(movieId, ratingValue);
                displayRatingSection(movieId);
            } else {
                alert('Please enter a rating.');
            }
        };
    } else {
        console.error('Submit rating button or rating input not found!');
    }
});

//display movie overiview
    async function showMovieDetails(movieId) {
        try {
            const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=700dc0f60d0439f79086e04cb4bdd932&language=en-US&append_to_response=videos,credits`);
            const movie = await response.json();

            document.getElementById('movie-title').innerText = movie.title;
            document.getElementById('movie-description').innerText = movie.overview;
            document.getElementById('movie-release-date').innerText = movie.release_date;
            document.getElementById('movie-country').innerText = movie.production_countries.map(c => c.name).join(', ');
            document.getElementById('movie-genres').innerText = movie.genres.map(g => g.name).join(', ');
            document.getElementById('movie-id').value = movie.id;

            const cast = movie.credits.cast.slice(0, 5).map(actor => actor.name).join(', ');
            document.getElementById('movie-cast').innerText = cast;

            const trailer = movie.videos.results.find(video => video.type === 'Trailer');
            const trailerContainer = document.getElementById('movie-trailer');
            if (trailer) {
                trailerContainer.innerHTML = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allowfullscreen></iframe>`;
            } else {
                trailerContainer.innerHTML = '<p>The trailer is not available.</p>';
            }

            document.getElementById('movie-modal').style.display = 'block';

            document.getElementById('wish-list').onclick = function() {
                const movie = { id: movie.id, title: movie.title };
                addToWishlist(movie);
            };
            
        } catch (error) {
            console.error('Error loading movie details:', error);
        }
    }

   

    window.onclick = function(event) {
        if (event.target === document.getElementById('movie-modal')) {
            document.getElementById('movie-modal').style.display = 'none';
        }
    };


//display the wish list
function displayWishlist() {
    const wishlistContainer = document.getElementById('wishlist-container');
    wishlistContainer.innerHTML = '';

    if (wishList.length === 0) {
        wishlistContainer.innerHTML = '<p>Your wish list is empty.</p>';
        return;
    }

    wishList.forEach(movie => {
        const movieItem = document.createElement('div');
        movieItem.classList.add('wishlist-item');
        movieItem.innerHTML = `
            <h4>${movie.title}</h4>
            <button onclick="removeFromWishlist(${movie.id})">Remove</button>
        `;
        wishlistContainer.appendChild(movieItem);
    });
}

// Remove a movie from the wishlist and update display

function removeFromWishlist(movieId) {
    const index = wishList.findIndex(movie => movie.id === movieId);
    if (index !== -1) {
        wishList.splice(index, 1);
        localStorage.setItem('wishlist', JSON.stringify(wishList));
        displayWishlist();
    }
}

// Set up wishlist and modal buttons
document.getElementById('add-to-wishlist').onclick = function() {
    const movieId = document.getElementById('movie-id').value;
    const movieTitle = document.getElementById('movie-title').innerText;
    const movie = { id: movieId, title: movieTitle };
    addToWishlist(movie);
};

document.getElementById('wishlist-button').onclick = function() {
    displayWishlist();
    document.getElementById('wishlist-modal').style.display = 'block';
};

document.getElementById('close-modal').onclick = function() {
    document.getElementById('movie-modal').style.display = 'none';
};


window.onclick = function(event) {
    if (event.target === document.getElementById('movie-modal')) {
        document.getElementById('movie-modal').style.display = 'none';
    }
    if (event.target === document.getElementById('wishlist-modal')) {
        document.getElementById('wishlist-modal').style.display = 'none';
    }
};
;
document.getElementById('close-modal').onclick = function() {
    document.getElementById('movie-modal').style.display = 'none';
}

// Manage movie ratings, handling input and saving data


function displayRatingSection(movieId) {
    const savedRating = getRating(movieId);
    const ratingContainer = document.getElementById('movie-rating');
    const submitButton = document.getElementById('submit-rating');
    const ratingDisplay = document.getElementById('rating-display');

    if (!ratingContainer || !submitButton || !ratingDisplay) {
        console.error("Required rating elements are missing in the DOM.");
        return;
    }

    if (savedRating !== null) {
        ratingContainer.style.display = 'none';
        submitButton.style.display = 'none';
        ratingDisplay.innerText = `Your evaluation: ${savedRating}`;
        ratingDisplay.style.display = 'block';
    } else {
        ratingContainer.style.display = 'block';
        submitButton.style.display = 'inline';
        ratingDisplay.style.display = 'none';
    }
}

//try to get the rating score
document.getElementById('submit-rating').onclick = function() {
    const ratingContainer = document.getElementById('movie-rating');
    const movieIdInput = document.getElementById('movie-id');

    if (!ratingContainer || !movieIdInput) {
        console.error('Required elements for rating are missing in the DOM.');
        return;
    }

    const rating = parseInt(ratingContainer.value, 10);
    const movieId = movieIdInput.value;

    if (rating < 1 || rating > 10) {
        alert('Enter a score from 1 to 10.');
        return;
    }

    saveRating(movieId, rating);
    displayRatingSection(movieId);
};

//search the movie
async function searchMovies(query) {
    try {
        const response = await fetch(`${baseUrl}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=en-US`);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            displaySearchResults(data.results);
        } else {
            displaySearchResults([]);
        }
    } catch (error) {
        console.error('Error when searching for movies:', error);
    }
}

//display search the result of search
function displaySearchResults(movies) {
    const moviesList = document.querySelector('.movies__list');
    moviesList.innerHTML = '';

    if (movies.length === 0) {
        moviesList.innerHTML = '<p>No results were found.</p>';
        return;
    }

    movies.forEach(movie => {
        const posterPath = movie.poster_path ? `${imageBaseUrl + movie.poster_path}` : 'assets/default-poster.jpg';
        const movieItem = document.createElement('div');
        movieItem.classList.add('movie-item');
        movieItem.innerHTML = `
            <img src="${posterPath}" alt="${movie.title} Poster" class="movie-poster">
            <h4 class="movie-title">${movie.title}</h4>
            <button class="info-button-films" onclick="showMovieDetails(${movie.id})">Overview</button>
        `;
        moviesList.appendChild(movieItem);
    });
}

const searchInput = document.querySelector('.nav__input');
searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim();
    const sortFilter = document.getElementById('sort-filter');

    if (query) {
        movieOfTheDayContainer.style.display = 'none';
        sortFilter.style.display = 'none'; 
        searchMovies(query);
    } else {
        resetToDefault();
    }
});

document.getElementById('sort-filter').addEventListener('change', async (event) => {
    const sortBy = event.target.value;

    if (sortBy === "default") {
        resetToDefault();
    } else {
        fetchMoviesWithSorting(sortBy);
    }
});

async function fetchMoviesWithSorting(sortBy) {
    try {
        const response = await fetch(`${baseUrl}/discover/movie?api_key=${apiKey}&language=en-US&sort_by=${sortBy}&page=1`);
        const data = await response.json();
        displayPopularMovies(data.results);
    } catch (error) {
        console.error('Error fetching sorted movies:', error);
    }
}

function resetToDefault() {
    movieOfTheDayContainer.style.display = 'block';
    document.getElementById('sort-filter').value = 'default';
    searchInput.value = '';
    fetchPopularMovies();
    document.querySelector('.movies__list').innerHTML = '';
}

// Initialize the page with the Movie of the Day and the list of popular movies
fetchMovieOfTheDay();
fetchPopularMovies();
document.getElementById('close-wishlist-modal').addEventListener('click', function() {
    document.getElementById('wishlist-modal').style.display = 'none';
});

document.getElementById('close-modal').addEventListener('click', function() {
    document.getElementById('movie-modal').style.display = 'none';
});
