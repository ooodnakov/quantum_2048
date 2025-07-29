// Persistent configurable settings
const DEFAULT_SETTINGS = {
    boardSize: 6,
    startingCrystals: 3,
    quantumBonusChance: 0.3,
    maxMoveHistory: 3
};

let settings = { ...DEFAULT_SETTINGS };

// Game state

let gameState = {
    board: [],
    score: 0,
    bestScore: 0,
    crystals: settings.startingCrystals,
    gravity: 'south', // north, east, south, west
    moveHistory: [],
    gameActive: false,
    nextId: 1,
    lastAdded: null
};

// Game configuration
const TILE_COLORS = {
    2: '#ff6b6b',
    4: '#ffa726',
    8: '#ffeb3b',
    16: '#66bb6a',
    32: '#42a5f5',
    64: '#ab47bc',
    128: '#ec407a',
    256: '#f5f5f5',
    512: 'gold',
    1024: 'platinum'
};

// Cache for dynamically generated tile colors to keep TILE_COLORS immutable
const GENERATED_COLORS = {};

// Load settings from localStorage
function loadSettings() {
    const saved = localStorage.getItem('quantum2048_settings');
    let loaded = {};
    if (saved) {
        try {
            loaded = JSON.parse(saved);
        } catch {
            loaded = {};
        }
    }
    Object.assign(settings, DEFAULT_SETTINGS, loaded);
}

// Persist settings to localStorage
function saveSettings() {
    localStorage.setItem('quantum2048_settings', JSON.stringify(settings));
}

// Reset settings to defaults and persist
function resetSettings() {
    Object.assign(settings, DEFAULT_SETTINGS);
    saveSettings();
}

// Load persisted settings immediately
loadSettings();

// Generate a color for tiles beyond the predefined range
function getTileColor(value) {
    if (TILE_COLORS[value]) return TILE_COLORS[value];
    if (GENERATED_COLORS[value]) return GENERATED_COLORS[value];

    const index = Math.log2(value);
    const hue = (index * 42) % 360; // Spread hues across the spectrum
    const color = `hsl(${hue}, 70%, 60%)`;
    GENERATED_COLORS[value] = color;
    return color;
}

// Convert large numbers to abbreviated form (e.g. 10k, 1m)
function formatNumber(num) {
    if (num < 10000) return String(num);

    const suffixes = ['k', 'm', 'b', 't', 'q'];
    const exponent = Math.floor(Math.log10(num));
    const index = Math.floor(exponent / 3) - 1; // -1 because 1k starts at 1e3

    let suffix;
    if (index < suffixes.length) {
        suffix = suffixes[index];
    } else {
        suffix = String.fromCharCode('a'.charCodeAt(0) + Math.min(index - suffixes.length, 25));
    }

    const value = Math.floor(num / Math.pow(10, (index + 1) * 3));
    return `${value}${suffix}`;
}

// Find the highest tile on the board without flattening the array
function getMaxTile(board) {
    let max = 0;
    for (let r = 0; r < settings.boardSize; r++) {
        for (let c = 0; c < settings.boardSize; c++) {
            if (board[r][c].value > max) max = board[r][c].value;
        }
    }
    return max;
}

const GRAVITY_ARROWS = {
    north: '⬆️',
    east: '➡️',
    south: '⬇️',
    west: '⬅️'
};

const QUANTUM_COMBINATIONS = [
    {colors: ['#ff6b6b', '#66bb6a'], bonus: 2}, // red + green
    {colors: ['#42a5f5', '#ffa726'], bonus: 2}, // blue + orange
    {colors: ['#ffeb3b', '#ab47bc'], bonus: 2}  // yellow + purple
];

const ACHIEVEMENTS = [
    {tile: 32, crystals_reward: 1},
    {tile: 128, crystals_reward: 2},
    {tile: 512, crystals_reward: 3}
];

function createTile(value = 0) {
    return { id: value === 0 ? null : gameState.nextId++, value };
}

