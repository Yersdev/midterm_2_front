const apiKey = 'YOUR API';
const baseUrl = 'https://api.spoonacular.com/recipes';
let favorites = JSON.parse(localStorage.getItem('favorites')) || {};
let ratings = JSON.parse(localStorage.getItem('ratings')) || {};

const recipeOfTheDayContainer = document.getElementById('recipe-of-the-day');
const mainRecipesContainer = document.getElementById('main-recipes');
const searchResultsContainer = document.getElementById('search-results');
const autocompleteContainer = document.getElementById('autocomplete-dropdown');

//try to receive the result of the recipe of the day
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

//display the recippe of the day
function displayRecipeOfTheDay(recipe) {
    recipeOfTheDayContainer.innerHTML = `
        <div class="recipe-container-day">
            <h2 class = "recipe__title-day">Recipe of the Day</h2>
            <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">
            <h3 class="recipe-container-title">${recipe.title}</h3>
            
            <button class="recipe-container-detail" onclick="showRecipeDetails(${recipe.id})">View Details</button>
        </div>
    `;
}


//try to receive popular recipe
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
//display the received recipes from api
function displayPopularRecipes(recipes) {
    mainRecipesContainer.innerHTML = recipes.map(recipe => `
        <div class="recipe-container">
            <img class="popular-recipe-img" src="${recipe.image}" alt="${recipe.title}" class="recipe-image">
            <h4 class="popular-recipe-subtitle">${recipe.title}</h4>
            
            <button class="recipe-container-detail" onclick="showRecipeDetails(${recipe.id})">View Details</button>
            
        </div>
    `).join('');
}
function initializeFavorites() {
    Object.keys(favorites).forEach(recipeId => {
        updateFavoriteButton(recipeId);
    });
}

initializeFavorites();

//try to show the recipe
async function showRecipeDetails(recipeId) {
    if (!recipeId) {
        console.error('Recipe ID is undefined');
        return;
    }

    try {
        const response = await fetch(`${baseUrl}/${recipeId}/information?apiKey=${apiKey}`);
        if (response.ok) {
            const recipe = await response.json();
            displayRecipeDetails(recipe);
        } else {
            console.error('Error fetching recipe details:', response.status);
        }
    } catch (error) {
        console.error('Error fetching recipe details:', error);
    }
}


//try to show the recipe in the details

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

function closeRecipeModal() {
    document.getElementById('recipe-modal').style.display = 'none';
}

function saveRating(recipeId, rating) {
    ratings[recipeId] = rating;
    localStorage.setItem('ratings', JSON.stringify(ratings));
}

//try to evaluate the rating score 
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


function toggleFavorite(recipeId, recipeName) {
    if (favorites[recipeId]) {
        delete favorites[recipeId];
        alert("We successfully removed the receipt");
        
    } else {
        favorites[recipeId] = { name: recipeName, id: recipeId };
        alert("We successfully added the receipt");
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));

    updateFavoritesButton(recipeId);
}

//actions with favorites button
function updateFavoritesButton(recipeId) {
    const button = document.querySelector(`[data-recipe-id="${recipeId}"]`);
    if (button) {
        button.innerText = favorites[recipeId] ? 'Remove from Favorites' : 'Add to Favorites';
    }
}


function updateFavoritesButton(recipeId) {
    const button = document.querySelector(`[data-recipe-id="${recipeId}"]`);
    if (button) {
        button.innerText = favorites[recipeId] ? 'Remove from Favorites' : 'Add to Favorites';
    }
}


function updateFavoriteButton(recipeId) {
    const button = document.querySelector(`[data-recipe-id="${recipeId}"]`);
    if (button) {
        if (favorites[recipeId]) {
            button.classList.add('favorited');
            button.innerText = 'Remove from Favorites';
        } else {
            button.classList.remove('favorited');
            button.innerText = 'Add to Favorites';
        }
    }
}

