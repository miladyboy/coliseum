/**
 * Base Character class for Coliseum Duel
 * Handles common functionality for character movement, attacks, blocking, and animations
 */
class Character {
    constructor(scene, config = {}) {
        // References
        this.scene = scene;
        
        // Default config with override from provided config
        this.config = {
            health: 100,
            moveSpeed: 5,
            rotationSpeed: 3,
            bodyColor: 0x3498db,   // Default blue
            headColor: 0xecf0f1,   // Default light skin
            legColor: 0x2c3e50,    // Default dark blue
            bladeColor: 0xbdc3c7,  // Default silver
            handleColor: 0x4b3621, // Default brown
            guardColor: 0xf1c40f,  // Default gold
            startPosition: new THREE.Vector3(0, 0, 0),
            ...config  // Override with provided config
        };
        
        // Character stats
        this.health = this.config.health;
        this.maxHealth = this.config.health;
        this.moveSpeed = this.config.moveSpeed;
        this.rotationSpeed = this.config.rotationSpeed;
        
        // Combat states
        this.isAttacking = false;
        this.isBlocking = false;
        this.attackType = null;
        this.blockType = null;
        this.attackCooldown = 0;
        this.blockCooldown = 0;
        this.hasDealtDamage = false;
        this.attackProgress = 0; // Track attack animation progress for first-person view
        
        // Animation states
        this.isWalking = false;
        this.animationMixer = null;
        this.currentAnimationAction = null;
        this.walkAnimationTime = 0;
        this.idleAnimationTime = 0;
        
        // Create character mesh
        this.createCharacterMesh();
        
        // Weapon
        this.createWeapon();
    }
    
