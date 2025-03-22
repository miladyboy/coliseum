/**
 * Player class for Coliseum Duel
 * Handles player movement, attacks, blocking, and animations
 * Extends the base Character class
 */
class Player extends Character {
    constructor(scene) {
        // Configure player-specific properties
        const playerConfig = {
            bodyColor: 0x3498db,  // Blue
            headColor: 0xecf0f1,  // Light skin tone
            legColor: 0x2c3e50,   // Dark blue
            guardColor: 0xf1c40f, // Gold
            moveSpeed: 5,
            rotationSpeed: 3,
            startPosition: new THREE.Vector3(0, 0, 5)
        };
        
        // Call parent constructor which will create the character mesh and weapon
        super(scene, playerConfig);
        
        // Flag to indicate this is the first frame
        this.isFirstFrame = true;
        
        // Always in first-person mode
        this.firstPersonArms = null;
        this.firstPersonWeapon = null;
        
        // Create first-person models
        this.createFirstPersonModels();
        
        // Hide player's head immediately for first-person
        if (this.head) {
            this.head.visible = false;
        }
        
        // Show first-person models
        if (this.firstPersonGroup) {
            this.firstPersonGroup.visible = true;
        }
    }
    
    // Create first-person arms and weapon models
    createFirstPersonModels() {
        // Create a group for first-person elements
        this.firstPersonGroup = new THREE.Group();
        this.scene.add(this.firstPersonGroup);
        this.firstPersonGroup.visible = true;
        
        // Materials (match player character)
        const armMaterial = new THREE.MeshLambertMaterial({ color: this.config.bodyColor });
        const bladeMaterial = new THREE.MeshStandardMaterial({ 
            color: this.config.bladeColor,
            metalness: 0.8,
            roughness: 0.2
        });
        const handleMaterial = new THREE.MeshLambertMaterial({ color: this.config.handleColor });
        const guardMaterial = new THREE.MeshLambertMaterial({ color: this.config.guardColor });
        
        // Create first-person arms (simplified)
        this.firstPersonArms = new THREE.Group();
        
        // Right arm (sword arm)
        const rightArm = new THREE.Group();
        
        const rightForearmGeo = new THREE.BoxGeometry(0.2, 0.6, 0.2);
        const rightForearm = new THREE.Mesh(rightForearmGeo, armMaterial);
        rightForearm.position.set(0.4, -0.3, -0.5);
        rightArm.add(rightForearm);
        
        // Left arm (shield arm)
        const leftArm = new THREE.Group();
        
        const leftForearmGeo = new THREE.BoxGeometry(0.2, 0.6, 0.2);
        const leftForearm = new THREE.Mesh(leftForearmGeo, armMaterial);
        leftForearm.position.set(-0.4, -0.3, -0.5);
        leftArm.add(leftForearm);
        
        this.firstPersonArms.add(rightArm);
        this.firstPersonArms.add(leftArm);
        this.firstPersonGroup.add(this.firstPersonArms);
        
        // Create first-person weapon
        this.firstPersonWeapon = new THREE.Group();
        
        // Blade
        const bladeGeometry = new THREE.BoxGeometry(0.2, 1.5, 0.1);
        this.fpBlade = new THREE.Mesh(bladeGeometry, bladeMaterial);
        this.fpBlade.position.set(0, 1, 0);
        this.firstPersonWeapon.add(this.fpBlade);
        
        // Handle
        const handleGeometry = new THREE.BoxGeometry(0.15, 0.5, 0.15);
        this.fpHandle = new THREE.Mesh(handleGeometry, handleMaterial);
        this.fpHandle.position.set(0, 0.15, 0);
        this.firstPersonWeapon.add(this.fpHandle);
        
        // Guard
        const guardGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.3);
        this.fpGuard = new THREE.Mesh(guardGeometry, guardMaterial);
        this.fpGuard.position.set(0, 0.45, 0);
        this.firstPersonWeapon.add(this.fpGuard);
        
