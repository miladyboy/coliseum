/**
 * Main Game Manager for Coliseum Duel
 * Initializes and manages all game components and the game loop
 */
class GameManager {
    constructor() {
        // Store a reference to this instance for the animate method
        this.animate = this.animate.bind(this);
        
        // Game state
        this.isRunning = false;
        this.isPaused = false;
        this.lastTime = 0;
        
        // Game objects
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.player = null;
        this.enemy = null;
        this.arena = null;
        this.devControls = null;
        
        // Always use first-person view (no toggle)
        
        // Initialize input system
        input.init();
        
        // Initialize Three.js environment
        this.initThree();
        
        // Initialize UI
        initUI();
        
        // Start animation loop
        this.animate(performance.now());
    }
    
    initThree() {
        // Create scene
        this.scene = new THREE.Scene();
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75, // Field of view
            window.innerWidth / window.innerHeight, // Aspect ratio
            0.1, // Near clipping plane
            1000 // Far clipping plane
        );
        
        // Set initial camera position
        this.camera.position.set(0, 5, 10);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87CEEB); // Sky blue background
        this.renderer.shadowMap.enabled = true;
        
        // Add renderer to the DOM
        const canvasContainer = document.getElementById('canvas-container');
        canvasContainer.innerHTML = ''; // Clear any existing content
        canvasContainer.appendChild(this.renderer.domElement);
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // Create arena
        this.arena = new Arena(this.scene);
        
        // Enable camera controls for development
        this.setupDevControls();
    }
    
    setupDevControls() {
        // Orbit controls for easier development and testing
        // THREE.OrbitControls is attached to THREE namespace by the import
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.devControls = new THREE.OrbitControls(
                this.camera, 
                this.renderer.domElement
            );
            this.devControls.enableDamping = true;
            this.devControls.dampingFactor = 0.05;
            this.devControls.enabled = false; // Disabled by default in gameplay
        } else {
            console.warn('OrbitControls not available. Dev controls disabled.');
        }
    }
    
    startGame() {
        // Create player and enemy
        this.player = new Player(this.scene);
        this.enemy = new Enemy(this.scene, this.player);
        
        // Make camera global so player can access it for movement
        window.camera = this.camera;
        
        // Set game state
        this.isRunning = true;
        this.isPaused = false;
        this.lastTime = performance.now();
        
        // Set first-person mode for player
        this.player.setFirstPersonMode(true);
        
        // Disable dev controls during gameplay
        if (this.devControls) {
            this.devControls.enabled = false;
        }
    }
    
    pauseGame() {
        if (this.isRunning && !this.isPaused) {
            this.isPaused = true;
            // Optional: add any pause effects or sounds here
        }
    }
    
    resumeGame() {
        if (this.isRunning && this.isPaused) {
            this.isPaused = false;
            this.lastTime = performance.now(); // Reset time to avoid large delta on resume
            // Optional: add any resume effects or sounds here
        }
    }
    
    restartGame() {
        // Reset player and enemy
        if (this.player && this.enemy) {
            this.player.reset();
            this.enemy.reset();
        } else {
            // Create them if they don't exist
            this.player = new Player(this.scene);
            this.enemy = new Enemy(this.scene, this.player);
        }
        
        // Reset game state
        this.isRunning = true;
        this.isPaused = false;
        this.lastTime = performance.now();
    }
    
    resetGame() {
        // Reset game state
        this.isRunning = false;
        this.isPaused = false;
        
        // Remove player and enemy from scene if they exist
        if (this.player) {
            this.scene.remove(this.player.mesh);
            this.player = null;
        }
        
        if (this.enemy) {
            this.scene.remove(this.enemy.mesh);
            this.enemy = null;
        }
    }
    
    playerDied() {
        this.isRunning = false;
        showEndScreen(false); // Player lost
    }
    
    enemyDied() {
        this.isRunning = false;
        showEndScreen(true); // Player won
    }
    
    animate(currentTime) {
        requestAnimationFrame(this.animate);
        
        // Calculate delta time
        const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;
        
        // Update dev controls
        if (this.devControls && this.devControls.enabled) {
            this.devControls.update();
        }
        
        // Only update game logic if the game is running and not paused
        if (this.isRunning && !this.isPaused && this.player && this.enemy) {
            // Update player and enemy
            this.player.update(deltaTime);
            this.enemy.update(deltaTime);
            
            // Update camera to follow player and look at enemy
            this.updateCamera();
            
            // Check for combat collisions
            this.checkCombat();
        }
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
    
    updateCamera() {
        if (!this.player || !this.enemy) return;
        
        // Get positions
        const playerPos = this.player.getPosition();
        const enemyPos = this.enemy.getPosition();
        
        // First-person camera positioning only - no third-person option
        
        // Get the world position of the player's head
        const headWorldPos = new THREE.Vector3();
        this.player.head.getWorldPosition(headWorldPos);
        
        // Set camera at eye level
        this.camera.position.copy(headWorldPos);
        
        // Get direction from player to enemy
        const playerToEnemy = new THREE.Vector3();
        playerToEnemy.subVectors(enemyPos, playerPos).normalize();
        
        // Look in the direction the player is facing
        const targetPos = new THREE.Vector3().copy(headWorldPos).add(playerToEnemy);
        this.camera.lookAt(targetPos);
    }
    
    checkCombat() {
        // Check if player is attacking and within range
        if (this.player.isAttacking && 
            this.player.attackProgress > 0.4 && // Attack is in the "hit" phase
            this.player.attackProgress < 0.6) {
            
            // Calculate distance between player and enemy
            const distance = this.player.getPosition().distanceTo(this.enemy.getPosition());
            
            // Check if enemy is within attack range
            if (distance < 3) {
                // Check if enemy is blocking this attack type
                if (!this.enemy.isBlockingAttackType(this.player.attackType)) {
                    // Apply damage if not already done for this attack
                    if (!this.player.hasDealtDamage) {
                        this.enemy.takeDamage(25);
                        this.player.hasDealtDamage = true;
                        
                        // Play hit sound (will be implemented later)
                        // this.playSound('hit');
                    }
                } else {
                    // Play block sound (will be implemented later)
                    // this.playSound('block');
                }
            }
        } else {
            // Reset damage flag when not in attack hit phase
            this.player.hasDealtDamage = false;
        }
        
        // Check if enemy is attacking and within range
        if (this.enemy.isAttacking && 
            this.enemy.attackProgress > 0.4 && // Attack is in the "hit" phase
            this.enemy.attackProgress < 0.6) {
            
            // Calculate distance between player and enemy
            const distance = this.player.getPosition().distanceTo(this.enemy.getPosition());
            
            // Check if player is within attack range
            if (distance < 3) {
                // Check if player is blocking this attack type
                if (!this.player.isBlockingAttackType(this.enemy.attackType)) {
                    // Apply damage if not already done for this attack
                    if (!this.enemy.hasDealtDamage) {
                        this.player.takeDamage(25);
                        this.enemy.hasDealtDamage = true;
                        
                        // Play hit sound (will be implemented later)
                        // this.playSound('hit');
                    }
                } else {
                    // Play block sound (will be implemented later)
                    // this.playSound('block');
                }
            }
        } else {
            // Reset damage flag when not in attack hit phase
            this.enemy.hasDealtDamage = false;
        }
    }
    
    // Toggle development controls
    toggleDevControls() {
        if (this.devControls) {
            this.devControls.enabled = !this.devControls.enabled;
        }
    }
}

// Create a global game manager instance
const gameManager = new GameManager();

// Add keyboard shortcut for dev controls (for testing)
document.addEventListener('keydown', (event) => {
    // Press Backquote (`) to toggle dev controls
    if (event.key === '`') {
        gameManager.toggleDevControls();
    }
}); 