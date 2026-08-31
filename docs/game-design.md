# Pikachu Matching Game - Game Design Document

## Overview

The Matching Game (commonly known as Pikachu Puzzle Game) presents a board of cells, each containing a symbol. The player finds and matches pairs of cells that contain the same symbol and can be connected via a valid path pattern. A legal match removes both cells from the board. The game ends when all matching pairs are found.

**Live demo:** https://tiennm99dev.github.io/pikachu/

## Board Structure

### Dimensions

- **Game board:** 20 columns x 8 rows = 160 cells
- **Internal matrix:** 22 columns x 10 rows (game board + 1-cell border padding on all sides)
- **Border padding** is always empty (type = 0) and is used by U-pattern paths that extend beyond the visible board

### Coordinate System

- **Matrix coordinates (internal):** 0-indexed, includes border. Row 0 and row 9 are border rows. Column 0 and column 21 are border columns.
- **Game coordinates (user-facing):** 1-indexed. Row 1-8, Column 1-20. These map directly to matrix positions (game row 1 = matrix row 1).

### Cell State

Each cell in the board has the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `type` | string or number | The symbol identifier. `0` means empty/removed. Non-zero means a symbol is present. |
| `visible` | boolean | Whether the cell is currently visible on the board. Set to `false` when removed. |
| `row` | number | Matrix row position |
| `col` | number | Matrix column position |

### Board Initialization

1. The total number of cells (160) is always even.
2. A set of distinct symbols is defined (currently 24 emoji symbols).
3. Each symbol appears an even number of times (paired). With 80 pairs needed and 24 symbol types, symbols cycle: types 0-7 appear in 4 pairs (8 cells each), types 8-23 appear in 3 pairs (6 cells each). Total: 8x8 + 16x6 = 160.
4. All symbol pairs are placed into a flat array, shuffled randomly (Fisher-Yates), then laid out left-to-right, top-to-bottom into the game board.
5. Border cells (row 0, row 9, col 0, col 21) are always initialized as empty (type = 0).

## Matching Rules

### Prerequisites

For a match attempt to be valid:

1. **Both cells must contain a symbol** (type != 0, not empty/removed)
2. **Both cells must have the same symbol** (identical type)
3. **Cells must be at different positions** (cannot select the same cell twice)
4. **A valid connecting path must exist** between the two cells

### Path Patterns

The game supports four connection patterns, checked in priority order. If a simpler pattern matches, it is used even if more complex patterns would also work.

**Priority order: I -> L -> U -> Z**

#### I-Pattern (Straight Line)

A direct horizontal or vertical straight line between two cells. All cells between them must be empty.

```
Horizontal:          Vertical:
A · · · · B          A
                     ·
                     ·
                     B
```

- The two cells must share the same row (horizontal) or same column (vertical)
- Every cell strictly between them (exclusive of endpoints) must be empty (type = 0)
- Adjacent cells (no cells between them) always satisfy I-pattern

#### L-Pattern (One Turn)

A path with exactly one 90-degree turn, forming an L shape. The path goes through a corner point.

```
A · · · C            A
        |            |
        |            |
        B            C · · · B
```

- Two possible corner points exist: (startRow, endCol) and (endRow, startCol)
- The corner point cell must be empty
- The path from start to corner must be a clear straight line (I-pattern)
- The path from corner to end must be a clear straight line (I-pattern)
- If one corner is blocked, the other is tried

#### U-Pattern (Border Extension)

A path with two turns that extends beyond the bounding box of the two cells, typically routing through the border padding area. The path forms a U shape.

```
    A · · ·|          · · A
    |      |          |   |
    |      |          |   |
    B · · ·|          · · B
    (extends right)   (extends left)

    |· · · ·|         A · · B
    A       B         |     |
                      |· · ·|
    (extends up)      (extends down)
```

- The path consists of 4 points: start -> connect1 -> connect2 -> end
- The connecting column/row is outside the bounding box of the two endpoints
- The algorithm scans outward from the endpoints (right, left, down, up) looking for a valid connecting line
- Border cells (always empty) enable paths to route around all obstacles on the board
- For same-column cards: extends horizontally (left or right) to find a connecting column
- For same-row cards: extends vertically (up or down) to find a connecting row

**Key implementation detail:** The U-pattern checks if the horizontal/vertical segment between the two cards' rows/columns is clear at the extending side. If blocked by a card at that edge, the extension in that direction fails.

#### Z-Pattern (Two Turns Through Interior)

A path with two turns where the connecting segment passes through the interior space (between or around the cells), not extending beyond the bounding box like U-pattern.

```
A · · C1              A
      |               |
      |               C1 · · · C2
      C2 · · B                  |
                                B
(H-V-H)              (V-H-V)
```

- The path consists of 4 points: start -> corner1 -> corner2 -> end
- Two scanning strategies:
  - **H-V-H (Horizontal-Vertical-Horizontal):** Scan all columns. For each column `c` (excluding start.col and end.col), check if corner1=(startRow, c) and corner2=(endRow, c) are both empty, and all three segments (start->corner1, corner1->corner2, corner2->end) are clear straight lines.
  - **V-H-V (Vertical-Horizontal-Vertical):** Scan all rows. For each row `r` (excluding start.row and end.row), check if corner1=(r, startCol) and corner2=(r, endCol) are both empty, and all three segments are clear.
- Connecting columns/rows at the start or end positions are skipped (those would degenerate to L-pattern)
- The scan includes border cells (row 0, row 9, col 0, col 21), which are always empty

### Path Validation Helper

The `isPathClear(start, end)` function is the fundamental building block:

- Returns `true` if start and end are the same point
- Returns `true` if start and end share a row or column and all cells strictly between them are empty
- Returns `false` if start and end are neither on the same row nor same column (not a straight line)

### After a Valid Match

1. Both matched cells are removed: `type` set to 0, `visible` set to false
2. The empty positions remain as blank spaces (they do NOT collapse or shift)
3. These empty cells can now be used as path segments for future matches

## Game Flow

### Scene Sequence

1. **Boot** - Load minimal assets (background image)
2. **Preloader** - Load remaining assets, show progress bar
3. **MainMenu** - Title screen with "Start Game" button
4. **PikachuGame** - Main game scene

### Player Interaction

1. Player clicks a cell to select it (highlighted with green background + scale pulse)
2. Player clicks a second cell:
   - If same symbol AND valid path exists: **Match!** Both cells animate (white flash, scale up, fade out) and are removed. Moves counter increments.
   - If same symbol but no valid path: **Mismatch!** Both cells flash red and shake. Selection cleared.
   - If different symbols: **Mismatch!** Same red flash + shake feedback.
3. Repeat until all cells are removed.

### Win Condition

The game is complete when no visible cells remain on the board (all 160 cells have been matched and removed). A completion screen shows congratulations and the total number of moves.

### Features

| Feature | Description |
|---------|-------------|
| **New Game** | Reset the board with a fresh random layout. Moves counter resets to 0. |
| **Hint** | Finds and highlights a valid matching pair with a yellow pulse animation. Searches all visible cell pairs until a valid path is found. |
| **Debug Mode** | Toggle debug visualization. When ON, valid match paths are drawn in green, invalid attempts in red. Shows the actual path segments used. |
| **Moves Counter** | Tracks the number of match attempts (both successful and failed). |

## Visual Design

### Theme

- Dark elegant background: `#16213e`
- Accent color (titles): `#f1c40f` (gold)
- Text: `#ecf0f1` (light), `#7f8c8d` (muted)

### Cell Rendering

Cells are rendered as Phaser containers with:
- **Background:** 48x48px rounded rectangle (6px radius) with dark fill and subtle border
- **Emoji symbol:** 28px centered with padding to prevent glyph clipping

### Cell States

| State | Visual |
|-------|--------|
| Normal | Cream background (`#faf8ef`) |
| Hover | Light blue background (`#e0e8f0`) + 1.08x scale |
| Selected | Light green background (`#c8f7c5`) + scale pulse 1.15x -> 1.05x |
| Hint | Light yellow background (`#fff3cd`) + pulsing scale |
| Mismatch | Light red background (`#f5b7b1`) + horizontal shake |
| Match (removing) | White background + 1.3x scale + fade out |

### Animations

All animations follow UX timing guidelines:
- Press feedback: 60-80ms
- Hover transitions: 100ms
- Selection pulse: 120ms
- Match removal: 300ms
- Mismatch shake: 3 cycles x 50ms
- Scene transitions: 300-400ms fade
- Menu title entrance: 700ms with Back.easeOut

### Buttons

| Button | Color | Action |
|--------|-------|--------|
| New Game | Blue `#3498db` | Reset board |
| Hint | Orange `#e67e22` | Show valid pair |
| Debug | Purple `#8e44ad` (OFF) / Green `#27ae60` (ON) | Toggle path visualization |
| Main Menu | Gray `#636e72` | Return to menu |

All buttons have hover scale (1.05x) and press feedback (0.95x).

## Symbol Set

The game uses 24 emoji symbols as cell faces:

```
😀 😂 🥰 😎 🤩 😴 🤔 😱
🐶 🐱 🐸 🦊 🐻 🐼 🐨 🦁
🍎 🍕 🚀 💎 ⭐ 🔥 🦄 🌈
```

Categories: faces (8), animals (8), objects (8). Each symbol appears in multiple pairs across the board.

## Technical Architecture

### Stack

- **Phaser 3** (v3.90.0) - Game engine
- **Next.js** (v15.3.1) - Web framework (static export)
- **React** (v19) - UI layer (minimal, bridges to Phaser)

### Key Files

| File | Purpose |
|------|---------|
| `src/game/logic/PikachuGameLogic.js` | Pure pattern matching logic (no Phaser deps), used by both game and tests |
| `src/game/scenes/PikachuGame.js` | Game scene: board rendering, interaction, animations |
| `src/game/scenes/MainMenu.js` | Menu scene with entrance animations |
| `src/game/scenes/Preloader.js` | Asset loading with progress bar |

### Logic Architecture

`PikachuGameLogic` is the single source of truth for path finding:

- `findPath(start, end)` -> `{valid, path, pattern}` — tries patterns in priority order
- `hasValidPath(start, end)` -> boolean — delegates to `findPath`
- `findIPath`, `findLPath`, `findUPath`, `findZPath` — individual pattern finders returning path arrays or null
- `isPathClear(start, end)` — checks if straight line between two points is empty

The game scene (`PikachuGame`) creates a `PikachuGameLogic` instance and shares its board reference. All pattern checking is delegated to the logic class.

### Testing

84 Jest tests cover all four patterns:
- I-pattern: horizontal/vertical lines, blocked paths, edge cases
- L-pattern: both corner options, blocking, right-angle variations
- U-pattern: all four extension directions, border routing, blocking
- Z-pattern: H-V-H and V-H-V scanning, dense boards, asymmetric cases
- Integration: pattern priority, cascading fallbacks, impossible connections

### Debug URL

`http://localhost:8080?scene=game` — skip menu, go directly to game board.