//try to open modal page for favorites modal page
function openFavoritesModal() {
    const favoritesList = document.getElementById('favorites-list');
    favoritesList.innerHTML = '';

    if (Object.keys(favorites).length > 0) {
        Object.keys(favorites).forEach(id => {
            fetch(`${baseUrl}/${id}/information?apiKey=${apiKey}`)
                .then(response => response.json())
                .then(recipe => {
                    const favoriteItem = document.createElement('div');
                    favoriteItem.classList.add('recipe-container');
                    favoriteItem.innerHTML = `
                    <div class="favorite-container">
                        <button onclick="viewFavoriteDetails(${id})" class="view-details-btn">View Details</button>
                        <h4>${recipe.title}</h4>
                        <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">
                        <button onclick="removeFavorite(${id})">Remove</button>
                        </div>
                    `;
                    favoritesList.appendChild(favoriteItem);
                });
        });
    } else {
        favoritesList.innerHTML = '<p>No favorites added yet.</p>';
    }
    document.getElementById('favorites-modal').style.display = 'block';
}

function viewFavoriteDetails(recipeId) {
    showRecipeDetails(recipeId);
    closeFavoritesModal(); 
}
//try to close favorite page
function closeFavoritesModal() {
    document.getElementById('favorites-modal').style.display = 'none';
}

//try to remove favorite page
function removeFavorite(recipeId) {
    delete favorites[recipeId];
    localStorage.setItem('favorites', JSON.stringify(favorites));
    openFavoritesModal();}

//try to close favorite page
function closeFavoritesModal() {
    document.getElementById('favorites-modal').style.display = 'none';
}


function removeFavorite(recipeId) {
    delete favorites[recipeId];
    localStorage.setItem('favorites', JSON.stringify(favorites));
    openFavoritesModal();
}

async function searchRecipes(event) {
    const query = event?.target?.value || document.getElementById('search-query').value;

    if (!query) {
        resetToDefault();
        return;
    }

    recipeOfTheDayContainer.style.display = 'none';
    mainRecipesContainer.style.display = 'none';
    searchResultsContainer.style.display = 'grid';

    try {
        const response = await fetch(`${baseUrl}/complexSearch?apiKey=${apiKey}&query=${query}&number=10`);
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        if (data && data.results) {
            displaySearchResults(data.results);
        } else {
            searchResultsContainer.innerHTML = '<p>No recipes found.</p>';
        }
    } catch (error) {
        console.error('Error during search:', error);
        searchResultsContainer.innerHTML = '<p>Error occurred. Please try again later.</p>';
    }
}

//reset to default after searching
function resetToDefault() {
    recipeOfTheDayContainer.style.display = 'block';
    mainRecipesContainer.style.display = 'grid';
    searchResultsContainer.style.display = 'none';

    fetchRecipeOfTheDay();
}

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
            const errorText = await response.text(); 
            console.error('Error fetching recipe of the day:', response.status, errorText);
        }
    } catch (error) {
        console.error('Error fetching recipe of the day:', error);
    }
}

//display to the user the recipe of the day
function displayRecipeOfTheDay(recipe) {
    recipeOfTheDayContainer.innerHTML = `
        <div class="recipe-container-day">
            <h2 class="recipe__title-day">Recipe of the Day</h2>
            <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">
            <h3 class="recipe-container-title">${recipe.title}</h3>
            
            <button class="recipe-container-detail" onclick="showRecipeDetails(${recipe.id})">View Details</button>
        </div>
    `;
}




function displaySearchResults(recipes) {
    mainRecipesContainer.innerHTML = ''; 

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


function displayAutocompleteSuggestions(suggestions) {
    autocompleteContainer.innerHTML = suggestions.map(suggestion => `
        <div class="suggestion-item" onclick="searchRecipes({target: {value: '${suggestion.title}'}})">
            ${suggestion.title}
        </div>
    `).join('');
    autocompleteContainer.style.display = 'block';
}

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

//reset to default
function resetToDefault() {
    mainRecipesContainer.style.display = 'grid';
    searchResultsContainer.style.display = 'none';
    autocompleteContainer.style.display = 'none';
}

fetchRecipeOfTheDay();
fetchPopularRecipes();