// Initialize game
function initGame() {
    // Load best score from localStorage if available
    const savedBestScore = localStorage.getItem('quantum2048_best');
    if (savedBestScore) {
        gameState.bestScore = parseInt(savedBestScore);
        document.getElementById('bestScore').textContent = gameState.bestScore;
    }
    
    // Initialize empty board

    gameState.board = Array.from({ length: settings.boardSize }, () => (
        Array.from({ length: settings.boardSize }, () => createTile())
    ));
    gameState.nextId = 1;
    gameState.lastAdded = null;
    gameState.score = 0;
    gameState.crystals = settings.startingCrystals;
    gameState.gravity = 'south';
    gameState.moveHistory = [];
    gameState.gameActive = true;
    
    // Add initial tiles
    addRandomTile();
    addRandomTile();
    
    updateDisplay();
    renderBoard();
}

// Start game
function startGame() {
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    initGame();
    updateBackgroundLevel();
}

// Show start screen
function showStartScreen() {
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
}

// New game
function newGame() {
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    initGame();
}

// Add random tile
function addRandomTile() {
    const emptyCells = [];
    for (let r = 0; r < settings.boardSize; r++) {
        for (let c = 0; c < settings.boardSize; c++) {
            if (gameState.board[r][c].value === 0) {
                emptyCells.push({r, c});
            }
        }
    }
    
    if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const maxTile = Math.max(2, getMaxTile(gameState.board));
        const maxPower = Math.log2(maxTile);
        const exponentOffset = 3 + Math.floor(Math.random() * 3); // between 3 and 5 below max
        const newExponent = Math.max(1, Math.floor(maxPower) - exponentOffset);
        gameState.board[randomCell.r][randomCell.c] = createTile(2 ** newExponent);
        gameState.lastAdded = { r: randomCell.r, c: randomCell.c };
    }
}

// Render board
function renderBoard(merged = [], moveDir = null, movedTiles = [], quantumTiles = []) {
    const boardElement = document.getElementById('gameBoard');
    boardElement.innerHTML = '';
    boardElement.style.gridTemplateColumns = `repeat(${settings.boardSize}, 1fr)`;
    boardElement.style.gridTemplateRows = `repeat(${settings.boardSize}, 1fr)`;

    const mergedSet = new Set(merged.map(pos => `${pos.r},${pos.c}`));
    const quantumSet = new Set(quantumTiles.map(pos => `${pos.r},${pos.c}`));
    const movedSet = new Set(movedTiles.map(pos => `${pos.r},${pos.c}`));

    for (let r = 0; r < settings.boardSize; r++) {
        for (let c = 0; c < settings.boardSize; c++) {
            const tileElement = document.createElement('div');
            tileElement.className = 'tile';

            const value = gameState.board[r][c].value;
            if (value > 0) {
                tileElement.textContent = formatNumber(value);
                tileElement.classList.add(`tile-${value}`);
                const isPredefinedColor = Object.prototype.hasOwnProperty.call(TILE_COLORS, value);
                tileElement.style.backgroundColor = getTileColor(value);

                // Ensure text is readable for generated colors
                if (!isPredefinedColor) {
                    tileElement.style.color = '#fff';
                }

                // Check if this is a quantum tile
                if (isQuantumTile(r, c)) {
                    tileElement.classList.add('quantum');
                }

                if (gameState.lastAdded && gameState.lastAdded.r === r && gameState.lastAdded.c === c) {
                    tileElement.classList.add('new-tile');
                }

                if (mergedSet.has(`${r},${c}`)) {
                    tileElement.classList.add('merged');
                }

                if (quantumSet.has(`${r},${c}`)) {
                    tileElement.classList.add('quantum-jump');
                }

                if (moveDir && movedSet.has(`${r},${c}`)) {
                    tileElement.classList.add(`move-${moveDir}`);
                }
            }
            
            boardElement.appendChild(tileElement);
        }
    }

    gameState.lastAdded = null;
}

