/**
 * Input handler for the Coliseum Duel game
 * Manages keyboard inputs for movement, attacks, and blocking
 */
class InputHandler {
    constructor() {
        // Key states
        this.keys = {
            // Movement keys
            w: false,
            a: false, 
            s: false,
            d: false,
            
            // Attack keys
            arrowup: false,
            arrowdown: false,
            arrowleft: false,
            arrowright: false,
            
            // Modifier keys
            shift: false
        };
        
        // Bind event listeners
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Handle key down events
        document.addEventListener('keydown', (event) => {
            const key = event.key.toLowerCase();
            
            // Update key state if it's in our tracked keys
            if (key in this.keys) {
                this.keys[key] = true;
                
                // Prevent default browser behavior for game controls
                event.preventDefault();
            }
        });
        
        // Handle key up events
        document.addEventListener('keyup', (event) => {
            const key = event.key.toLowerCase();
            
            // Update key state if it's in our tracked keys
            if (key in this.keys) {
                this.keys[key] = false;
            }
        });
    }
    
    // Movement methods
    isMovingForward() {
        return this.keys.w;
    }
    
    isMovingBackward() {
        return this.keys.s;
    }
    
    isMovingLeft() {
        return this.keys.a;
    }
    
    isMovingRight() {
        return this.keys.d;
    }
    
    // Attack methods
    isAttackingUp() {
        return this.keys.arrowup && !this.keys.shift;
    }
    
    isAttackingDown() {
        return this.keys.arrowdown && !this.keys.shift;
    }
    
    isAttackingLeft() {
        return this.keys.arrowleft && !this.keys.shift;
    }
    
    isAttackingRight() {
        return this.keys.arrowright && !this.keys.shift;
    }
    
    // Blocking methods
    isBlockingUp() {
        return this.keys.arrowup && this.keys.shift;
    }
    
    isBlockingDown() {
        return this.keys.arrowdown && this.keys.shift;
    }
    
    isBlockingLeft() {
        return this.keys.arrowleft && this.keys.shift;
    }
    
    isBlockingRight() {
        return this.keys.arrowright && this.keys.shift;
    }
    
    // Direction helpers
    getMovementDirection() {
        const direction = new THREE.Vector3(0, 0, 0);
        
        if (this.isMovingForward()) direction.z -= 1;
        if (this.isMovingBackward()) direction.z += 1;
        if (this.isMovingLeft()) direction.x -= 1;
        if (this.isMovingRight()) direction.x += 1;
        
        // Normalize to ensure consistent speed in all directions
        if (direction.length() > 0) {
            direction.normalize();
        }
        
        return direction;
    }
    
    // Check if any attack key is pressed
    isAttacking() {
        return this.isAttackingUp() || this.isAttackingDown() || 
               this.isAttackingLeft() || this.isAttackingRight();
    }
    
    // Check if any block key is pressed
    isBlocking() {
        return this.isBlockingUp() || this.isBlockingDown() || 
               this.isBlockingLeft() || this.isBlockingRight();
    }
}

// Create and export a single instance
const input = new InputHandler(); 