        // Position the weapon in front and to the right
        this.firstPersonWeapon.position.set(0.5, -0.4, -0.7);
        this.firstPersonGroup.add(this.firstPersonWeapon);
    }
    
    // Simplified version - always in first-person
    setFirstPersonMode(enabled) {
        // Only here for compatibility - we're always in first-person now
        if (this.head) {
            this.head.visible = false;
        }
        
        if (this.firstPersonGroup) {
            this.firstPersonGroup.visible = true;
        }
    }
    
    // Renamed to updateFirstPersonView since we're always in first-person
    updateFirstPersonView(deltaTime) {
        // Position first-person group at the camera position
        if (gameManager.camera) {
            // Get camera position and rotation
            const cameraPos = gameManager.camera.position.clone();
            this.firstPersonGroup.position.copy(cameraPos);
            this.firstPersonGroup.rotation.copy(gameManager.camera.rotation);
            
            // Add head bobbing in first person
            if (this.isWalking) {
                const bobAmount = Math.sin(this.walkAnimationTime * 2) * 0.03;
                this.firstPersonGroup.position.y += bobAmount;
                
                // Slight weapon sway while walking
                const swayAmount = Math.sin(this.walkAnimationTime) * 0.02;
                this.firstPersonWeapon.rotation.z = swayAmount;
            }
        }
        
        // Update first-person weapon based on attack/block state
        if (this.isAttacking) {
            this.updateFirstPersonAttack();
        } else if (this.isBlocking) {
            this.updateFirstPersonBlock();
        } else {
            // Reset to idle position
            this.firstPersonWeapon.rotation.set(0, 0, 0);
            this.firstPersonWeapon.position.set(0.5, -0.4, -0.7);
        }
    }
    
    updateFirstPersonAttack() {
        // Simple animation for attacks in first person
        switch (this.attackType) {
            case 'horizontal':
                this.firstPersonWeapon.rotation.z = -Math.PI / 4 * this.attackProgress;
                break;
            case 'vertical':
                this.firstPersonWeapon.rotation.x = -Math.PI / 3 * this.attackProgress;
                break;
            case 'thrust':
                this.firstPersonWeapon.position.z = -0.7 - this.attackProgress * 0.5;
                break;
        }
    }
    
    updateFirstPersonBlock() {
        // Simple animation for blocking in first person
        switch (this.blockType) {
            case 'up':
                this.firstPersonWeapon.rotation.x = -Math.PI / 3;
                this.firstPersonWeapon.position.y = -0.2;
                break;
            case 'down':
                this.firstPersonWeapon.rotation.x = Math.PI / 4;
                this.firstPersonWeapon.position.y = -0.5;
                break;
            case 'left':
                this.firstPersonWeapon.rotation.z = -Math.PI / 4;
                this.firstPersonWeapon.position.x = 0.3;
                break;
            case 'right':
                this.firstPersonWeapon.rotation.z = Math.PI / 4;
                this.firstPersonWeapon.position.x = 0.7;
                break;
        }
    }
    
    handleMovement(deltaTime) {
        // Get movement direction from input
        const direction = input.getMovementDirection();
        
        // Get direction to the enemy (this will be our forward direction)
        const playerToEnemy = new THREE.Vector3();
        if (gameManager.enemy) {
            playerToEnemy.subVectors(gameManager.enemy.getPosition(), this.mesh.position);
            playerToEnemy.y = 0; // Keep on horizontal plane
            playerToEnemy.normalize();
        } else {
            // Fallback if enemy doesn't exist yet
            playerToEnemy.set(0, 0, -1);
        }
        
        // Calculate target rotation to face enemy
        const targetRotation = Math.atan2(playerToEnemy.x, playerToEnemy.z);
        
        // Set rotation directly - always face the enemy
        this.mesh.rotation.y = targetRotation;
        this.isFirstFrame = false;
        
        // Apply movement if there's input
        if (direction.length() > 0) {
            // Calculate movement direction based on enemy orientation
            const movementDirection = new THREE.Vector3();
            
            // Create a consistent reference frame for movement
            // Forward vector is always toward the enemy
            const forwardVector = playerToEnemy.clone();
            
            // Right vector is perpendicular to forward vector
            const rightVector = new THREE.Vector3().crossVectors(
                new THREE.Vector3(0, 1, 0), forwardVector
            );
            
            // Add forward/backward movement
            if (direction.z !== 0) {
                movementDirection.add(
                    forwardVector.clone().multiplyScalar(-direction.z)
                );
            }
            
            // Add left/right movement
            if (direction.x !== 0) {
                movementDirection.add(
                    rightVector.clone().multiplyScalar(-direction.x)
                );
            }
            
            // Normalize and apply movement
            if (movementDirection.length() > 0) {
                movementDirection.normalize();
            }
            
            // Calculate new position
            const newPosition = this.mesh.position.clone();
            newPosition.x += movementDirection.x * this.moveSpeed * deltaTime;
            newPosition.z += movementDirection.z * this.moveSpeed * deltaTime;
            
            // Check if new position is within arena bounds
            const ARENA_RADIUS = 19; // Slightly less than actual radius to prevent clipping
            const distanceFromCenter = Math.sqrt(newPosition.x * newPosition.x + newPosition.z * newPosition.z);
            
            if (distanceFromCenter <= ARENA_RADIUS) {
                // Move player if within bounds
                this.mesh.position.copy(newPosition);
                
                // Update walking animation
                this.updateWalkingAnimation(deltaTime);
                this.isWalking = true;
            } else {
                // Optional: Add bounce-back effect
                const toCenter = new THREE.Vector3(-newPosition.x, 0, -newPosition.z).normalize();
                const bounceStrength = 0.3; // Adjust for desired effect
                
                this.mesh.position.x += toCenter.x * bounceStrength;
                this.mesh.position.z += toCenter.z * bounceStrength;
                
                // Optional: Add visual feedback
                if (typeof gameManager.showBoundaryHitEffect === 'function') {
                    gameManager.showBoundaryHitEffect(this.mesh.position);
                }
            }
        } else {
            // Not moving, return to idle pose
            if (this.isWalking) {
                this.setIdlePose();
                this.isWalking = false;
            }
        }
    }
    
    handleAttacks(deltaTime) {
        // The parent class Character already handles this correctly
        // Just call super method to inherit the proper implementation
        super.handleAttacks(deltaTime);
    }
    
    handleBlocking(deltaTime) {
        // The parent class Character already handles this correctly
        // Just call super method to inherit the proper implementation
        super.handleBlocking(deltaTime);
    }
    
    /**
     * Check if the player's attack hits the enemy
     */
    checkAttackHit() {
        // Only proceed if the enemy exists
        if (!gameManager.enemy) {
            this.hasDealtDamage = true;
            return;
        }
        
        // Calculate distance to enemy
        const distance = this.mesh.position.distanceTo(gameManager.enemy.mesh.position);
        
        // Check if we're close enough to hit (weapon reach + character size)
        const hitRange = 3.0; // Adjust based on character and weapon size
        
        if (distance <= hitRange) {
            // Check if enemy is blocking this attack type
            if (gameManager.enemy.isBlocking && gameManager.enemy.isBlockingAttackType(this.attackType)) {
                // Attack blocked
                try {
                    // Only call if method exists
                    if (typeof gameManager.showBlockEffect === 'function') {
                        gameManager.showBlockEffect(gameManager.enemy.mesh.position);
                    }
                } catch (error) {
                    console.log("Error in block effect:", error);
                }
            } else {
                // Attack hits
                try {
                    gameManager.enemy.takeDamage(10);
                    
                    // Only call if method exists
                    if (typeof gameManager.showHitEffect === 'function') {
                        gameManager.showHitEffect(gameManager.enemy.mesh.position);
                    }
                } catch (error) {
                    console.log("Error in hit effect:", error);
                }
            }
        }
        
        // Mark as dealt damage so we don't check again for this attack
        this.hasDealtDamage = true;
    }
    
    // Update UI health bar
    updateHealthUI() {
        updatePlayerHealth(this.health, this.maxHealth);
    }
    
    die() {
        // Game over - handled by game manager
        gameManager.playerDied();
    }
    
    // Reset player for new game
    reset() {
        super.reset();
        this.mesh.position.set(0, 0, 5);
        this.isFirstFrame = true;
    }
    
    // Override update method
    update(deltaTime) {
        // Call parent update for normal character updates
        super.update(deltaTime);
        
        // Update first-person view
        this.updateFirstPersonView(deltaTime);
    }
} 