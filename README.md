# Coliseum Duel

A first-person sword-fighting game where you battle in a large, open coliseum arena against a bot in intense one-on-one combat.

## Game Overview

Coliseum Duel is a 3D sword fighting game built with Three.js. The game features:

- First-person combat with directional sword attacks and blocks
- AI opponent with varied behavior
- Detailed coliseum environment with spectators
- Health system and win/lose conditions

## Controls

- **Movement**: W, A, S, D
- **Attacks**:
  - Up Arrow: Downwards slash
  - Down Arrow: Straight thrust
  - Left Arrow: Left-to-right slash
  - Right Arrow: Right-to-left slash
- **Blocking**: Hold Shift + Arrow Keys in the direction you want to block
- **Developer Mode**: Press \` (backtick) to toggle orbit controls for debugging

## How to Play

1. Open `index.html` in a modern web browser
2. Click "Start Battle" on the main screen
3. Use WASD to move around the arena
4. Attack the enemy using the arrow keys
5. Block enemy attacks by holding Shift and pressing the appropriate arrow key
6. Reduce the enemy's health to zero to win

## Combat Tips

- Each successful hit deals 25 damage
- Blocks only work if you match the direction of the incoming attack
- The enemy has simple AI with random attacks and movement patterns
- Position yourself carefully to avoid enemy attacks and land your own

## Development

This game is built with:

- Three.js for 3D rendering
- Vanilla JavaScript for game logic
- HTML/CSS for UI elements

### Project Structure

- `index.html` - Main HTML file
- `/css` - Stylesheet files
- `/js` - JavaScript game files
  - `game.js` - Main game manager
  - `player.js` - Player character logic
  - `enemy.js` - Enemy AI and logic
  - `arena.js` - Environment setup
  - `input.js` - Input handling
  - `ui.js` - UI management

### Future Enhancements

- Sound effects for attacks, blocks, and ambient arena noise
- More advanced enemy AI with attack patterns
- Additional weapon types with different attack properties
- Multiple levels/opponents with increasing difficulty

## Credits

Created as a demo project based on a game design document. Uses Three.js for 3D rendering. 