    createCharacterMesh() {
        // Create a group for the entire character
        this.characterGroup = new THREE.Group();
        this.scene.add(this.characterGroup);
        this.characterGroup.position.copy(this.config.startPosition);
        
        // Create materials
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: this.config.bodyColor });
        const headMaterial = new THREE.MeshLambertMaterial({ color: this.config.headColor });
        const armMaterial = bodyMaterial;
        const legMaterial = new THREE.MeshLambertMaterial({ color: this.config.legColor });
        
        // Torso
        const torsoGeometry = new THREE.BoxGeometry(1, 1.2, 0.6);
        this.torso = new THREE.Mesh(torsoGeometry, bodyMaterial);
        this.torso.position.y = 1.4;
        this.characterGroup.add(this.torso);
        
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
        
        // Create a camera target (for the follow camera)
        this.cameraTarget = new THREE.Object3D();
        this.torso.add(this.cameraTarget);
        this.cameraTarget.position.set(0, 0.5, 0);
        
        // Set reference to main mesh for compatibility with existing code
        this.mesh = this.characterGroup;
        
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
            color: this.config.bladeColor,
            metalness: 0.8,
            roughness: 0.2
        });
        this.blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
        this.blade.position.set(0, 1, 0);
        this.weaponGroup.add(this.blade);
        
        // Handle
        const handleGeometry = new THREE.BoxGeometry(0.15, 0.5, 0.15);
        const handleMaterial = new THREE.MeshLambertMaterial({ color: this.config.handleColor });
        this.handle = new THREE.Mesh(handleGeometry, handleMaterial);
        this.handle.position.set(0, 0.15, 0);
        this.weaponGroup.add(this.handle);
        
        // Guard
        const guardGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.3);
        const guardMaterial = new THREE.MeshLambertMaterial({ color: this.config.guardColor });
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
    
    // Base update method that will be called by subclasses
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
    
    // Should be implemented by subclasses
    handleMovement(deltaTime) {
        console.warn('handleMovement method not implemented in subclass');
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
    
    startAttack(type) {
        this.attackType = type;
        this.isAttacking = true;
        this.attackTime = 0;
        this.hasDealtDamage = false;
        this.attackProgress = 0; // Reset attack progress
        
        // Reset weapon position
        this.resetWeaponPosition();
        
        // Set attack position based on type
        switch (type) {
            case 'horizontal':
                // Horizontal swing
                this.rightArm.rotation.x = 0.5;
                this.rightArm.rotation.z = 0.5;
                this.rightArmUpper.rotation.x = 0.5;
                break;
            case 'vertical':
                // Vertical swing (overhead)
                this.rightArm.rotation.x = -1.2;
                this.rightArmUpper.rotation.x = -0.3;
                break;
            case 'thrust':
                // Forward thrust
                this.rightArm.rotation.x = 0.3;
                this.rightArmUpper.rotation.x = 0.3;
                this.leftArm.rotation.x = 0.3; // Support with left arm
                break;
        }
    }
    
    updateAttackAnimation(deltaTime) {
        // Update attack time
        this.attackTime += deltaTime;
        
        // Total attack duration
        const attackDuration = 0.3; // 0.3 seconds
        
        // Calculate attack progress (0 to 1)
        this.attackProgress = Math.min(this.attackTime / attackDuration, 1);
        
        // Check if attack should end
        if (this.attackProgress >= 1) {
            this.isAttacking = false;
            this.attackProgress = 0;
            this.resetWeaponPosition();
            this.setIdlePose();
            return;
        }
        
        // Check if we should deal damage at the midpoint of the attack
        if (!this.hasDealtDamage && this.attackProgress > 0.5) {
            this.checkAttackHit();
        }
        
        // Update weapon position based on attack type and progress
        switch (this.attackType) {
            case 'horizontal':
                // Horizontal swing animation
                this.weaponGroup.rotation.y = this.attackProgress * Math.PI - (Math.PI / 2);
                break;
            case 'vertical':
                // Vertical swing animation
                this.weaponGroup.rotation.x = this.attackProgress * Math.PI * 0.75;
                break;
            case 'thrust':
                // Thrust animation
                this.weaponGroup.position.z = -this.attackProgress * 0.5;
                break;
        }
    }
    
    /**
     * Check if an attack hits the opponent
     * This method should determine if the character's attack connects with an opponent
     */
    checkAttackHit() {
        // Default implementation - should be overridden by subclasses
        // Always mark as having dealt damage to prevent multiple checks
        this.hasDealtDamage = true;
    }
    
    startBlock(type) {
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
    
    stopBlock() {
        this.isBlocking = false;
        this.blockType = null;
        this.blockCooldown = 0.1; // Small cooldown between blocks, can be overridden
        this.resetWeaponPosition();
        this.setIdlePose(); // Return to idle pose
    }
    
    // Check if successfully blocking an attack
    isBlockingAttackType(attackType) {
        if (!this.isBlocking || !this.blockType || !attackType) {
            return false;
        }
        
        // Simple blocking logic - a block is effective against matching attack direction
        return this.blockType === attackType;
    }
    
    // Take damage
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        
        // Update UI health bar (to be implemented by subclasses)
        this.updateHealthUI();
        
        // Check for death
        if (this.health <= 0) {
            this.die();
        }
    }
    
    // Update the health UI - should be implemented by subclasses
    updateHealthUI() {
        console.warn('updateHealthUI method not implemented in subclass');
    }
    
    // Die - should be implemented by subclasses
    die() {
        console.warn('die method not implemented in subclass');
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
    
    // Reset character for new game
    reset() {
        this.health = this.maxHealth;
        this.isAttacking = false;
        this.isBlocking = false;
        this.attackType = null;
        this.blockType = null;
        this.attackCooldown = 0;
        this.blockCooldown = 0;
        this.resetWeaponPosition();
        this.setIdlePose();
        
        // Position will be set by subclasses
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
    
    handleAttacks(deltaTime) {
        // Check if we're currently attacking
        if (this.isAttacking) {
            // Update the attack animation
            this.updateAttackAnimation(deltaTime);
            return;
        }
        
        // Don't allow attacks if we're on cooldown
        if (this.attackCooldown > 0) {
            return;
        }
        
        // Check for attack input
        const attackType = input.getAttackInput();
        if (attackType) {
            this.startAttack(attackType);
        }
    }
    
    handleBlocking(deltaTime) {
        // Can't block while attacking
        if (this.isAttacking) {
            if (this.isBlocking) {
                this.stopBlocking();
            }
            return;
        }
        
        // Don't allow blocking if we're on cooldown
        if (this.blockCooldown > 0) {
            if (this.isBlocking) {
                this.stopBlocking();
            }
            return;
        }
        
        // Check for block input
        const blockType = input.getBlockInput();
        
        // Start/update blocking
        if (blockType) {
            if (!this.isBlocking || this.blockType !== blockType) {
                this.startBlock(blockType);
            }
        } 
        // Stop blocking if no input
        else if (this.isBlocking) {
            this.stopBlocking();
        }
    }
} 