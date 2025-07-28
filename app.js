// Game state
const BOARD_SIZE = 6;

let gameState = {
    board: [],
    score: 0,
    bestScore: 0,
    crystals: 3,
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
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
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
    gameState.board = Array.from({ length: BOARD_SIZE }, () => (
        Array.from({ length: BOARD_SIZE }, () => createTile())
    ));
    gameState.nextId = 1;
    gameState.lastAdded = null;
    gameState.score = 0;
    gameState.crystals = 3;
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
// eslint-disable-next-line no-unused-vars
function startGame() {
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    initGame();
    updateBackgroundLevel();
}

// Show start screen
// eslint-disable-next-line no-unused-vars
function showStartScreen() {
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
}

// New game
// eslint-disable-next-line no-unused-vars
function newGame() {
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    initGame();
}

// Add random tile
function addRandomTile() {
    const emptyCells = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
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
function renderBoard(merged = [], moveDir = null) {
    const boardElement = document.getElementById('gameBoard');
    boardElement.innerHTML = '';
    boardElement.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    boardElement.style.gridTemplateRows = `repeat(${BOARD_SIZE}, 1fr)`;

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
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

                if (merged.some(pos => pos.r === r && pos.c === c)) {
                    tileElement.classList.add('merged');
                }

                if (moveDir) {
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
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
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
}

// Save game state for rewind
function saveGameState() {
    const stateCopy = {
        board: gameState.board.map(row => row.map(cell => ({ ...cell }))),
        score: gameState.score,
        crystals: gameState.crystals
    };
    
    gameState.moveHistory.push(stateCopy);
    
    // Keep only last 3 moves
    if (gameState.moveHistory.length > 3) {
        gameState.moveHistory.shift();
    }
}

// Rewind time
function rewindTime() {
    if (gameState.crystals > 0 && gameState.moveHistory.length > 0) {
        const previousState = gameState.moveHistory.pop();
        gameState.board = previousState.board;
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
    let moved = false;
    let scoreGained = 0;
    const newBoard = gameState.board.map(row => row.map(cell => ({ ...cell })));
    const mergePositionsTransformed = [];
    
    // Transform board based on direction for easier processing
    let workingBoard = transformBoard(newBoard, direction);
    
    // Process each row
    for (let r = 0; r < BOARD_SIZE; r++) {
        const row = workingBoard[r];
        const newRow = processRow(row);
        workingBoard[r] = newRow.row;
        scoreGained += newRow.score;
        if (newRow.moved) moved = true;
        newRow.merges.forEach(idx => mergePositionsTransformed.push({ r, c: idx }));
    }
    
    // Transform back
    gameState.board = transformBoard(workingBoard, direction, true);
    const mergePositions = mergePositionsTransformed.map(pos => transformCoord(pos.r, pos.c, direction, true));
    
    if (moved) {
        gameState.score += scoreGained;
        
        // Update best score
        if (gameState.score > gameState.bestScore) {
            gameState.bestScore = gameState.score;
            localStorage.setItem('quantum2048_best', gameState.bestScore.toString());
        }
        
        addRandomTile();
        updateDisplay();
        renderBoard(mergePositions, direction);
        updateBackgroundLevel();
        checkAchievements();
        createParticleEffect('merge');
        
        // Check game over
        if (isGameOver()) {
            setTimeout(endGame, 500);
        }
    }
}

// Transform board for different move directions
function transformBoard(board, direction, reverse = false) {
    const newBoard = Array.from({ length: BOARD_SIZE }, () => (
        Array.from({ length: BOARD_SIZE }, () => createTile())
    ));

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            let newR, newC;

            if (direction === 'left') {
                [newR, newC] = reverse ? [c, r] : [r, c];
            } else if (direction === 'right') {
                [newR, newC] = reverse ? [c, BOARD_SIZE - 1 - r] : [r, BOARD_SIZE - 1 - c];
            } else if (direction === 'up') {
                [newR, newC] = reverse ? [r, c] : [c, r];
            } else { // down
                [newR, newC] = reverse ? [BOARD_SIZE - 1 - r, c] : [BOARD_SIZE - 1 - c, r];
            }
            
            if (reverse) {
                newBoard[newR][newC] = { ...board[r][c] };
            } else {
                newBoard[r][c] = { ...board[newR][newC] };
            }
        }
    }
    
    return newBoard;
}

function transformCoord(r, c, direction, reverse = false) {
    let newR, newC;
    if (direction === 'left') {
        [newR, newC] = reverse ? [c, r] : [r, c];
    } else if (direction === 'right') {
        [newR, newC] = reverse ? [c, BOARD_SIZE - 1 - r] : [r, BOARD_SIZE - 1 - c];
    } else if (direction === 'up') {
        [newR, newC] = reverse ? [r, c] : [c, r];
    } else {
        [newR, newC] = reverse ? [BOARD_SIZE - 1 - r, c] : [BOARD_SIZE - 1 - c, r];
    }
    return { r: newR, c: newC };
}

// Process a single row (merge tiles to the left)
function processRow(row) {
    const newRow = row.filter(tile => tile.value !== 0);
    let score = 0;
    let moved = row.some((tile, i) => tile.value !== (newRow[i] ? newRow[i].value : 0));
    const merges = [];
    
    // Merge adjacent equal tiles
    for (let i = 0; i < newRow.length - 1; i++) {
        if (newRow[i].value === newRow[i + 1].value) {
            newRow[i] = { ...newRow[i], value: newRow[i].value * 2 };
            score += newRow[i].value;
            
            // Check for quantum bonus
            if (Math.random() < 0.3) { // 30% chance for quantum bonus
                score *= 2;
            }

            newRow.splice(i + 1, 1);
            merges.push(i);
            moved = true;
        }
    }

    // Fill the rest with zeros
    while (newRow.length < BOARD_SIZE) {
        newRow.push(createTile());
    }

    return { row: newRow, score, moved, merges };
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
    const colors = type === 'time' ? ['#42a5f5', '#ab47bc'] : ['#ff6b6b', '#ffa726', '#ffeb3b'];
    
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
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (gameState.board[r][c].value === 0) return false;
        }
    }
    
    // Check for possible merges
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const current = gameState.board[r][c].value;

            // Check right neighbor
            if (c < BOARD_SIZE - 1 && current === gameState.board[r][c + 1].value) return false;

            // Check bottom neighbor
            if (r < BOARD_SIZE - 1 && current === gameState.board[r + 1][c].value) return false;
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

// Export for testing environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { gameState, move, handleTouchStart, handleTouchMove, handleTouchEnd, getTileColor, formatNumber, TILE_COLORS, BOARD_SIZE, addRandomTile, getMaxTile };
}
