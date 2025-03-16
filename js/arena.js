/**
 * Arena class for Coliseum Duel
 * Creates the game environment including floor, walls, and lighting
 */
class Arena {
    constructor(scene) {
        this.scene = scene;
        
        // Create environment
        this.createFloor();
        this.createWalls();
        this.setupLighting();
    }
    
    createFloor() {
        // Create a large circular floor
        const radius = 20;
        const segments = 32;
        
        const geometry = new THREE.CircleGeometry(radius, segments);
        
        // Rotate to lie flat on XZ plane
        geometry.rotateX(-Math.PI / 2);
        
        // Sand-colored material
        const material = new THREE.MeshLambertMaterial({ 
            color: 0xdbbc6f,
            side: THREE.DoubleSide
        });
        
        this.floor = new THREE.Mesh(geometry, material);
        this.scene.add(this.floor);
        
        // Add a more detailed texture (grid pattern) to help with movement perception
        const gridSize = 40;
        const gridDivisions = 40;
        const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x8B4513, 0x8B4513);
        gridHelper.material.opacity = 0.2;
        gridHelper.material.transparent = true;
        this.scene.add(gridHelper);
    }
    
    createWalls() {
        // Create a cylindrical coliseum wall
        const radius = 20;
        const height = 10;
        const segments = 32;
        
        const geometry = new THREE.CylinderGeometry(radius, radius, height, segments, 1, true);
        
        // Stone-colored material
        const material = new THREE.MeshLambertMaterial({ 
            color: 0xa38b72,
            side: THREE.BackSide // Render inside of cylinder
        });
        
        this.wall = new THREE.Mesh(geometry, material);
        this.wall.position.y = height / 2;
        this.scene.add(this.wall);
        
        // Add columns around the wall
        this.addColumns(radius, segments);
        
        // Add spectator stands
        this.addSpectatorStands(radius, height);
    }
    
    addColumns(radius, segments) {
        const columnRadius = 0.5;
        const columnHeight = 12;
        const columnGeometry = new THREE.CylinderGeometry(columnRadius, columnRadius, columnHeight, 8);
        const columnMaterial = new THREE.MeshLambertMaterial({ color: 0xd0c3b5 });
        
        // Place columns evenly around the wall
        for (let i = 0; i < segments; i++) {
            if (i % 4 === 0) { // Place every 4th segment to avoid too many columns
                const angle = (i / segments) * Math.PI * 2;
                const x = Math.cos(angle) * (radius - 0.1); // Slightly inside the wall
                const z = Math.sin(angle) * (radius - 0.1);
                
                const column = new THREE.Mesh(columnGeometry, columnMaterial);
                column.position.set(x, columnHeight / 2, z);
                this.scene.add(column);
                
                // Add a simple capital on top of the column
                const capitalGeometry = new THREE.BoxGeometry(1.5, 0.5, 1.5);
                const capital = new THREE.Mesh(capitalGeometry, columnMaterial);
                capital.position.set(x, columnHeight + 0.25, z);
                this.scene.add(capital);
            }
        }
    }
    
    addSpectatorStands(radius, wallHeight) {
        // Create stepped platforms for spectators
        const rows = 3;
        const rowDepth = 2;
        const rowHeight = 1.5;
        
        const standGeometry = new THREE.BoxGeometry(1, 1, 1); 
        const standMaterial = new THREE.MeshLambertMaterial({ color: 0x8c7b6d });
        
        for (let row = 0; row < rows; row++) {
            const currentRadius = radius + 0.5 + row * rowDepth;
            const segments = Math.floor(currentRadius * 2 * Math.PI / 2); // Spacing segments based on radius
            
            for (let i = 0; i < segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                const x = Math.cos(angle) * currentRadius;
                const z = Math.sin(angle) * currentRadius;
                
                // Create the bench
                const bench = new THREE.Mesh(standGeometry, standMaterial);
                bench.scale.set(2, 0.5, rowDepth);
                bench.position.set(x, wallHeight + row * rowHeight, z);
                
                // Rotate to face the center
                bench.lookAt(0, bench.position.y, 0);
                
                this.scene.add(bench);
            }
        }
        
        // Add some "spectators" (just colored blocks for simplicity)
        this.addSpectators(radius, wallHeight, rows, rowDepth, rowHeight);
    }
    
    addSpectators(radius, wallHeight, rows, rowDepth, rowHeight) {
        // Random colors for spectators
        const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
        
        const spectatorGeometry = new THREE.BoxGeometry(0.4, 1, 0.4);
        
        for (let row = 0; row < rows; row++) {
            const currentRadius = radius + 0.5 + row * rowDepth;
            const segments = Math.floor(currentRadius * 2 * Math.PI / 1.5); // More densely packed spectators
            
            for (let i = 0; i < segments; i++) {
                // Random chance to skip a spectator for variation
                if (Math.random() < 0.3) continue;
                
                const angle = (i / segments) * Math.PI * 2;
                const x = Math.cos(angle) * currentRadius;
                const z = Math.sin(angle) * currentRadius;
                
                // Create the spectator
                const material = new THREE.MeshLambertMaterial({ 
                    color: colors[Math.floor(Math.random() * colors.length)] 
                });
                const spectator = new THREE.Mesh(spectatorGeometry, material);
                
                // Position on the stand
                spectator.position.set(
                    x, 
                    wallHeight + row * rowHeight + 1, // 1 unit above the bench
                    z
                );
                
                // Look at arena center with slight random variation
                spectator.lookAt(
                    Math.random() - 0.5, 
                    0, 
                    Math.random() - 0.5
                );
                
                this.scene.add(spectator);
            }
        }
    }
    
    setupLighting() {
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);
        
        // Add directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 20, 0);
        directionalLight.target.position.set(0, 0, 0);
        this.scene.add(directionalLight);
        this.scene.add(directionalLight.target);
        
        // Add point lights around the arena
        this.addPerimeterLights();
    }
    
    addPerimeterLights() {
        const radius = 15;
        const height = 8;
        const count = 8;
        
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            // Add point light
            const pointLight = new THREE.PointLight(0xffcc77, 0.6, 30);
            pointLight.position.set(x, height, z);
            this.scene.add(pointLight);
            
            // Optionally add a small sphere to show light position
            const sphereGeometry = new THREE.SphereGeometry(0.2, 8, 8);
            const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc77 });
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.position.copy(pointLight.position);
            this.scene.add(sphere);
        }
    }
} 