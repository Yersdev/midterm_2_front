const apiKey = 'fa4e995c758c42878af9e8baa0ce3543';
const baseUrl = 'https://api.spoonacular.com/recipes';
let favorites = JSON.parse(localStorage.getItem('favorites')) || {};
let ratings = JSON.parse(localStorage.getItem('ratings')) || {};

const recipeOfTheDayContainer = document.getElementById('recipe-of-the-day');
const mainRecipesContainer = document.getElementById('main-recipes');
const searchResultsContainer = document.getElementById('search-results');
const autocompleteContainer = document.getElementById('autocomplete-dropdown');

// Fetch Recipe of the Day
async function fetchRecipeOfTheDay() {
    try {
        const response = await fetch(`${baseUrl}/random?apiKey=${apiKey}&number=1`);
        if (response.ok) {
            const data = await response.json();
            if (data.recipes && data.recipes.length > 0) {
                displayRecipeOfTheDay(data.recipes[0]);
            } else {
                console.error('No data for recipe of the day');
            }
        } else {
            console.error('Error fetching recipe of the day:', response.status);
        }
    } catch (error) {
        console.error('Error fetching recipe of the day:', error);
    }
}

// Display Recipe of the Day
function displayRecipeOfTheDay(recipe) {
    recipeOfTheDayContainer.innerHTML = `
        <div class="recipe-container-day">
            <h2 class = "recipe__title-day">Recipe of the Day</h2>
            <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">
            <h3 class="recipe-container-title">${recipe.title}</h3>
            <p>${recipe.summary ? recipe.summary.slice(0, 100) + '...' : 'No description available'}</p>
            <button class="recipe-container-detail" onclick="showRecipeDetails(${recipe.id})">View Details</button>
        </div>
    `;
}

// Fetch Popular Recipes
async function fetchPopularRecipes() {
    try {
        const response = await fetch(`${baseUrl}/complexSearch?apiKey=${apiKey}&sort=popularity&number=5`);
        if (response.ok) {
            const data = await response.json();
            displayPopularRecipes(data.results);
        } else {
            console.error('Error fetching popular recipes:', response.status);
        }
    } catch (error) {
        console.error('Error fetching popular recipes:', error);
    }
}

// Display Popular Recipes
function displayPopularRecipes(recipes) {
    mainRecipesContainer.innerHTML = recipes.map(recipe => `
        <div class="recipe-container">
            <img class="popular-recipe-img" src="${recipe.image}" alt="${recipe.title}" class="recipe-image">
            <h4 class="popular-recipe-subtitle">${recipe.title}</h4>
            <p>${recipe.summary ? recipe.summary.slice(0, 100) + '...' : 'No description available'}</p>
            <button class="recipe-container-detail" onclick="showRecipeDetails(${recipe.id})">View Details</button>
        </div>
    `).join('');
}

// Fetch Recipe Details
async function showRecipeDetails(recipeId) {
    try {
        const response = await fetch(`${baseUrl}/${recipeId}/information?apiKey=${apiKey}`);
        const recipe = await response.json();
        displayRecipeDetails(recipe);
    } catch (error) {
        console.error('Error fetching recipe details:', error);
    }
}

// Display Recipe Details
function displayRecipeDetails(recipe) {
    document.getElementById('modal-title').innerText = recipe.title;
    document.getElementById('modal-image').src = recipe.image;
    document.getElementById('modal-ingredients').innerHTML = `
  <h3 class="modal-subtitles">Ingredients:</h3>
  <ul>
    ${recipe.extendedIngredients.map(ing => `<li>${ing.original}</li>`).join('')}
  </ul>
`;

document.getElementById('modal-instructions').innerHTML = `
  <h3 class="modal-subtitles">Instructions:</h3>
  ${recipe.instructions || '<p>No instructions available</p>'}
`;

    document.getElementById('recipe-modal').style.display = 'block';
}

// Close the Recipe Modal
function closeRecipeModal() {
    document.getElementById('recipe-modal').style.display = 'none';
}

// Save Rating
function saveRating(recipeId, rating) {
    ratings[recipeId] = rating;
    localStorage.setItem('ratings', JSON.stringify(ratings));
}

