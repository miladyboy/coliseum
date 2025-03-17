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
        this.hasDealtDamage = false;
        
        // Animation states
        this.isWalking = false;
        this.animationMixer = null;
        this.currentAnimationAction = null;
        this.walkAnimationTime = 0;
        this.idleAnimationTime = 0;
        
        // Create player mesh
        this.createPlayerMesh();
        
        // Weapon
        this.createWeapon();
    }
    
    createPlayerMesh() {
        // Create a group for the entire player
        this.playerGroup = new THREE.Group();
        this.scene.add(this.playerGroup);
        this.playerGroup.position.set(0, 0, 5);
        
        // Create character parts with cartoony proportions
        // Materials
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x3498db }); // Blue
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0xecf0f1 }); // Light skin tone
        const armMaterial = bodyMaterial;
        const legMaterial = new THREE.MeshLambertMaterial({ color: 0x2c3e50 }); // Dark blue (pants)
        
        // Torso
        const torsoGeometry = new THREE.BoxGeometry(1, 1.2, 0.6);
        this.torso = new THREE.Mesh(torsoGeometry, bodyMaterial);
        this.torso.position.y = 1.4;
        this.playerGroup.add(this.torso);
        
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
        this.mesh = this.playerGroup;
        
        // Create a camera target (for the follow camera)
        this.cameraTarget = new THREE.Object3D();
        this.torso.add(this.cameraTarget);
        this.cameraTarget.position.set(0, 0.5, 0);
        
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
            this.attackCooldown = 0.2; // Small cooldown between attacks
            this.resetWeaponPosition();
            this.setIdlePose();
            return;
        }
        
        // Animate based on attack type
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
    }
    
    stopBlock() {
        this.isBlocking = false;
        this.blockType = null;
        this.blockCooldown = 0.1; // Small cooldown between blocks
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