/**
 * Player class for Coliseum Duel
 * Handles player movement, attacks, blocking, and animations
 */
class Player {
    constructor(scene) {
        // References
        this.scene = scene;
        
        // Player stats
        this.health = 100;
        this.maxHealth = 100;
        this.moveSpeed = 5;
        this.rotationSpeed = 3;
        
        // Combat states
        this.isAttacking = false;
        this.isBlocking = false;
        this.attackType = null;
        this.blockType = null;
        this.attackCooldown = 0;
        this.blockCooldown = 0;
        
        // Create player mesh
        this.createPlayerMesh();
        
        // Weapon
        this.createWeapon();
    }
    
    createPlayerMesh() {
        // Create a simple player body (blue box)
        const geometry = new THREE.BoxGeometry(1, 2, 1);
        const material = new THREE.MeshLambertMaterial({ color: 0x3498db });
        this.mesh = new THREE.Mesh(geometry, material);
        
        // Position slightly above ground to prevent clipping
        this.mesh.position.set(0, 1, 5);
        
        // Add to scene
        this.scene.add(this.mesh);
        
        // Create a camera target (for the follow camera)
        this.cameraTarget = new THREE.Object3D();
        this.mesh.add(this.cameraTarget);
        this.cameraTarget.position.set(0, 1, 0);
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
            color: 0xbdc3c7,
            metalness: 0.8,
            roughness: 0.2
        });
        this.blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
        this.blade.position.set(0, 1, 0);
        this.weaponGroup.add(this.blade);
        
        // Handle
        const handleGeometry = new THREE.BoxGeometry(0.15, 0.5, 0.15);
        const handleMaterial = new THREE.MeshLambertMaterial({ color: 0x4b3621 });
        this.handle = new THREE.Mesh(handleGeometry, handleMaterial);
        this.handle.position.set(0, 0.15, 0);
        this.weaponGroup.add(this.handle);
        
        // Guard
        const guardGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.3);
        const guardMaterial = new THREE.MeshLambertMaterial({ color: 0xf1c40f });
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
        // Handle movement
        this.handleMovement(deltaTime);
        
        // Handle attacks
        this.handleAttacks(deltaTime);
        
        // Handle blocking
        this.handleBlocking(deltaTime);
        
        // Update cooldowns
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
        
        if (this.blockCooldown > 0) {
            this.blockCooldown -= deltaTime;
        }
    }
    
    handleMovement(deltaTime) {
        // Get movement direction from input
        const direction = input.getMovementDirection();
        
        // Apply movement if there's input
        if (direction.length() > 0) {
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
            
            // Calculate movement direction based on enemy orientation
            const movementDirection = new THREE.Vector3();
            
            // Forward/backward is relative to enemy direction
            if (direction.z !== 0) {
                const forwardVector = playerToEnemy.clone().multiplyScalar(-direction.z);
                movementDirection.add(forwardVector);
            }
            
            // Left/right is perpendicular to enemy direction
            if (direction.x !== 0) {
                const sideVector = new THREE.Vector3().crossVectors(
                    new THREE.Vector3(0, 1, 0), playerToEnemy
                ).multiplyScalar(-direction.x);
                movementDirection.add(sideVector);
            }
            
            // Normalize and apply movement
            if (movementDirection.length() > 0) {
                movementDirection.normalize();
            }
            
            // Move player
            this.mesh.position.x += movementDirection.x * this.moveSpeed * deltaTime;
            this.mesh.position.z += movementDirection.z * this.moveSpeed * deltaTime;
            
            // Always rotate player to face enemy
            const targetRotation = Math.atan2(playerToEnemy.x, playerToEnemy.z);
            
            // Smooth rotation
            const currentYRotation = this.mesh.rotation.y;
            const rotationDiff = targetRotation - currentYRotation;
            
            // Ensure we rotate the shortest way
            let rotationStep = this.rotationSpeed * deltaTime;
            if (Math.abs(rotationDiff) > Math.PI) {
                if (rotationDiff > 0) {
                    this.mesh.rotation.y += rotationStep;
                } else {
                    this.mesh.rotation.y -= rotationStep;
                }
                
                // Normalize rotation to [-PI, PI]
                if (this.mesh.rotation.y > Math.PI) {
                    this.mesh.rotation.y -= Math.PI * 2;
                } else if (this.mesh.rotation.y < -Math.PI) {
                    this.mesh.rotation.y += Math.PI * 2;
                }
            } else {
                // Regular rotation
                if (rotationDiff > 0) {
                    this.mesh.rotation.y = Math.min(currentYRotation + rotationStep, targetRotation);
                } else {
                    this.mesh.rotation.y = Math.max(currentYRotation - rotationStep, targetRotation);
                }
            }
        }
    }
    
    handleAttacks(deltaTime) {
        // Check if we can attack (not in cooldown or already attacking)
        if (this.attackCooldown <= 0 && !this.isAttacking && !this.isBlocking) {
            // Check for attack inputs
            if (input.isAttackingUp()) {
                this.startAttack('up');
            } else if (input.isAttackingDown()) {
                this.startAttack('down');
            } else if (input.isAttackingLeft()) {
                this.startAttack('left');
            } else if (input.isAttackingRight()) {
                this.startAttack('right');
            }
        }
        
        // Update attack animation if attacking
        if (this.isAttacking) {
            this.updateAttackAnimation(deltaTime);
        }
    }
    
    startAttack(type) {
        this.isAttacking = true;
        this.attackType = type;
        this.attackProgress = 0;
        this.attackDuration = 0.4; // seconds
        
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
            this.attackCooldown = 0.2; // Small cooldown between attacks
            this.resetWeaponPosition();
            return;
        }
        
        // Animate based on attack type
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
    
    handleBlocking(deltaTime) {
        // Check if we can block (not attacking)
        if (!this.isAttacking && this.blockCooldown <= 0) {
            // Check for blocking inputs
            if (input.isBlockingUp()) {
                this.startBlock('up');
            } else if (input.isBlockingDown()) {
                this.startBlock('down');
            } else if (input.isBlockingLeft()) {
                this.startBlock('left');
            } else if (input.isBlockingRight()) {
                this.startBlock('right');
            } else if (this.isBlocking) {
                // Stop blocking if no block key is pressed
                this.stopBlock();
            }
        }
    }
    
    startBlock(type) {
        if (this.blockType !== type) {
            this.blockType = type;
            this.isBlocking = true;
            
            // Reset weapon position
            this.resetWeaponPosition();
            
            // Set block position based on type
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
    }
    
    stopBlock() {
        this.isBlocking = false;
        this.blockType = null;
        this.blockCooldown = 0.1; // Small cooldown between blocks
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
        updatePlayerHealth(this.health, this.maxHealth);
        
        // Check for death
        if (this.health <= 0) {
            this.die();
        }
    }
    
    die() {
        // Game over - handled by game manager
        gameManager.playerDied();
    }
    
    // Get current position as Vector3
    getPosition() {
        return this.mesh.position.clone();
    }
    
    // Get forward direction vector
    getForwardDirection() {
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(this.mesh.quaternion);
        return forward;
    }
    
    // Reset player for new game
    reset() {
        this.health = this.maxHealth;
        this.mesh.position.set(0, 1, 5);
        this.mesh.rotation.set(0, 0, 0);
        this.isAttacking = false;
        this.isBlocking = false;
        this.attackType = null;
        this.blockType = null;
        this.attackCooldown = 0;
        this.blockCooldown = 0;
        this.resetWeaponPosition();
    }
} 