// Submit Rating
function submitRating() {
    const ratingInput = document.getElementById('rating-input');
    const rating = parseInt(ratingInput.value, 10);
    const recipeId = document.getElementById('modal-title').dataset.id;

    if (rating >= 1 && rating <= 10) {
        saveRating(recipeId, rating);
        document.getElementById('rating-input').disabled = true;

        document.getElementById('user-rating').innerText = `Your rating: ${rating}`;
    } else {
        alert("Please enter a rating between 1 and 10.");
    }
}

// Toggle Favorite
function toggleFavorite(recipeId) {
    if (favorites[recipeId]) {
        delete favorites[recipeId];
    } else {
        favorites[recipeId] = true;
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Open Favorites Modal
function openFavoritesModal() {
    const favoritesList = document.getElementById('favorites-list');
    favoritesList.innerHTML = Object.keys(favorites).length
        ? Object.keys(favorites).map(id => `
            <div class="recipe-container">
                <h4>${id}</h4>
                <button onclick="showRecipeDetails(${id})">View Details</button>
                <button onclick="removeFavorite(${id})">Remove</button>
            </div>
        `).join('')
        : '<p>No favorites added yet.</p>';
    document.getElementById('favorites-modal').style.display = 'block';
}

// Close Favorites Modal
function closeFavoritesModal() {
    document.getElementById('favorites-modal').style.display = 'none';
}

// Remove Favorite
function removeFavorite(recipeId) {
    delete favorites[recipeId];
    localStorage.setItem('favorites', JSON.stringify(favorites));
    openFavoritesModal(); // Refresh favorites list
}

async function searchRecipes(event) {
    const query = event?.target?.value || document.getElementById('search-query').value;

    if (!query) {
        resetToDefault();
        return;
    }

    try {
        console.log("Выполняется поиск:", query);
        const response = await fetch(`${baseUrl}/complexSearch?apiKey=${apiKey}&query=${query}&number=10`);
        
        if (!response.ok) {
            throw new Error(`Ошибка при выполнении запроса: ${response.status}`);
        }

        const data = await response.json();
        console.log("Результаты поиска:", data);

        if (data && data.results) {
            displaySearchResults(data.results);
        } else {
            mainRecipesContainer.innerHTML = '<p>Не найдено рецептов.</p>';
        }
    } catch (error) {
        console.error('Ошибка при выполнении поиска:', error);
        mainRecipesContainer.innerHTML = '<p>Ошибка при выполнении поиска. Повторите попытку позже.</p>';
    }
}

function displaySearchResults(recipes) {
    mainRecipesContainer.innerHTML = ''; // Очистка контейнера перед добавлением новых рецептов

    if (recipes.length > 0) {
        mainRecipesContainer.style.display = 'grid';
        recipes.forEach(recipe => {
            const recipeElement = document.createElement('div');
            recipeElement.classList.add('recipe-item');
            recipeElement.innerHTML = `
                <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">
                <h3>${recipe.title}</h3>
                <button onclick="showRecipeDetails(${recipe.id})">View Details</button>
            `;
            mainRecipesContainer.appendChild(recipeElement);
        });
    } else {
        mainRecipesContainer.innerHTML = '<p>No recipes found.</p>';
    }
}


// Display Autocomplete Suggestions
function displayAutocompleteSuggestions(suggestions) {
    autocompleteContainer.innerHTML = suggestions.map(suggestion => `
        <div class="suggestion-item" onclick="searchRecipes({target: {value: '${suggestion.title}'}})">
            ${suggestion.title}
        </div>
    `).join('');
    autocompleteContainer.style.display = 'block';
}

// Display Search Results
function displaySearchResults(recipes) {
    searchResultsContainer.innerHTML = '';
    
    if (recipes.length > 0) {
        searchResultsContainer.style.display = 'grid';
        recipes.forEach(recipe => {
            const recipeElement = document.createElement('div');
            recipeElement.classList.add('recipe-item');
            recipeElement.innerHTML = `
                <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">
                <h3>${recipe.title}</h3>
                <button onclick="showRecipeDetails(${recipe.id})">View Details</button>
            `;
            searchResultsContainer.appendChild(recipeElement);
        });
    } else {
        searchResultsContainer.innerHTML = '<p>No recipes found.</p>';
    }
}

// Reset to Default State
function resetToDefault() {
    mainRecipesContainer.style.display = 'grid';
    searchResultsContainer.style.display = 'none';
    autocompleteContainer.style.display = 'none';
}

fetchRecipeOfTheDay();
fetchPopularRecipes();
