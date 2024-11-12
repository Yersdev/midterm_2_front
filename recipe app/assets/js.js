const apiKey = 'fa4e995c758c42878af9e8baa0ce3543';
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Функция для загрузки популярных рецептов
async function loadPopularRecipes() {
    try {
        const response = await fetch(`https://api.spoonacular.com/recipes/random?apiKey=${apiKey}&number=6`);
        const data = await response.json();
        const popularRecipesList = document.getElementById("popular-recipes-list");

        popularRecipesList.innerHTML = ""; // Очистка списка

        data.recipes.forEach(recipe => {
            const recipeItem = document.createElement("div");
            recipeItem.className = "recipe-item";

            const recipeImg = document.createElement("img");
            recipeImg.src = recipe.image;
            recipeImg.alt = recipe.title;
            recipeImg.className = "popular__recipe-els__img";


            const recipeTitle = document.createElement("h3");
            recipeTitle.textContent = recipe.title;
            recipeTitle.className = "popular__recipe-els__subtitle";


            const recipeOverview = document.createElement("p");
            recipeOverview.className = "popular__recipe-els__description";

            recipeOverview.textContent = recipe.summary ? recipe.summary.slice(0, 100) + '...' : 'No summary available';

            const detailsLink = document.createElement("a");
            detailsLink.href = "#";
            detailsLink.textContent = "Details...";
            detailsLink.className = "popular__recipe-els__details";

            detailsLink.onclick = function () {
                showRecipeDetails(recipe.id, recipe); // Передаем объект recipe
            };

            const favoriteButton = document.createElement("button");
            favoriteButton.textContent = "Add to Favorites";
            favoriteButton.className = "popular__recipe-els__favorites-btn";

            favoriteButton.onclick = function () {
                addToFavorites(recipe); // Передаем объект recipe
            };

            recipeItem.appendChild(recipeImg);
            recipeItem.appendChild(recipeTitle);
            recipeItem.appendChild(recipeOverview);
            recipeItem.appendChild(detailsLink);
            recipeItem.appendChild(favoriteButton);
            popularRecipesList.appendChild(recipeItem);
        });
    } catch (error) {
        console.error("Error loading popular recipes:", error);
    }
}

