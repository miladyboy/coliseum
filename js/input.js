/**
 * Input handler for Coliseum Duel
 * Maps keyboard input to game actions for movement, attacks, and blocking
 */

// Keyboard state tracking
const keys = {};

// Movement state
const movementDirection = new THREE.Vector3();

// Initialize input handlers
function initInput() {
    // Add event listeners for keyboard
    window.addEventListener('keydown', (event) => {
        keys[event.key] = true;
    });
    
    window.addEventListener('keyup', (event) => {
        keys[event.key] = false;
    });
}

/**
 * Get current movement direction from WASD keys
 * @returns {THREE.Vector3} Normalized direction vector
 */
function getMovementDirection() {
    // Reset direction
    movementDirection.set(0, 0, 0);
    
    // Set direction based on WASD keys
    if (keys['w'] || keys['W'] || keys['ArrowUp']) {
        movementDirection.z = 1;
    }
    if (keys['s'] || keys['S'] || keys['ArrowDown']) {
        movementDirection.z = -1;
    }
    if (keys['a'] || keys['A'] || keys['ArrowLeft']) {
        movementDirection.x = 1;
    }
    if (keys['d'] || keys['D'] || keys['ArrowRight']) {
        movementDirection.x = -1;
    }
    
    return movementDirection;
}

/**
 * Check if an attack key is pressed
 * @returns {string|null} Attack type or null if no attack key is pressed
 */
function getAttackInput() {
    // If shift is held, we're blocking not attacking
    if (keys['Shift']) {
        return null;
    }
    
    // Check for attack inputs
    if (keys['ArrowUp']) {
        return 'vertical';      // Up arrow - vertical slash
    }
    if (keys['ArrowDown']) {
        return 'thrust';        // Down arrow - forward thrust
    }
    if (keys['ArrowLeft'] || keys['ArrowRight']) {
        return 'horizontal';    // Left/Right arrow - horizontal slash
    }
    
    return null;
}

/**
 * Check if a block key combination is pressed
 * @returns {string|null} Block type or null if no block key combo is pressed
 */
function getBlockInput() {
    // Blocking requires shift key
    if (!keys['Shift']) {
        return null;
    }
    
    // Check for block direction
    if (keys['ArrowUp']) {
        return 'up';
    }
    if (keys['ArrowDown']) {
        return 'down';
    }
    if (keys['ArrowLeft']) {
        return 'left';
    }
    if (keys['ArrowRight']) {
        return 'right';
    }
    
    return null;
}

// Export input functions
const input = {
    init: initInput,
    getMovementDirection,
    getAttackInput,
    getBlockInput
}; 