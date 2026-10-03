# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview
This is a Pikachu emoji matching game built with Phaser 3 and Next.js. The game implements the classic "Pikachu" matching rules where players must match identical emoji pairs using I, L, U, or Z-shaped connection patterns.

## Commands

### Development
- `npm run dev` - Start development server on port 8080 (with anonymous usage logging)
- `npm run dev-nolog` - Start development server without logging
- `npm install` - Install dependencies

### Build
- `npm run build` - Create production build in dist folder (with anonymous usage logging)
- `npm run build-nolog` - Create production build without logging

### Testing
- `npm test` - Run all Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:i` - Run I-pattern tests only
- `npm run test:l` - Run L-pattern tests only
- `npm run test:u` - Run U-pattern tests only
- `npm run test:z` - Run Z-pattern tests only
- `npm run test:verbose` - Run tests with verbose output
- `npm run test:silent` - Run tests with minimal output

**Testing Framework**: Jest-based testing system with comprehensive pattern validation tests located in `test/` directory.

## Architecture

### Game Structure
- **Next.js Framework**: Uses Next.js for the web application framework
- **Phaser 3 Game Engine**: Game logic is implemented using Phaser 3 (v3.90.0)
- **React-Phaser Bridge**: Communication between React and Phaser via EventBus

### Key Components
- `src/PhaserGame.jsx` - Bridge component that initializes Phaser and handles React-Phaser communication
- `src/game/main.js` - Phaser game configuration and initialization
- `src/game/EventBus.js` - Event system for React-Phaser communication
- `src/game/scenes/` - Contains all Phaser scene classes
- `src/game/logic/PikachuGameLogic.js` - Pure game logic (no Phaser dependencies) for testing
- `test/` - Jest-based testing system with comprehensive pattern validation

### Game Scenes
1. **Boot** - Initial boot scene
2. **Preloader** - Asset loading scene  
3. **MainMenu** - Main menu interface
4. **PikachuGame** - Main game scene with emoji matching logic

### Game Logic
- **Board**: 20x8 grid of emoji cells
- **Matrix System**: 10x22 matrix with border padding (8x20 actual game board)
- **Matching Rules**: Cells must contain identical emojis and be connected via valid paths:
  - **I-pattern**: Straight line (horizontal or vertical)
  - **L-pattern**: Single 90-degree turn
  - **U-pattern**: Path extending to board border with two turns
  - **Z-pattern**: Two-turn path through empty cells
- **Game Features**: New game, hint system, selection with visual feedback, score/combo/timer, debug visualization toggle
- **Testing**: Comprehensive Jest test suite with 84 test cases covering all patterns

### Asset Structure
- Background image at `public/assets/bg.png`
- Emoji symbols rendered as Phaser text objects (no image assets needed)
- Assets are loaded through Phaser's standard asset loading system

### React-Phaser Communication
- Use `EventBus.emit()` to send events from React to Phaser
- Use `EventBus.on()` to listen for events from Phaser in React
- Scene readiness is communicated via `current-scene-ready` event
- PhaserGame component exposes game instance and current scene via React refs

## Development Notes
- Game runs on port 8080 by default
- Hot reloading is enabled for development
- The project includes anonymous usage logging (can be disabled with -nolog variants)
- All game assets should be placed in `public/assets/` directory
- Scene transitions use `this.scene.start('SceneName')`
- ES modules are used throughout the project (`"type": "module"` in package.json)
- Jest tests are completely separated from game logic - no in-game testing methods
- Debug visualization can be toggled in-game to show connection paths (green=valid, red=invalid)

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
