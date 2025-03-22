# Coliseum Duel - Feature Wishlist

This document tracks desired features and improvements for the Coliseum Duel game.

## Movement & Combat

- [ ] Add a boost / roll when hitting the space bar, like in Dark Souls
  - Player should have a quick dodge roll animation
  - Roll should provide brief invincibility frames
  - Roll direction should match movement direction (forward/backward/sideways)
  - Should have a short cooldown to prevent spam
  - Could consume a stamina resource (future feature) 

- [ ] Improve combat animations for better gameplay feel
  - Add more fluid and dynamic attack animations
  - Improve blocking animations to show better defensive stances
  - Add impact effects and reactions when blocking
  - Add stagger animations when hit while not blocking

- [ ] Add windup animations for attacks
  - Increase delay between attack input and damage dealing
  - Add clear arm/weapon movement during windup phase
  - Make windup animations distinct for each attack type
  - Give players time to react and block incoming attacks
  - Balance windup duration for good gameplay feel 

- [x] Implement arena boundaries
  - Add collision detection for arena walls
  - Prevent player from moving outside the arena bounds
  - Add visual feedback when hitting boundaries (optional particle effects or screen shake)
  - Ensure dodge/roll moves respect arena boundaries
  - Consider adding arena wall bounce-back effect for more dynamic feel 

## Camera & Visual Effects

- [x] Implement first-person view
  - Change camera position to be at player's eye level
  - Add weapon view model visible from first-person perspective 
  - Implement head bobbing for walking animation
  - Add arms/hands visible in first-person view
  - Create animations for attacks and blocking in first-person
  - Add option to toggle between first and third-person views 