// Check if tile is quantum (has complementary neighbors)
function isQuantumTile(r, c) {
    const value = gameState.board[r][c].value;
    if (value === 0) return false;
    
    const color = TILE_COLORS[value];
    const neighbors = [
        [r-1, c], [r+1, c], [r, c-1], [r, c+1]
    ];
    
    for (let [nr, nc] of neighbors) {
        if (nr >= 0 && nr < settings.boardSize && nc >= 0 && nc < settings.boardSize) {
            const neighborValue = gameState.board[nr][nc].value;
            if (neighborValue > 0) {
                const neighborColor = TILE_COLORS[neighborValue];
                if (isComplementaryColor(color, neighborColor)) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Check if colors are complementary
function isComplementaryColor(color1, color2) {
    return QUANTUM_COMBINATIONS.some(combo => 
        (combo.colors.includes(color1) && combo.colors.includes(color2)) &&
        color1 !== color2
    );
}

// Update display
function updateDisplay() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('bestScore').textContent = gameState.bestScore;
    document.getElementById('crystalCount').textContent = gameState.crystals;
    document.getElementById('gravityArrow').textContent = GRAVITY_ARROWS[gameState.gravity];
    
    // Update rewind button state
    const rewindButton = document.getElementById('rewindButton');
    rewindButton.disabled = gameState.crystals === 0 || gameState.moveHistory.length === 0;
}

// Rotate gravity
function rotateGravity() {
    const gravityOrder = ['north', 'east', 'south', 'west'];
    const currentIndex = gravityOrder.indexOf(gameState.gravity);
    gameState.gravity = gravityOrder[(currentIndex + 1) % 4];
    
    // Animate gravity arrow rotation
    const gravityArrow = document.getElementById('gravityArrow');
    gravityArrow.style.transform = 'rotate(90deg)';
    setTimeout(() => {
        gravityArrow.style.transform = 'rotate(0deg)';
        updateDisplay();
    }, 150);

    // Add wobble effect to the board
    const boardElement = document.getElementById('gameBoard');
    boardElement.classList.add('wobble');
    boardElement.addEventListener('animationend', () => {
        boardElement.classList.remove('wobble');
    }, { once: true });
}

// Save game state for rewind
function saveGameState() {
    const stateCopy = {
        board: gameState.board.map(row => row.map(cell => ({ ...cell }))),
        score: gameState.score,
        crystals: gameState.crystals
    };
    
    gameState.moveHistory.push(stateCopy);
    
    // Keep only last configured moves
    if (gameState.moveHistory.length > settings.maxMoveHistory) {
        gameState.moveHistory.shift();
    }
}

// Rewind time
function rewindTime() {
    if (gameState.crystals > 0 && gameState.moveHistory.length > 0) {
        const previousState = gameState.moveHistory.pop();
        gameState.board = previousState.board.map(row => row.map(cell => ({ ...cell })));
        gameState.score = previousState.score;
        gameState.crystals = previousState.crystals - 1;
        
        updateDisplay();
        renderBoard();
        createParticleEffect('time');
    }
}

// Get move direction based on current gravity
function getMoveDirection(key) {
    const gravityMoves = {
        north: { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' },
        east: { ArrowUp: 'left', ArrowDown: 'right', ArrowLeft: 'up', ArrowRight: 'down' },
        south: { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' },
        west: { ArrowUp: 'right', ArrowDown: 'left', ArrowLeft: 'up', ArrowRight: 'down' }
    };
    
    return gravityMoves[gameState.gravity][key];
}

// Move tiles
function move(direction) {
    if (!gameState.gameActive) return;

    saveGameState();
    const previousBoard = gameState.board.map(row => row.map(cell => ({ ...cell })));
    let moved = false;
    let scoreGained = 0;
    const newBoard = gameState.board.map(row => row.map(cell => ({ ...cell })));
    const mergePositionsTransformed = [];
    const quantumPositionsTransformed = [];
    
    // Transform board based on direction for easier processing
    let workingBoard = transformBoard(newBoard, direction);
    
    // Process each row
    for (let r = 0; r < settings.boardSize; r++) {
        const row = workingBoard[r];
        const newRow = processRow(row);
        workingBoard[r] = newRow.row;
        scoreGained += newRow.score;
        if (newRow.moved) moved = true;
        newRow.merges.forEach(idx => mergePositionsTransformed.push({ r, c: idx }));
        newRow.quantumJumps.forEach(idx => quantumPositionsTransformed.push({ r, c: idx }));
    }
    
    // Transform back
    gameState.board = transformBoard(workingBoard, direction, true);
    const mergePositions = mergePositionsTransformed.map(pos => transformCoord(pos.r, pos.c, direction, true));
    const quantumPositions = quantumPositionsTransformed.map(pos => transformCoord(pos.r, pos.c, direction, true));
    
    const prevTilePositions = new Map();
    for (let r = 0; r < settings.boardSize; r++) {
        for (let c = 0; c < settings.boardSize; c++) {
            const tile = previousBoard[r][c];
            if (tile.id !== null) {
                prevTilePositions.set(tile.id, { r, c });
            }
        }
    }

    const movedPositions = [];
    for (let r = 0; r < settings.boardSize; r++) {
        for (let c = 0; c < settings.boardSize; c++) {
            const tile = gameState.board[r][c];
            if (tile.id !== null) {
                const prevPos = prevTilePositions.get(tile.id);
                if (prevPos && (prevPos.r !== r || prevPos.c !== c)) {
                    movedPositions.push({ r, c });
                }
            }
        }
    }

    if (moved) {
        gameState.score += scoreGained;
        
        // Update best score
        if (gameState.score > gameState.bestScore) {
            gameState.bestScore = gameState.score;
            localStorage.setItem('quantum2048_best', gameState.bestScore.toString());
        }
        
        updateDisplay();
        renderBoard(mergePositions, direction, movedPositions, quantumPositions);

        // Wait for merge animations to finish before spawning new tile.
        // Disable input during the animation to avoid inconsistencies.
        gameState.gameActive = false;
        setTimeout(() => {
            addRandomTile();
            renderBoard();
            updateBackgroundLevel();
            checkAchievements();

            if (quantumPositions.length > 0) {
                createParticleEffect('quantum');
            } else {
                createParticleEffect('merge');
            }

            // Check game over after the new tile is placed
            if (isGameOver()) {
                setTimeout(endGame, 500);
            } else {
                gameState.gameActive = true;
            }
        }, 250); // Match animation duration from CSS (--duration-normal)
    }
}

// Transform board for different move directions
function transformBoard(board, direction, reverse = false) {
    const newBoard = Array.from({ length: settings.boardSize }, () => (
        Array.from({ length: settings.boardSize }, () => createTile())
    ));

    for (let r = 0; r < settings.boardSize; r++) {
        for (let c = 0; c < settings.boardSize; c++) {
            const { r: newR, c: newC } = transformCoord(r, c, direction, reverse);
            if (reverse) {
                newBoard[newR][newC] = { ...board[r][c] };
            } else {
                newBoard[r][c] = { ...board[newR][newC] };
            }
        }
    }

    return newBoard;
}

function transformCoord(r, c, direction) {
    let newR, newC;
    if (direction === 'left') {
        [newR, newC] = [r, c];
    } else if (direction === 'right') {
        [newR, newC] = [r, settings.boardSize - 1 - c];
    } else if (direction === 'up') {
        [newR, newC] = [c, r];
    } else {
        [newR, newC] = [settings.boardSize - 1 - c, r];
    }
    return { r: newR, c: newC };
}

// Process a single row (merge tiles to the left)
function processRow(row) {
    const newRow = row.filter(tile => tile.value !== 0);
    let score = 0;
    let moved = row.some((tile, i) => tile.value !== (newRow[i] ? newRow[i].value : 0));
    const merges = [];
    const quantumJumps = [];
    
    // Merge adjacent equal tiles
    for (let i = 0; i < newRow.length - 1; i++) {
        if (newRow[i].value === newRow[i + 1].value) {
            newRow[i] = { ...newRow[i], value: newRow[i].value * 2 };
            let gained = newRow[i].value;
            let quantum = false;

            // Check for quantum bonus
            if (Math.random() < settings.quantumBonusChance) {
                gained *= 2;
                quantum = true;
            }

            score += gained;
            newRow.splice(i + 1, 1);
            merges.push(i);
            if (quantum) quantumJumps.push(i);
            moved = true;
        }
    }

    // Fill the rest with zeros
    while (newRow.length < settings.boardSize) {
        newRow.push(createTile());
    }

    return { row: newRow, score, moved, merges, quantumJumps };
}

// Check achievements
function checkAchievements() {
    const maxTile = getMaxTile(gameState.board);
    
    ACHIEVEMENTS.forEach(achievement => {
        if (maxTile >= achievement.tile && !gameState[`achievement_${achievement.tile}`]) {
            gameState[`achievement_${achievement.tile}`] = true;
            gameState.crystals += achievement.crystals_reward;
            showAchievement(`Reached ${achievement.tile}! +${achievement.crystals_reward} Time Crystal${achievement.crystals_reward > 1 ? 's' : ''}!`);
        }
    });
}

// Show achievement popup
function showAchievement(text) {
    const popup = document.getElementById('achievementPopup');
    const textElement = document.getElementById('achievementText');
    
    textElement.textContent = text;
    popup.classList.remove('hidden');
    
    setTimeout(() => {
        popup.classList.add('hidden');
    }, 3000);
}

// Update background level based on highest tile
function updateBackgroundLevel() {
    const maxTile = getMaxTile(gameState.board);
    const gameScreen = document.getElementById('gameScreen');
    
    // Remove all level classes
    for (let i = 1; i <= 8; i++) {
        gameScreen.classList.remove(`level-${i}`);
    }
    
    // Add appropriate level class
    if (maxTile >= 1024) gameScreen.classList.add('level-8');
    else if (maxTile >= 512) gameScreen.classList.add('level-7');
    else if (maxTile >= 256) gameScreen.classList.add('level-6');
    else if (maxTile >= 128) gameScreen.classList.add('level-5');
    else if (maxTile >= 64) gameScreen.classList.add('level-4');
    else if (maxTile >= 32) gameScreen.classList.add('level-3');
    else if (maxTile >= 16) gameScreen.classList.add('level-2');
    else gameScreen.classList.add('level-1');
}

// Create particle effects
function createParticleEffect(type) {
    const container = document.getElementById('particlesContainer');
    let colors;
    if (type === 'time') {
        colors = ['#42a5f5', '#ab47bc'];
    } else if (type === 'quantum') {
        colors = ['#e1bee7', '#81d4fa'];
    } else {
        colors = ['#ff6b6b', '#ffa726', '#ffeb3b'];
    }
    
    for (let i = 0; i < 10; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        container.appendChild(particle);
        
        setTimeout(() => {
            if (container.contains(particle)) {
                container.removeChild(particle);
            }
        }, 1000);
    }
}

// Check if game is over
function isGameOver() {
    // Check for empty cells
    for (let r = 0; r < settings.boardSize; r++) {
        for (let c = 0; c < settings.boardSize; c++) {
            if (gameState.board[r][c].value === 0) return false;
        }
    }
    
    // Check for possible merges
    for (let r = 0; r < settings.boardSize; r++) {
        for (let c = 0; c < settings.boardSize; c++) {
            const current = gameState.board[r][c].value;

            // Check right neighbor
            if (c < settings.boardSize - 1 && current === gameState.board[r][c + 1].value) return false;

            // Check bottom neighbor
            if (r < settings.boardSize - 1 && current === gameState.board[r + 1][c].value) return false;
        }
    }
    
    return true;
}

// End game
function endGame() {
    gameState.gameActive = false;
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.remove('hidden');
    
    // Show achievements in game over screen
    const achievementsDiv = document.getElementById('achievements');
    const maxTile = getMaxTile(gameState.board);
    achievementsDiv.innerHTML = `<p>Highest tile reached: <strong>${maxTile}</strong></p>`;
}

// ---- Settings Menu ----
function populateSettingsInputs() {
    document.getElementById('settingBoardSize').value = settings.boardSize;
    document.getElementById('settingCrystals').value = settings.startingCrystals;
    document.getElementById('settingQuantumChance').value = Math.round(settings.quantumBonusChance * 100);
    document.getElementById('settingHistory').value = settings.maxMoveHistory;
}

function openSettings() {
    populateSettingsInputs();
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('settingsScreen').classList.remove('hidden');
}

function closeSettings() {
    document.getElementById('settingsScreen').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
}

function saveSettingsFromMenu() {
    const boardSize = parseInt(document.getElementById('settingBoardSize').value, 10);
    if (!Number.isNaN(boardSize)) settings.boardSize = boardSize;

    const startingCrystals = parseInt(document.getElementById('settingCrystals').value, 10);
    if (!Number.isNaN(startingCrystals)) settings.startingCrystals = startingCrystals;

    const quantumBonusChance = parseInt(document.getElementById('settingQuantumChance').value, 10);
    if (!Number.isNaN(quantumBonusChance)) settings.quantumBonusChance = quantumBonusChance / 100;

    const maxMoveHistory = parseInt(document.getElementById('settingHistory').value, 10);
    if (!Number.isNaN(maxMoveHistory)) settings.maxMoveHistory = maxMoveHistory;

    saveSettings();
    closeSettings();
}

function resetSettingsFromMenu() {
    resetSettings();
    populateSettingsInputs();
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (!gameState.gameActive) return;
    
    if (e.key === ' ') {
        e.preventDefault();
        rotateGravity();
    } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        rewindTime();
    } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const direction = getMoveDirection(e.key);
        move(direction);
    }
});

// Touch controls
let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(e) {
    if (!gameState.gameActive) return;
    e.preventDefault();
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}

function handleTouchMove(e) {
    if (!gameState.gameActive) return;
    e.preventDefault();
}

function handleTouchEnd(e) {
    if (!gameState.gameActive) return null;
    e.preventDefault();
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    const minSwipeDistance = 50;
    
    if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
        let direction;
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            direction = deltaX > 0 ? 'right' : 'left';
        } else {
            direction = deltaY > 0 ? 'down' : 'up';
        }
        
        // Transform direction based on gravity
        const gravityKey = direction === 'up' ? 'ArrowUp' : 
                          direction === 'down' ? 'ArrowDown' :
                          direction === 'left' ? 'ArrowLeft' : 'ArrowRight';
        
        const finalDirection = getMoveDirection(gravityKey);
        move(finalDirection);
        return finalDirection;
    }
    return null;
}

document.addEventListener('touchstart', handleTouchStart, { passive: false });
document.addEventListener('touchmove', handleTouchMove, { passive: false });
document.addEventListener('touchend', handleTouchEnd, { passive: false });

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    updateDisplay();
});

// Expose functions for the browser UI
if (typeof window !== 'undefined') {
    window.startGame = startGame;
    window.showStartScreen = showStartScreen;
    window.newGame = newGame;
    window.rotateGravity = rotateGravity;
    window.rewindTime = rewindTime;
    window.openSettings = openSettings;
    window.closeSettings = closeSettings;
    window.saveSettingsFromMenu = saveSettingsFromMenu;
    window.resetSettingsFromMenu = resetSettingsFromMenu;
}

// Export for testing environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        gameState,
        move,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
        getTileColor,
        formatNumber,
        TILE_COLORS,
        transformBoard,
        transformCoord,
        addRandomTile,
        getMaxTile,
        loadSettings,
        saveSettings,
        saveSettingsFromMenu,
        resetSettings,
        settings,
        processRow,
        startGame,
        newGame,
        initGame
    };
}
