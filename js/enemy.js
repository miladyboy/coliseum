/**
 * Enemy class for Coliseum Duel
 * Handles bot movement, attacks, blocking, and AI behavior
 */
class Enemy {
    constructor(scene, player) {
        // References
        this.scene = scene;
        this.player = player;
        
        // Enemy stats
        this.health = 100;
        this.maxHealth = 100;
        this.moveSpeed = 3;
        this.rotationSpeed = 2;
        
        // Combat states
        this.isAttacking = false;
        this.isBlocking = false;
        this.attackType = null;
        this.blockType = null;
        this.attackCooldown = 0;
        this.blockCooldown = 0;
        
        // AI behavior timers
        this.decisionTimer = 0;
        this.decisionInterval = 2; // Time between AI decisions
        this.currentBehavior = 'idle'; // idle, approach, retreat, circle
        this.behaviorTimer = 0;
        this.behaviorDuration = 3; // How long to maintain a behavior
        
        // Create enemy mesh
        this.createEnemyMesh();
        
        // Weapon
        this.createWeapon();
    }
    
    createEnemyMesh() {
        // Create a simple enemy body (red box)
        const geometry = new THREE.BoxGeometry(1, 2, 1);
        const material = new THREE.MeshLambertMaterial({ color: 0xe74c3c });
        this.mesh = new THREE.Mesh(geometry, material);
        
        // Position slightly above ground to prevent clipping
        this.mesh.position.set(0, 1, -5);
        
        // Add to scene
        this.scene.add(this.mesh);
    }
    
