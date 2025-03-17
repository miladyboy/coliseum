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
        this.hasDealtDamage = false;
        
        // Animation states
        this.isWalking = false;
        this.animationMixer = null;
        this.currentAnimationAction = null;
        this.walkAnimationTime = 0;
        this.idleAnimationTime = 0;
        
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
        // Create a group for the entire enemy
        this.enemyGroup = new THREE.Group();
        this.scene.add(this.enemyGroup);
        this.enemyGroup.position.set(0, 0, -5);
        
        // Create character parts with cartoony proportions
        // Materials
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xe74c3c }); // Red
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0xd5a286 }); // Tan skin tone
        const armMaterial = bodyMaterial;
        const legMaterial = new THREE.MeshLambertMaterial({ color: 0x34495e }); // Dark blue (pants)
        
        // Torso
        const torsoGeometry = new THREE.BoxGeometry(1, 1.2, 0.6);
        this.torso = new THREE.Mesh(torsoGeometry, bodyMaterial);
        this.torso.position.y = 1.4;
        this.enemyGroup.add(this.torso);
        
        // Head
        const headGeometry = new THREE.BoxGeometry(0.7, 0.7, 0.7);
        this.head = new THREE.Mesh(headGeometry, headMaterial);
        this.head.position.y = 0.7;
        this.torso.add(this.head);
        
        // Arms
        // Left arm
        this.leftArm = new THREE.Group();
        this.leftArm.position.set(-0.6, 0.2, 0);
        this.torso.add(this.leftArm);
        
        const leftShoulderGeometry = new THREE.BoxGeometry(0.25, 0.25, 0.25);
        this.leftShoulder = new THREE.Mesh(leftShoulderGeometry, armMaterial);
        this.leftArm.add(this.leftShoulder);
        
        const leftArmUpperGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.2);
        this.leftArmUpper = new THREE.Mesh(leftArmUpperGeometry, armMaterial);
        this.leftArmUpper.position.y = -0.3;
        this.leftShoulder.add(this.leftArmUpper);
        
        const leftArmLowerGeometry = new THREE.BoxGeometry(0.18, 0.6, 0.18);
        this.leftArmLower = new THREE.Mesh(leftArmLowerGeometry, armMaterial);
        this.leftArmLower.position.y = -0.6;
        this.leftArmUpper.add(this.leftArmLower);
        
        // Right arm (sword arm)
        this.rightArm = new THREE.Group();
        this.rightArm.position.set(0.6, 0.2, 0);
        this.torso.add(this.rightArm);
        
        const rightShoulderGeometry = new THREE.BoxGeometry(0.25, 0.25, 0.25);
        this.rightShoulder = new THREE.Mesh(rightShoulderGeometry, armMaterial);
        this.rightArm.add(this.rightShoulder);
        
        const rightArmUpperGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.2);
        this.rightArmUpper = new THREE.Mesh(rightArmUpperGeometry, armMaterial);
        this.rightArmUpper.position.y = -0.3;
        this.rightShoulder.add(this.rightArmUpper);
        
        const rightArmLowerGeometry = new THREE.BoxGeometry(0.18, 0.6, 0.18);
        this.rightArmLower = new THREE.Mesh(rightArmLowerGeometry, armMaterial);
        this.rightArmLower.position.y = -0.6;
        this.rightArmUpper.add(this.rightArmLower);
        
        // Legs
        // Left leg
        this.leftLeg = new THREE.Group();
        this.leftLeg.position.set(-0.3, -0.6, 0);
        this.torso.add(this.leftLeg);
        
        const leftThighGeometry = new THREE.BoxGeometry(0.25, 0.6, 0.25);
        this.leftThigh = new THREE.Mesh(leftThighGeometry, legMaterial);
        this.leftThigh.position.y = -0.3;
        this.leftLeg.add(this.leftThigh);
        
        const leftCalfGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.2);
        this.leftCalf = new THREE.Mesh(leftCalfGeometry, legMaterial);
        this.leftCalf.position.y = -0.6;
        this.leftThigh.add(this.leftCalf);
        
        // Right leg
        this.rightLeg = new THREE.Group();
        this.rightLeg.position.set(0.3, -0.6, 0);
        this.torso.add(this.rightLeg);
        
        const rightThighGeometry = new THREE.BoxGeometry(0.25, 0.6, 0.25);
        this.rightThigh = new THREE.Mesh(rightThighGeometry, legMaterial);
        this.rightThigh.position.y = -0.3;
        this.rightLeg.add(this.rightThigh);
        
        const rightCalfGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.2);
        this.rightCalf = new THREE.Mesh(rightCalfGeometry, legMaterial);
        this.rightCalf.position.y = -0.6;
        this.rightThigh.add(this.rightCalf);
        
        // Set reference to main mesh for compatibility with existing code
        this.mesh = this.enemyGroup;
        
        // Set default pose
        this.setIdlePose();
    }
    
    // Default standing pose
    setIdlePose() {
        // Reset all rotations first
        this.rightArm.rotation.set(0, 0, 0);
        this.rightShoulder.rotation.set(0, 0, 0);
        this.rightArmUpper.rotation.set(0, 0, 0);
        this.rightArmLower.rotation.set(0, 0, 0);
        
        this.leftArm.rotation.set(0, 0, 0);
        this.leftShoulder.rotation.set(0, 0, 0);
        this.leftArmUpper.rotation.set(0, 0, 0);
        this.leftArmLower.rotation.set(0, 0, 0);
        
        this.leftLeg.rotation.set(0, 0, 0);
        this.leftThigh.rotation.set(0, 0, 0);
        this.leftCalf.rotation.set(0, 0, 0);
        
        this.rightLeg.rotation.set(0, 0, 0);
        this.rightThigh.rotation.set(0, 0, 0);
        this.rightCalf.rotation.set(0, 0, 0);
        
        // Slightly bend the arms for a natural pose
        this.rightArm.rotation.z = -0.1;
        this.rightArmUpper.rotation.x = 0.2;
        this.rightArmLower.rotation.x = 0.3;
        
        this.leftArm.rotation.z = 0.1;
        this.leftArmUpper.rotation.x = 0.2;
        this.leftArmLower.rotation.x = 0.3;
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
        
        // Update idle animation if not moving, attacking, or blocking
        if (!this.isWalking && !this.isAttacking && !this.isBlocking) {
            this.updateIdleAnimation(deltaTime);
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
            
            // Update walking animation
            this.updateWalkingAnimation(deltaTime);
            this.isWalking = true;
        } else {
            // Not moving, return to idle pose
            if (this.isWalking) {
                this.setIdlePose();
                this.isWalking = false;
            }
        }
    }
    
    updateWalkingAnimation(deltaTime) {
        // Update animation time
        this.walkAnimationTime += deltaTime * 5; // Control animation speed
        
        // Calculate leg and arm swing based on sine wave
        const legSwing = Math.sin(this.walkAnimationTime) * 0.4;
        const armSwing = Math.sin(this.walkAnimationTime) * 0.2;
        
        // Animate legs (opposite phase)
        this.leftThigh.rotation.x = legSwing;
        this.rightThigh.rotation.x = -legSwing;
        
        // Add a slight bend to the knees when the leg is moving backward
        this.leftCalf.rotation.x = Math.max(0, -legSwing * 0.7);
        this.rightCalf.rotation.x = Math.max(0, legSwing * 0.7);
        
        // Animate arms (opposite to legs)
        this.leftArmUpper.rotation.x = -armSwing + 0.2; // Keep a slight bend
        this.rightArmUpper.rotation.x = armSwing + 0.2;
        
        // Add a slight torso bounce
        this.torso.position.y = 1.4 + Math.abs(Math.sin(this.walkAnimationTime * 2)) * 0.05;
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
        this.hasDealtDamage = false;
        
        // Reset weapon position before starting animation
        this.resetWeaponPosition();
        
        // Set initial position based on attack type
        switch (type) {
            case 'up':
                // Starting position for downward slash
                // Raise arm and weapon above head
                this.rightArm.rotation.x = -0.8;
                this.rightArmUpper.rotation.x = -0.5;
                this.weaponGroup.rotation.x = Math.PI / 2;
                this.weaponGroup.position.y = 1;
                break;
            case 'down':
                // Starting position for forward thrust
                // Pull arm back for thrust
                this.rightArm.rotation.x = 0.5;
                this.rightArmUpper.rotation.x = 0.3;
                this.weaponGroup.rotation.x = -Math.PI / 6;
                this.weaponGroup.position.z = -0.5;
                break;
            case 'left':
                // Starting position for left-to-right slash
                // Wind up from left side
                this.rightArm.rotation.z = 0.5;
                this.rightArmUpper.rotation.z = 0.3;
                this.weaponGroup.rotation.z = -Math.PI / 2;
                this.weaponGroup.position.x = -0.5;
                break;
            case 'right':
                // Starting position for right-to-left slash
                // Wind up from right side
                this.rightArm.rotation.z = -0.5;
                this.rightArmUpper.rotation.z = -0.3;
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
            this.setIdlePose();
            return;
        }
        
        // Animate based on attack type (same as player)
        switch (this.attackType) {
            case 'up':
                // Downward slash animation
                if (this.attackProgress < 0.5) {
                    // First half - swing down
                    const progress = this.attackProgress * 2; // Scale to 0-1 range
                    this.rightArm.rotation.x = -0.8 + progress * 1.6; // From -0.8 to 0.8
                    this.rightArmUpper.rotation.x = -0.5 + progress * 1.0; // From -0.5 to 0.5
                    this.weaponGroup.rotation.x = Math.PI / 2 - progress * Math.PI; // Full 180 degree swing
                    this.weaponGroup.position.y = 1 - progress * 0.5;
                } else {
                    // Second half - return to neutral
                    const progress = (this.attackProgress - 0.5) * 2; // Scale to 0-1 range
                    this.rightArm.rotation.x = 0.8 - progress * 0.9; // Return to slight bend
                    this.rightArmUpper.rotation.x = 0.5 - progress * 0.3; // Return to slight bend
                    this.weaponGroup.rotation.x = -Math.PI / 2 + progress * (Math.PI / 2 + Math.PI / 4); // Return to angled forward
                    this.weaponGroup.position.y = 0.5 - progress * 0.5;
                }
                break;
            case 'down':
                // Forward thrust animation
                if (this.attackProgress < 0.5) {
                    // First half - thrust forward
                    const progress = this.attackProgress * 2;
                    this.rightArm.rotation.x = 0.5 - progress * 0.7; // From pulled back to extended
                    this.rightArmUpper.rotation.x = 0.3 - progress * 0.1; // Straighten slightly
                    this.weaponGroup.position.z = -0.5 - progress * 1.5; // Extend forward
                } else {
                    // Second half - return to neutral
                    const progress = (this.attackProgress - 0.5) * 2;
                    this.rightArm.rotation.x = -0.2 + progress * 0.1; // Return to neutral
                    this.rightArmUpper.rotation.x = 0.2; // Maintain slight bend
                    this.weaponGroup.position.z = -2 + progress * 2; // Return to neutral
                }
                break;
            case 'left':
                // Left-to-right slash animation
                if (this.attackProgress < 0.5) {
                    // First half - swing from left to right
                    const progress = this.attackProgress * 2;
                    this.rightArm.rotation.z = 0.5 - progress * 1.0; // From left to right
                    this.rightArmUpper.rotation.z = 0.3 - progress * 0.6; // Follow through
                    this.weaponGroup.rotation.z = -Math.PI / 2 + progress * Math.PI; // Full 180 degree swing
                } else {
                    // Second half - return to neutral
                    const progress = (this.attackProgress - 0.5) * 2;
                    this.rightArm.rotation.z = -0.5 + progress * 0.4; // Return to neutral
                    this.rightArmUpper.rotation.z = -0.3 + progress * 0.2; // Return to neutral
                    this.weaponGroup.rotation.z = Math.PI / 2 - progress * (Math.PI / 2); // Return to neutral
                }
                break;
            case 'right':
                // Right-to-left slash animation
                if (this.attackProgress < 0.5) {
                    // First half - swing from right to left
                    const progress = this.attackProgress * 2;
                    this.rightArm.rotation.z = -0.5 + progress * 1.0; // From right to left
                    this.rightArmUpper.rotation.z = -0.3 + progress * 0.6; // Follow through
                    this.weaponGroup.rotation.z = Math.PI / 2 - progress * Math.PI; // Full 180 degree swing
                } else {
                    // Second half - return to neutral
                    const progress = (this.attackProgress - 0.5) * 2;
                    this.rightArm.rotation.z = 0.5 - progress * 0.4; // Return to neutral
                    this.rightArmUpper.rotation.z = 0.3 - progress * 0.2; // Return to neutral
                    this.weaponGroup.rotation.z = -Math.PI / 2 + progress * (Math.PI / 2); // Return to neutral
                }
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
                this.rightArm.rotation.x = -0.6;
                this.rightArmUpper.rotation.x = -0.4;
                this.weaponGroup.rotation.x = 0;
                this.weaponGroup.position.y = 1.2;
                break;
            case 'down':
                // Block forward thrusts
                this.rightArm.rotation.x = 0.3;
                this.rightArmUpper.rotation.x = 0.5;
                this.weaponGroup.rotation.x = Math.PI / 2;
                this.weaponGroup.position.z = -0.5;
                break;
            case 'left':
                // Block attacks from the left
                this.rightArm.rotation.z = 0.3;
                this.rightArmUpper.rotation.z = 0.2;
                this.weaponGroup.rotation.z = -Math.PI / 4;
                this.weaponGroup.position.x = -0.5;
                break;
            case 'right':
                // Block attacks from the right
                this.rightArm.rotation.z = -0.3;
                this.rightArmUpper.rotation.z = -0.2;
                this.weaponGroup.rotation.z = Math.PI / 4;
                this.weaponGroup.position.x = 0.5;
                break;
        }
        
        // Add a slight defensive stance
        this.torso.rotation.x = 0.1; // Lean forward slightly
        this.leftArm.rotation.x = 0.3; // Raise left arm for balance
    }
    
    stopBlock() {
        this.isBlocking = false;
        this.blockType = null;
        this.blockCooldown = 0.5; // Longer cooldown than player
        this.resetWeaponPosition();
        this.setIdlePose(); // Return to idle pose
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
    
    updateIdleAnimation(deltaTime) {
        // Update idle animation time
        this.idleAnimationTime += deltaTime;
        
        // Subtle breathing animation
        const breathingOffset = Math.sin(this.idleAnimationTime * 1.5) * 0.03;
        this.torso.position.y = 1.4 + breathingOffset;
        
        // Subtle arm movement
        const armOffset = Math.sin(this.idleAnimationTime * 0.8) * 0.02;
        this.rightArm.rotation.z = -0.1 + armOffset;
        this.leftArm.rotation.z = 0.1 - armOffset;
        
        // Subtle head movement
        const headOffset = Math.sin(this.idleAnimationTime * 0.5) * 0.02;
        this.head.rotation.z = headOffset;
        this.head.rotation.y = Math.sin(this.idleAnimationTime * 0.3) * 0.03;
    }
} 