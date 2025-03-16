Game Design Document (GDD) for "Coliseum"
1. Overview
Game Concept:
"Coliseum Duel" is a first-person sword-fighting game where players battle in a large, open coliseum arena. You face off against a bot in intense one-on-one combat, using directional sword slashes and well-timed blocks to outsmart your opponent. Built for web browsers using Three.js, it delivers a 3D experience with a playful, cartoony art style.

Genre:
First-Person Fighting / Action

Platform:
Web Browser (using Three.js for 3D rendering)

Target Audience:
Teens and adults who enjoy fast-paced, skill-based combat games with a fun, lighthearted tone.

Art Style:
Cartoony—bright colors, exaggerated character models, oversized swords, and dramatic animations to keep the vibe energetic and approachable.

2. Gameplay Mechanics
2.1 Movement
Controls:  
W: Move forward  

A: Strafe left  

S: Move backward  

D: Strafe right

Details:
Movement is smooth and responsive, letting players circle, approach, or retreat from their opponent in the spacious arena. No sprint or crouch mechanics are included yet to keep it straightforward.

2.2 Combat System
Combat is built around directional sword attacks and matching defensive blocks.
2.2.1 Attacking
Controls:  
Up Arrow: Downwards slash (overhead strike)  

Down Arrow: Straight fencing-style thrust (lunge forward)  

Left Arrow: Left-to-right horizontal slash  

Right Arrow: Right-to-left horizontal slash

Details:
Each attack has a unique animation and hitbox. Players can spam attacks without a stamina limit for now, encouraging aggressive play. Each successful hit deals 25 damage.

2.2.2 Defending
Controls:  
Shift + Up Arrow: Block downwards attacks  

Shift + Down Arrow: Block thrust attacks  

Shift + Left Arrow: Block left-to-right attacks  

Shift + Right Arrow: Block right-to-left attacks

Details:
Holding Shift and pressing an arrow key raises a block in that direction. A perfectly timed block negates damage from a matching attack direction. Mismatched blocks let the hit through.

2.3 Health System
Total Health:
Both player and bot start with 100 health points.  

Damage:
Each successful attack reduces the opponent’s health by 25 points.  

Win Condition:
The duel ends when either the player or bot’s health hits zero. Optional best-of-three rounds could extend matches.

2.4 Camera System
Locked-On Camera:
The camera stays focused on the opponent, adjusting automatically as the player moves. This keeps the action centered without needing manual camera controls.

2.5 Bot AI
Behavior:
The bot mirrors the player’s attack and defense options but follows simple, predictable patterns:  
Randomly uses any of the four directional slashes.  

Occasionally blocks (random direction) with a slight delay, making it exploitable.  

Moves slowly around the arena, maintaining some distance without aggressive chasing or retreating.

Future Plans:
Smarter AI with attack combos, better blocking, and adjustable difficulty levels can be added later.

3. Controls
Here’s the full control layout for easy reference:  
Movement:  
W: Move forward  

A: Strafe left  

S: Move backward  

D: Strafe right

Attacks:  
Up Arrow: Downwards slash  

Down Arrow: Straight thrust  

Left Arrow: Left-to-right slash  

Right Arrow: Right-to-left slash

Defense:  
Shift + Up Arrow: Block downwards  

Shift + Down Arrow: Block thrust  

Shift + Left Arrow: Block left-to-right  

Shift + Right Arrow: Block right-to-left

4. Game Environment
Arena:
A large, open coliseum with ample room for dueling. It’s a flat space with no obstacles, keeping the focus on combat. Visual details include:  
Sand or stone floor.  

High walls with spectator stands (optional cheering crowd for atmosphere).  

Bright, cartoony textures to match the art style.

Scale:
The arena is big enough for dodging and positioning without feeling restrictive.

5. User Interface (UI)
Health Bars:  
Player health bar at the bottom of the screen.  

Bot health bar at the top or above the bot’s model.

Optional:  
Round counter (if best-of-three is added).  

Visual or audio cues for successful hits or blocks.

6. Technical Considerations
Platform:
Web browser using Three.js for 3D rendering.  

Optimization:  
Low-poly models and simple textures for smooth performance across devices.  

Efficient collision detection for attacks and blocks.

Input:
Keyboard-only controls (WASD, arrow keys, Shift).

7. Future Plans
Additional Weapons:  
Axes (slow, heavy hits).  

Spears (long-range thrusts).  

Daggers (quick, low-damage stabs).

Multiplayer:  
Online duels against other players.

Enhanced AI:  
Smarter bots with attack patterns and adaptive blocking.

More Arenas:  
New coliseum themes or environmental hazards.

8. Development Roadmap
Phase 1: Core Mechanics  
Build WASD movement and locked camera.  

Add arrow-key attacks with animations.  

Implement Shift-based directional blocking.

Phase 2: Bot & Health System  
Create basic bot AI with random attacks and blocks.  

Add health system and UI health bars.

Phase 3: Polish & Playtesting  
Refine animations, add sound effects (sword clashes, crowd cheers).  

Playtest for balance and fun.

Phase 4: Future Features  
Add new weapons, smarter AI, or multiplayer.

