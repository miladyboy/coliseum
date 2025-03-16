/**
 * UI Manager for Coliseum Duel
 * Handles game screens (start, game, end) and health bars
 */

// Game screen elements
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const resultText = document.getElementById('result-text');

// Health bar elements
const playerHealthBar = document.getElementById('player-health-bar');
const playerHealthText = document.getElementById('player-health-text');
const enemyHealthBar = document.getElementById('enemy-health-bar');
const enemyHealthText = document.getElementById('enemy-health-text');

// Button elements
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');

/**
 * Initialize UI elements and event listeners
 */
function initUI() {
    // Add event listeners for buttons
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', restartGame);
    
    // Show start screen
    showStartScreen();
}

/**
 * Show the start screen and hide others
 */
function showStartScreen() {
    startScreen.classList.remove('hidden');
    gameScreen.classList.add('hidden');
    endScreen.classList.add('hidden');
}

/**
 * Show the game screen and hide others
 */
function showGameScreen() {
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    endScreen.classList.add('hidden');
    
    // Reset health bars
    updatePlayerHealth(100, 100);
    updateEnemyHealth(100, 100);
}

/**
 * Show the end screen and hide others
 * @param {boolean} playerWon - Whether the player won the match
 */
function showEndScreen(playerWon) {
    startScreen.classList.add('hidden');
    gameScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');
    
    // Update result text
    resultText.textContent = playerWon ? 'Victory!' : 'Defeat!';
    resultText.style.color = playerWon ? '#2ecc71' : '#e74c3c';
}

/**
 * Update the player health bar and text
 * @param {number} currentHealth - Current player health
 * @param {number} maxHealth - Maximum player health
 */
function updatePlayerHealth(currentHealth, maxHealth) {
    const healthPercent = (currentHealth / maxHealth) * 100;
    playerHealthBar.style.width = `${healthPercent}%`;
    playerHealthText.textContent = `${currentHealth}/${maxHealth}`;
    
    // Change color based on health
    if (healthPercent <= 25) {
        playerHealthBar.style.backgroundColor = '#e74c3c'; // Red
    } else if (healthPercent <= 50) {
        playerHealthBar.style.backgroundColor = '#f1c40f'; // Yellow
    } else {
        playerHealthBar.style.backgroundColor = '#2ecc71'; // Green
    }
}

/**
 * Update the enemy health bar and text
 * @param {number} currentHealth - Current enemy health
 * @param {number} maxHealth - Maximum enemy health
 */
function updateEnemyHealth(currentHealth, maxHealth) {
    const healthPercent = (currentHealth / maxHealth) * 100;
    enemyHealthBar.style.width = `${healthPercent}%`;
    enemyHealthText.textContent = `${currentHealth}/${maxHealth}`;
    
    // Always red for enemy
    enemyHealthBar.style.backgroundColor = '#e74c3c';
}

/**
 * Start the game
 */
function startGame() {
    showGameScreen();
    // Call the game manager to start the game
    gameManager.startGame();
}

/**
 * Restart the game
 */
function restartGame() {
    showGameScreen();
    // Call the game manager to restart the game
    gameManager.restartGame();
} 