// Функция для отображения деталей рецепта в модальном окне
async function showRecipeDetails(recipeId, recipe) {
    const recipeDetailsDiv = document.getElementById("recipe-details");
    const recipeContentDiv = document.getElementById("recipe-content");

    try {
        const response = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`);
        const recipeData = await response.json();

        // Составление контента для модального окна
        recipeContentDiv.innerHTML = `
    <h2 class="recipe-detials-title">${recipeData.title}</h2>
    <div class="recipe-details">

    <img class="recipe-detials-img" src="${recipeData.image}" alt="${recipeData.title}">
    <div class=recipe-details-text>
    <p><strong>Calories:</strong> ${recipeData.nutrition && recipeData.nutrition.nutrients[0] ? recipeData.nutrition.nutrients[0].amount : "N/A"} kcal</p>
    <div class="ingredients-list">
        <strong>Ingredients:</strong>
        <ul>
            ${recipeData.extendedIngredients.map(ingredient => `<li>${ingredient.original}</li>`).join('')}
        </ul>
    </div>
    <p class="instruction-text"><strong>Instructions:</strong> ${recipeData.instructions}</p>
        </div>

    </div>
`;


        recipeDetailsDiv.style.display = "block"; // Показываем модальное окно
    } catch (error) {
        console.log("Error loading recipe details:", error);
        recipeContentDiv.innerHTML = "Error loading recipe details. Please try again later.";
    }
}

// Функция для добавления рецепта в избранное
function addToFavorites(recipe) {
    if (recipe && recipe.id) {
        if (!favorites.some(fav => fav.id === recipe.id)) {
            favorites.push(recipe);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            alert(`${recipe.title} has been added to favorites!`);
        } else {
            alert(`${recipe.title} is already in favorites.`);
        }
    } else {
        console.error("Invalid recipe object:", recipe);
    }
}

// Функция для показа избранных рецептов
function showFavorites() {
    const favoritesList = document.getElementById("favorites-list");
    favoritesList.innerHTML = ""; // Очистка списка

    if (favorites.length === 0) {
        favoritesList.innerHTML = "No favorite recipes found.";
    } else {
        favorites.forEach(recipe => {
            const recipeItem = document.createElement("div");
            recipeItem.className = "recipe-item";
            
            const recipeImg = document.createElement("img");
            recipeImg.src = recipe.image;
            recipeImg.alt = recipe.title;

            const recipeTitle = document.createElement("h3");
            recipeTitle.textContent = recipe.title;

            const detailsLink = document.createElement("a");
            detailsLink.href = "#";
            detailsLink.textContent = "Details...";
            detailsLink.onclick = function () {
                showRecipeDetails(recipe.id, recipe); // Передаем объект recipe
            };

            recipeItem.appendChild(recipeImg);
            recipeItem.appendChild(recipeTitle);
            recipeItem.appendChild(detailsLink);
            favoritesList.appendChild(recipeItem);
        });
    }
}

// Закрытие модального окна
function closeRecipeDetails() {
    document.getElementById("recipe-details").style.display = "none";
}

// Функция поиска рецептов
async function searchRecipes() {
    const searchQuery = document.getElementById("search-query").value;

    if (!searchQuery) {
        alert('Please enter a search term!');
        return;
    }

    try {
        const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&query=${searchQuery}`);
        const data = await response.json();
        const searchResults = document.getElementById("search-results");

        searchResults.innerHTML = ""; // Очистка списка результатов поиска

        if (data.results.length === 0) {
            searchResults.innerHTML = "No recipes found.";
        } else {
            data.results.forEach(recipe => {
                const recipeItem = document.createElement("div");
                recipeItem.className = "recipe-item";

                const recipeImg = document.createElement("img");
                recipeImg.src = recipe.image;
                recipeImg.alt = recipe.title;

                const recipeTitle = document.createElement("h3");
                recipeTitle.textContent = recipe.title;

                const detailsLink = document.createElement("a");
                detailsLink.href = "#";
                detailsLink.textContent = "Details...";
                detailsLink.onclick = function () {
                    showRecipeDetails(recipe.id, recipe); // Передаем объект recipe
                };

                recipeItem.appendChild(recipeImg);
                recipeItem.appendChild(recipeTitle);
                recipeItem.appendChild(detailsLink);
                searchResults.appendChild(recipeItem);
            });
        }
    } catch (error) {
        console.error("Error searching recipes:", error);
    }
}
// Function to open the favorites modal
function openFavoritesModal() {
    showFavorites(); // Populate the favorites list
    document.getElementById("favorites-modal").style.display = "block";
}

// Function to close the favorites modal
function closeFavoritesModal() {
    document.getElementById("favorites-modal").style.display = "none";
}

// Update showFavorites to display recipes in the modal
function showFavorites() {
    const favoritesList = document.getElementById("favorites-list");
    favoritesList.innerHTML = ""; // Clear the favorites list

    if (favorites.length === 0) {
        favoritesList.innerHTML = "No favorite recipes found.";
    } else {
        favorites.forEach(recipe => {
            const recipeItem = document.createElement("div");
            recipeItem.className = "recipe-item____check";

            recipeItem.className = "recipe-item";
            
            const recipeImg = document.createElement("img");
            recipeImg.src = recipe.image;
            recipeImg.alt = recipe.title;

            const recipeTitle = document.createElement("h3");
            recipeTitle.textContent = recipe.title;

            const detailsLink = document.createElement("a");
            detailsLink.href = "#";
            detailsLink.textContent = "Details...";
            detailsLink.onclick = function () {
                showRecipeDetails(recipe.id, recipe); // Display recipe details
            };

            recipeItem.appendChild(recipeImg);
            recipeItem.appendChild(recipeTitle);
            recipeItem.appendChild(detailsLink);
            favoritesList.appendChild(recipeItem);
        });
    }
}

// Close recipe details modal
function closeRecipeDetails() {
    document.getElementById("recipe-details").style.display = "none";
}

// Загрузка популярных рецептов при запуске страницы
window.onload = loadPopularRecipes;
