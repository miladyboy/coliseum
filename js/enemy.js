/**
 * Enemy class for Coliseum Duel
 * Handles bot movement, attacks, blocking, and AI behavior
 * Extends the base Character class
 */
class Enemy extends Character {
    constructor(scene, player) {
        // Configure enemy-specific properties
        const enemyConfig = {
            bodyColor: 0xe74c3c,  // Red
            headColor: 0xd5a286,  // Tan skin tone
            legColor: 0x34495e,   // Dark blue
            guardColor: 0xe74c3c, // Red
            moveSpeed: 3,         // Slower than player
            rotationSpeed: 2,     // Slower than player
            startPosition: new THREE.Vector3(0, 0, -5)
        };
        
        super(scene, enemyConfig);
        
        // Enemy-specific properties
        this.player = player;
        
        // AI behavior timers
        this.decisionTimer = 0;
        this.decisionInterval = 2; // Time between AI decisions
        this.currentBehavior = 'idle'; // idle, approach, retreat, circle
        this.behaviorTimer = 0;
        this.behaviorDuration = 3; // How long to maintain a behavior
    }
    
    update(deltaTime) {
        // Update AI behavior
        this.updateAI(deltaTime);
        
        // Call the base class update for common functionality
        super.update(deltaTime);
        
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
            
            // Calculate new position
            const newPosition = this.mesh.position.clone();
            newPosition.x += movementDirection.x * this.moveSpeed * deltaTime;
            newPosition.z += movementDirection.z * this.moveSpeed * deltaTime;
            
            // Check if new position is within arena bounds
            const ARENA_RADIUS = 19; // Slightly less than actual radius to prevent clipping
            const distanceFromCenter = Math.sqrt(newPosition.x * newPosition.x + newPosition.z * newPosition.z);
            
            if (distanceFromCenter <= ARENA_RADIUS) {
                // Move enemy if within bounds
                this.mesh.position.copy(newPosition);
                
                // Update walking animation
                this.updateWalkingAnimation(deltaTime);
                this.isWalking = true;
            } else {
                // When hitting boundary, change behavior to move away from wall
                this.currentBehavior = 'retreat';
                this.behaviorTimer = this.behaviorDuration;
                
                // Move slightly towards center
                const toCenter = new THREE.Vector3(-this.mesh.position.x, 0, -this.mesh.position.z).normalize();
                const bounceStrength = 0.3; // Adjust for desired effect
                
                this.mesh.position.x += toCenter.x * bounceStrength;
                this.mesh.position.z += toCenter.z * bounceStrength;
            }
        } else {
            // Not moving, return to idle pose
            if (this.isWalking) {
                this.setIdlePose();
                this.isWalking = false;
            }
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
    
    /**
     * Check if the enemy's attack hits the player
     */
    checkAttackHit() {
        // Calculate distance to player
        const distance = this.getDistanceToPlayer();
        
        // Check if we're close enough to hit
        const hitRange = 3.0;
        
        if (distance <= hitRange) {
            // Check if player is blocking this attack type
            if (this.player.isBlocking && this.player.isBlockingAttackType(this.attackType)) {
                // Attack blocked
                try {
                    // Only call if method exists
                    if (typeof gameManager.showBlockEffect === 'function') {
                        gameManager.showBlockEffect(this.player.mesh.position);
                    }
                } catch (error) {
                    console.log("Error in block effect:", error);
                }
            } else {
                // Attack hits
                try {
                    this.player.takeDamage(10);
                    
                    // Only call if method exists
                    if (typeof gameManager.showHitEffect === 'function') {
                        gameManager.showHitEffect(this.player.mesh.position);
                    }
                } catch (error) {
                    console.log("Error in hit effect:", error);
                }
            }
        }
        
        // Mark as dealt damage so we don't check again for this attack
        this.hasDealtDamage = true;
    }
    
    // Override parent method to use a longer attack duration
    startAttack(type) {
        super.startAttack(type);
        this.attackDuration = 0.5; // slightly slower than player
    }
    
    // Override parent method to use a longer cooldown
    stopBlock() {
        this.isBlocking = false;
        this.blockType = null;
        this.blockCooldown = 0.5; // Longer cooldown than player
        this.resetWeaponPosition();
        this.setIdlePose(); // Return to idle pose
    }
    
    // Update UI health bar
    updateHealthUI() {
        updateEnemyHealth(this.health, this.maxHealth);
    }
    
    die() {
        // Game over - handled by game manager
        gameManager.enemyDied();
    }
    
    // Reset enemy for new game
    reset() {
        super.reset();
        this.mesh.position.set(0, 0, -5);
        this.mesh.rotation.set(0, 0, 0);
        this.currentBehavior = 'idle';
    }
} 