    createWeapon() {
        // Create a group for the weapon to allow rotation
        this.weaponGroup = new THREE.Group();
        this.mesh.add(this.weaponGroup);
        this.weaponGroup.position.set(0.6, 0, 0);
        
        // Create sword parts
        // Blade
        const bladeGeometry = new THREE.BoxGeometry(0.2, 1.5, 0.1);
        const bladeMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x95a5a6,
            metalness: 0.8,
            roughness: 0.2
        });
        this.blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
        this.blade.position.set(0, 1, 0);
        this.weaponGroup.add(this.blade);
        
        // Handle
        const handleGeometry = new THREE.BoxGeometry(0.15, 0.5, 0.15);
        const handleMaterial = new THREE.MeshLambertMaterial({ color: 0x2c3e50 });
        this.handle = new THREE.Mesh(handleGeometry, handleMaterial);
        this.handle.position.set(0, 0.15, 0);
        this.weaponGroup.add(this.handle);
        
        // Guard
        const guardGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.3);
        const guardMaterial = new THREE.MeshLambertMaterial({ color: 0xe74c3c });
        this.guard = new THREE.Mesh(guardGeometry, guardMaterial);
        this.guard.position.set(0, 0.45, 0);
        this.weaponGroup.add(this.guard);
        
        // Set default position
        this.resetWeaponPosition();
    }
    
    resetWeaponPosition() {
        // Default resting position
        this.weaponGroup.rotation.set(0, 0, 0);
        // Slightly angled forward
        this.weaponGroup.rotateX(Math.PI / 4);
    }
    
    update(deltaTime) {
        // Update AI behavior
        this.updateAI(deltaTime);
        
        // Handle movement
        this.handleMovement(deltaTime);
        
        // Update attack animation if attacking
        if (this.isAttacking) {
            this.updateAttackAnimation(deltaTime);
        }
        
        // Update cooldowns
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
        
        if (this.blockCooldown > 0) {
            this.blockCooldown -= deltaTime;
        }
        
        // Always face the player
        this.facePlayer();
    }
    
    updateAI(deltaTime) {
        // Update decision timer
        this.decisionTimer -= deltaTime;
        this.behaviorTimer -= deltaTime;
        
        // Make a new decision if timer is up
        if (this.decisionTimer <= 0) {
            this.makeDecision();
            this.decisionTimer = this.decisionInterval;
        }
        
        // Change behavior if behavior timer is up
        if (this.behaviorTimer <= 0) {
            this.chooseBehavior();
            this.behaviorTimer = this.behaviorDuration;
        }
        
        // Random attack
        if (!this.isAttacking && this.attackCooldown <= 0 && Math.random() < 0.02) {
            this.randomAttack();
        }
        
        // Random block (less frequent)
        if (!this.isAttacking && !this.isBlocking && this.blockCooldown <= 0 && Math.random() < 0.01) {
            this.randomBlock();
            // Stop blocking after a short delay
            setTimeout(() => {
                if (this.isBlocking) {
                    this.stopBlock();
                }
            }, 1000);
        }
    }
    
    makeDecision() {
        // Simple decision making based on distance to player
        const distanceToPlayer = this.getDistanceToPlayer();
        
        if (distanceToPlayer < 3) {
            // Too close, either attack or back up
            if (Math.random() < 0.7 && !this.isAttacking && this.attackCooldown <= 0) {
                this.randomAttack();
            } else {
                this.currentBehavior = 'retreat';
            }
        } else if (distanceToPlayer < 6) {
            // Good fighting distance, choose random behavior
            if (Math.random() < 0.3) {
                this.currentBehavior = 'approach';
            } else if (Math.random() < 0.6) {
                this.currentBehavior = 'circle';
            } else {
                this.currentBehavior = 'idle';
            }
        } else {
            // Too far, approach player
            this.currentBehavior = 'approach';
        }
    }
    
    chooseBehavior() {
        // Randomly select a behavior
        const rand = Math.random();
        
        if (rand < 0.3) {
            this.currentBehavior = 'idle';
        } else if (rand < 0.6) {
            this.currentBehavior = 'approach';
        } else if (rand < 0.8) {
            this.currentBehavior = 'retreat';
        } else {
            this.currentBehavior = 'circle';
        }
    }
    
    randomAttack() {
        // Choose a random attack type
        const attackTypes = ['up', 'down', 'left', 'right'];
        const randomType = attackTypes[Math.floor(Math.random() * attackTypes.length)];
        this.startAttack(randomType);
    }
    
    randomBlock() {
        // Choose a random block type
        const blockTypes = ['up', 'down', 'left', 'right'];
        const randomType = blockTypes[Math.floor(Math.random() * blockTypes.length)];
        this.startBlock(randomType);
    }
    
    handleMovement(deltaTime) {
        // Don't move while attacking
        if (this.isAttacking) return;
        
        // Get direction to player
        const directionToPlayer = this.getDirectionToPlayer();
        
        // Apply movement based on current behavior
        let movementDirection = new THREE.Vector3(0, 0, 0);
        
        switch (this.currentBehavior) {
            case 'approach':
                // Move toward player
                movementDirection.copy(directionToPlayer);
                break;
            case 'retreat':
                // Move away from player
                movementDirection.copy(directionToPlayer).negate();
                break;
            case 'circle':
                // Circle around player
                movementDirection.crossVectors(
                    new THREE.Vector3(0, 1, 0),
                    directionToPlayer
                );
                break;
            case 'idle':
                // Stand still
                break;
        }
        
        // Move if we have a direction
        if (movementDirection.length() > 0) {
            movementDirection.normalize();
            
            // Move enemy
            this.mesh.position.x += movementDirection.x * this.moveSpeed * deltaTime;
            this.mesh.position.z += movementDirection.z * this.moveSpeed * deltaTime;
        }
    }
    
    facePlayer() {
        // Get direction to player
        const directionToPlayer = this.getDirectionToPlayer();
        
        // Calculate target rotation
        const targetRotation = Math.atan2(directionToPlayer.x, directionToPlayer.z);
        
        // Set rotation directly (no smooth interpolation for enemy)
        this.mesh.rotation.y = targetRotation;
    }
    
    getDirectionToPlayer() {
        // Get vector pointing from enemy to player
        const direction = new THREE.Vector3();
        direction.subVectors(this.player.getPosition(), this.mesh.position);
        direction.y = 0; // Keep movement on horizontal plane
        direction.normalize();
        return direction;
    }
    
    getDistanceToPlayer() {
        // Calculate distance to player
        const playerPos = this.player.getPosition();
        const enemyPos = this.mesh.position.clone();
        // Ignore Y axis for distance calculation
        playerPos.y = 0;
        enemyPos.y = 0;
        return playerPos.distanceTo(enemyPos);
    }
    
    startAttack(type) {
        this.isAttacking = true;
        this.attackType = type;
        this.attackProgress = 0;
        this.attackDuration = 0.5; // seconds (slightly slower than player)
        
        // Reset weapon position before starting animation
        this.resetWeaponPosition();
        
        // Set initial position based on attack type
        switch (type) {
            case 'up':
                // Starting position for downward slash
                this.weaponGroup.rotation.x = Math.PI / 2;
                this.weaponGroup.position.y = 1;
                break;
            case 'down':
                // Starting position for forward thrust
                this.weaponGroup.rotation.x = -Math.PI / 6;
                this.weaponGroup.position.z = -0.5;
                break;
            case 'left':
                // Starting position for left-to-right slash
                this.weaponGroup.rotation.z = -Math.PI / 2;
                this.weaponGroup.position.x = -0.5;
                break;
            case 'right':
                // Starting position for right-to-left slash
                this.weaponGroup.rotation.z = Math.PI / 2;
                this.weaponGroup.position.x = 0.5;
                break;
        }
    }
    
    updateAttackAnimation(deltaTime) {
        // Update attack progress
        this.attackProgress += deltaTime / this.attackDuration;
        
        // Animation complete
        if (this.attackProgress >= 1) {
            this.isAttacking = false;
            this.attackCooldown = 1.0; // Longer cooldown than player
            this.resetWeaponPosition();
            return;
        }
        
        // Animate based on attack type (same as player)
        switch (this.attackType) {
            case 'up':
                // Downward slash animation
                this.weaponGroup.rotation.x = Math.PI / 2 - this.attackProgress * Math.PI;
                this.weaponGroup.position.y = 1 - this.attackProgress * 0.5;
                break;
            case 'down':
                // Forward thrust animation
                this.weaponGroup.position.z = -0.5 - this.attackProgress * 1.5;
                if (this.attackProgress > 0.5) {
                    // Return thrust
                    this.weaponGroup.position.z = -2 + (this.attackProgress - 0.5) * 3;
                }
                break;
            case 'left':
                // Left-to-right slash animation
                this.weaponGroup.rotation.z = -Math.PI / 2 + this.attackProgress * Math.PI;
                break;
            case 'right':
                // Right-to-left slash animation
                this.weaponGroup.rotation.z = Math.PI / 2 - this.attackProgress * Math.PI;
                break;
        }
    }
    
    startBlock(type) {
        this.blockType = type;
        this.isBlocking = true;
        
        // Reset weapon position
        this.resetWeaponPosition();
        
        // Set block position based on type (same as player)
        switch (type) {
            case 'up':
                // Block overhead attacks
                this.weaponGroup.rotation.x = 0;
                this.weaponGroup.position.y = 1.2;
                break;
            case 'down':
                // Block forward thrusts
                this.weaponGroup.rotation.x = Math.PI / 2;
                this.weaponGroup.position.z = -0.5;
                break;
            case 'left':
                // Block attacks from the left
                this.weaponGroup.rotation.z = -Math.PI / 4;
                this.weaponGroup.position.x = -0.5;
                break;
            case 'right':
                // Block attacks from the right
                this.weaponGroup.rotation.z = Math.PI / 4;
                this.weaponGroup.position.x = 0.5;
                break;
        }
    }
    
    stopBlock() {
        this.isBlocking = false;
        this.blockType = null;
        this.blockCooldown = 0.5; // Longer cooldown than player
        this.resetWeaponPosition();
    }
    
    // Check if successfully blocking an attack
    isBlockingAttackType(attackType) {
        if (!this.isBlocking) return false;
        
        // Check if block type matches attack type
        return this.blockType === attackType;
    }
    
    // Take damage
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        // Update UI health bar
        updateEnemyHealth(this.health, this.maxHealth);
        
        // Check for death
        if (this.health <= 0) {
            this.die();
        }
    }
    
    die() {
        // Game over - handled by game manager
        gameManager.enemyDied();
    }
    
    // Get current position as Vector3
    getPosition() {
        return this.mesh.position.clone();
    }
    
    // Reset enemy for new game
    reset() {
        this.health = this.maxHealth;
        this.mesh.position.set(0, 1, -5);
        this.mesh.rotation.set(0, 0, 0);
        this.isAttacking = false;
        this.isBlocking = false;
        this.attackType = null;
        this.blockType = null;
        this.attackCooldown = 0;
        this.blockCooldown = 0;
        this.resetWeaponPosition();
        this.currentBehavior = 'idle';
    }
} 