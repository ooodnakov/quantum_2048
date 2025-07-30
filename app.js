// Persistent configurable settings
const DEFAULT_SETTINGS = {
    boardSize: 6,
    startingCrystals: 3,
    startingVoidCrystals: 0,
    startingTiles: 2,
    quantumBonusChance: 0.3,
    maxMoveHistory: 3,
    phaseShiftSpawnChance: 0.02,
    echoDuplicateSpawnChance: 0.02,
    nexusPortalSpawnChance: 0.02
};

let settings = { ...DEFAULT_SETTINGS };

// Game state

let gameState = {
    board: [],
    score: 0,
    bestScore: 0,
    crystals: settings.startingCrystals,
    voidCrystals: settings.startingVoidCrystals,
    moveHistory: [],
    gameActive: false,
    nextId: 1,
    lastAdded: null,
    echoPairs: new Map(),
    clearRowFlag: false,
    highestTile: 0,
    deleteMode: false
};

// Queue for storing pending move directions when a move is already in progress
const moveQueue = [];

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

// Language translations
const translations = {
    en: {
        label_language: 'Language',
        title: 'Quantum 2048',
        subtitle: 'The next evolution of 2048',
        how_to_play: 'How to Play',
        instruction_arrows: '🎯 Use arrow keys to slide tiles',
        instruction_rewind: '⏰ Press R to rewind time (uses time crystals)',
        instruction_delete: '🗑️ Use Delete to remove a tile (costs void crystals)',
        instruction_jump: '✨ Diagonal twins might quantum jump together after a move',
        instruction_record: '📈 How high can you go? Merge tiles to set a new record!',
        start_button: 'Start Quantum Journey',
        settings_button: '⚙️ Settings',
        settings_heading: 'Settings',
        label_board_size: 'Board Size',
        label_starting_crystals: 'Starting Crystals',
        label_starting_tiles: 'Starting Tiles',
        label_quantum_chance: 'Quantum Bonus Chance (%)',
        label_phase_spawn: 'Phase Shift Spawn Chance (%)',
        label_echo_spawn: 'Echo Duplicate Spawn Chance (%)',
        label_nexus_spawn: 'Nexus Portal Spawn Chance (%)',
        label_rewind_history: 'Rewind History',
        save_button: 'Save',
        revert_button: 'Revert',
        back_button: 'Back',
        score_label: 'Score',
        best_label: 'Best',
        time_crystals_label: 'Time Crystals',
        void_crystals_label: 'Void Crystals',
        rewind_button: '⏰ Rewind',
        delete_button: '🗑️ Delete',
        new_game_button: '🔄 New Game',
        evolution_path_heading: 'Evolution Path',
        game_over_title: 'Quantum Journey Complete!',
        final_score_label: 'Final Score',
        play_again_button: 'Play Again',
        main_menu_button: 'Main Menu'
    },
    ru: {
        label_language: 'Язык',
        title: 'Квантовый 2048',
        subtitle: 'Следующая эволюция 2048',
        how_to_play: 'Как играть',
        instruction_arrows: '🎯 Используйте стрелки для перемещения плиток',
        instruction_rewind: '⏰ Нажмите R, чтобы отмотать время (использует временные кристаллы)',
        instruction_delete: '🗑️ Нажмите Delete, чтобы удалить плитку (требует кристаллы пустоты)',
        instruction_jump: '✨ Диагональные двойники могут квантово прыгнуть после хода',
        instruction_record: '📈 Сколько сможете набрать? Соединяйте плитки и ставьте рекорды!',
        start_button: 'Начать квантовое путешествие',
        settings_button: '⚙️ Настройки',
        settings_heading: 'Настройки',
        label_board_size: 'Размер поля',
        label_starting_crystals: 'Начальные кристаллы',
        label_starting_tiles: 'Начальные плитки',
        label_quantum_chance: 'Шанс квантового бонуса (%)',
        label_phase_spawn: 'Шанс появления фазового блока (%)',
        label_echo_spawn: 'Шанс появления блока-эхо (%)',
        label_nexus_spawn: 'Шанс появления портала (%)',
        label_rewind_history: 'Глубина отката',
        save_button: 'Сохранить',
        revert_button: 'Сбросить',
        back_button: 'Назад',
        score_label: 'Счёт',
        best_label: 'Рекорд',
        time_crystals_label: 'Временные кристаллы',
        void_crystals_label: 'Кристаллы пустоты',
        rewind_button: '⏰ Отмотать',
        delete_button: '🗑️ Удалить',
        new_game_button: '🔄 Новая игра',
        evolution_path_heading: 'Путь эволюции',
        game_over_title: 'Квантовое путешествие окончено!',
        final_score_label: 'Итоговый счёт',
        play_again_button: 'Играть ещё',
        main_menu_button: 'Главное меню'
    }
};

let currentLanguage = 'en';

function loadLanguage() {
    const saved = localStorage.getItem('quantum2048_lang');
    if (saved && translations[saved]) {
        currentLanguage = saved;
    }
}

function applyTranslations() {
    if (typeof document === 'undefined') return;
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.dataset.i18n;
        const text = translations[currentLanguage][key];
        if (text) {
            el.textContent = text;
        }
    });
    const select = document.getElementById('languageSelect');
    if (select) select.value = currentLanguage;
    document.documentElement.lang = currentLanguage;
}

function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLanguage = lang;
    localStorage.setItem('quantum2048_lang', lang);
    applyTranslations();
}

function getCurrentLanguage() {
    return currentLanguage;
}

loadLanguage();

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

// Format score display to include a short form when applicable
function formatScoreDisplay(num) {
    const short = formatNumber(num);
    const full = num.toLocaleString();
    // If formatNumber didn't abbreviate the value, just return the locale string
    return short === String(num) ? full : `${full} (${short})`;
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

// Update the total and best scores
function updateScore(gained) {
    if (gained <= 0) return;
    gameState.score += gained;
    if (gameState.score > gameState.bestScore) {
        gameState.bestScore = gameState.score;
        localStorage.setItem('quantum2048_best', gameState.bestScore.toString());
    }
}


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

function createTile(value = 0, type = 'normal', extra = {}) {
    return { id: value === 0 ? null : gameState.nextId++, value, type, ...extra };
}

function isCellEmpty(r, c) {
    const cell = gameState.board[r][c];
    return cell.value === 0 && cell.type !== 'phase';
}

function getPhaseCycle() {
    return 3 + Math.floor(Math.random() * 3);
}

function spawnPhaseShiftTile(r, c, value) {
    const tile = createTile(value, 'phase', { phaseCounter: getPhaseCycle(), phased: false });
    gameState.board[r][c] = tile;
}

function spawnEchoDuplicateTile(r, c, value) {
    const tile = createTile(value, 'echo');
    gameState.board[r][c] = tile;

    const emptyCells = [];
    for (let rr = 0; rr < settings.boardSize; rr++) {
        for (let cc = 0; cc < settings.boardSize; cc++) {
            if (isCellEmpty(rr, cc)) {
                emptyCells.push({ r: rr, c: cc });
            }
        }
    }
    if (emptyCells.length > 0) {
        const spot = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const copy = createTile(value, 'echo');
        gameState.board[spot.r][spot.c] = copy;
        gameState.echoPairs.set(tile.id, { copyId: copy.id, copyPos: spot, turnsLeft: 4 });
    }
}

function spawnNexusPortalTile(r, c, value) {
    const tile = createTile(value, 'portal');
    gameState.board[r][c] = tile;
}

// Determine how many tiles should spawn at game start and after each move
// based on the board size. At minimum one tile will appear.
function getTilesPerStep(boardSize) {
    const sizeBased = Math.floor(boardSize / 2) - 1;
    return Math.max(1, sizeBased);
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
    gameState.voidCrystals = settings.startingVoidCrystals;
    gameState.highestTile = 0;
    gameState.moveHistory = [];
    gameState.gameActive = true;
    
    // Add initial tiles based on configured startingTiles setting
    // Each starting tile increases in value
    addProgressiveTiles(settings.startingTiles);
    gameState.highestTile = getMaxTile(gameState.board);
    
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
            if (isCellEmpty(r, c)) {
                emptyCells.push({ r, c });
            }
        }
    }
    
    if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const maxTile = Math.max(2, getMaxTile(gameState.board));
        const maxPower = Math.log2(maxTile);
        const exponentOffset = 3 + Math.floor(Math.random() * 3); // between 3 and 5 below max
        const newExponent = Math.max(1, Math.floor(maxPower) - exponentOffset);
        const value = 2 ** newExponent;

        const rand = Math.random();
        const p1 = settings.phaseShiftSpawnChance;
        const p2 = p1 + settings.echoDuplicateSpawnChance;
        const p3 = p2 + settings.nexusPortalSpawnChance;

        if (rand < p1) {
            spawnPhaseShiftTile(randomCell.r, randomCell.c, value);
        } else if (rand < p2) {
            spawnEchoDuplicateTile(randomCell.r, randomCell.c, value);
        } else if (rand < p3) {
            spawnNexusPortalTile(randomCell.r, randomCell.c, value);
        } else {
            gameState.board[randomCell.r][randomCell.c] = createTile(value);
        }
        gameState.lastAdded = { r: randomCell.r, c: randomCell.c };
    }
}

// Spawn multiple random tiles
function addRandomTiles(count) {
    for (let i = 0; i < count; i++) {
        addRandomTile();
    }
}

// Add a tile with a specific value
function addTileWithValue(value) {
    const emptyCells = [];
    for (let r = 0; r < settings.boardSize; r++) {
        for (let c = 0; c < settings.boardSize; c++) {
            if (isCellEmpty(r, c)) {
                emptyCells.push({ r, c });
            }
        }
    }

    if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        gameState.board[randomCell.r][randomCell.c] = createTile(value);
        gameState.lastAdded = { r: randomCell.r, c: randomCell.c };
    }
}

// Spawn starting tiles with progressively larger values
function addProgressiveTiles(count) {
    const toSpawn = Math.min(count, settings.boardSize * settings.boardSize);
    for (let i = 0; i < toSpawn; i++) {
        addTileWithValue(2 ** (i + 1));
    }
}

// Render board
function renderBoard(merged = [], movedTiles = [], quantumTiles = []) {
    const boardElement = document.getElementById('gameBoard');
    boardElement.innerHTML = '';
    boardElement.style.gridTemplateColumns = `repeat(${settings.boardSize}, 1fr)`;
    boardElement.style.gridTemplateRows = `repeat(${settings.boardSize}, 1fr)`;

    const mergedSet = new Set(merged.map(pos => `${pos.r},${pos.c}`));
    const quantumSet = new Set(quantumTiles.map(pos => `${pos.r},${pos.c}`));
    const movedMap = new Map(movedTiles.map(pos => [`${pos.r},${pos.c}`, pos]));

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

                const type = gameState.board[r][c].type;
                if (type && type !== 'normal') {
                    tileElement.classList.add(type);
                }

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

                const moveInfo = movedMap.get(`${r},${c}`);
                if (moveInfo) {
                    tileElement.classList.add('move');
                    tileElement.style.setProperty('--dx', moveInfo.dc);
                    tileElement.style.setProperty('--dy', moveInfo.dr);
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
    document.getElementById('score').textContent = formatScoreDisplay(gameState.score);
    document.getElementById('bestScore').textContent = formatScoreDisplay(gameState.bestScore);
    document.getElementById('crystalCount').textContent = gameState.crystals;
    const deleteCountEl = document.getElementById('deleteCount');
    if (deleteCountEl) deleteCountEl.textContent = gameState.voidCrystals;

    // Update rewind button state
    const rewindButton = document.getElementById('rewindButton');
    rewindButton.disabled = gameState.crystals === 0 || gameState.moveHistory.length === 0;
    const deleteButton = document.getElementById('deleteModeButton');
    if (deleteButton) deleteButton.disabled = gameState.voidCrystals === 0;

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

        const currentBoard = gameState.board;
        const prevBoard = previousState.board.map(row => row.map(cell => ({ ...cell })));

        const currentPositions = new Map();
        for (let r = 0; r < settings.boardSize; r++) {
            for (let c = 0; c < settings.boardSize; c++) {
                const tile = currentBoard[r][c];
                if (tile.id !== null) {
                    currentPositions.set(tile.id, { r, c });
                }
            }
        }

        const movedTiles = [];
        for (let r = 0; r < settings.boardSize; r++) {
            for (let c = 0; c < settings.boardSize; c++) {
                const tile = prevBoard[r][c];
                if (tile.id !== null) {
                    const currPos = currentPositions.get(tile.id);
                    if (currPos && (currPos.r !== r || currPos.c !== c)) {
                        movedTiles.push({
                            r,
                            c,
                            dr: currPos.r - r,
                            dc: currPos.c - c
                        });
                    }
                }
            }
        }

        gameState.board = prevBoard;
        gameState.score = previousState.score;
        gameState.crystals = previousState.crystals - 1;

        updateDisplay();
        renderBoard([], movedTiles);
        gameState.gameActive = false;
        setTimeout(() => {
            gameState.gameActive = true;
        }, 250);
        createParticleEffect('time');
    }
}

function deleteTileAt(r, c) {
    if (gameState.voidCrystals <= 0) return false;
    if (r < 0 || r >= settings.boardSize || c < 0 || c >= settings.boardSize) return false;
    const tileValue = gameState.board[r][c].value;
    if (tileValue === 0) return false;
    gameState.board[r][c] = createTile();
    gameState.voidCrystals -= 1;
    if (tileValue === gameState.highestTile) {
        gameState.highestTile = getMaxTile(gameState.board);
    }
    updateDisplay();
    renderBoard();
    return true;
}

function enterDeleteMode() {
    if (gameState.voidCrystals === 0) return;
    gameState.deleteMode = true;
    const board = document.getElementById('gameBoard');
    board.classList.add('delete-mode');
}

function handleBoardClick(e) {
    if (!gameState.deleteMode) return;
    const tileElement = e.target.closest('.tile');
    if (!tileElement) return;
    const board = document.getElementById('gameBoard');
    const tiles = Array.from(board.children);
    const index = tiles.indexOf(tileElement);
    if (index === -1) return;
    const r = Math.floor(index / settings.boardSize);
    const c = index % settings.boardSize;
    const success = deleteTileAt(r, c);
    if (success) {
        gameState.deleteMode = false;
        board.classList.remove('delete-mode');
    }
}

// Map arrow keys to move directions
function getMoveDirection(key) {
    const map = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right'
    };

    return map[key];
}

// Move tiles
function move(direction) {

    updatePhaseTiles();
    updateEchoPairs();


    if (!gameState.gameActive) {
        moveQueue.push(direction);
        return;
    }

    saveGameState();
    const previousBoard = gameState.board.map(row => row.map(cell => ({ ...cell })));
    const prevWorkingBoard = transformBoard(previousBoard, direction);
    let moved = false;
    let scoreGained = 0;
    const newBoard = gameState.board.map(row => row.map(cell => ({ ...cell })));
    const mergePositionsTransformed = [];
    const mergesByRow = Array.from({ length: settings.boardSize }, () => []);
    const removedEchoIds = [];
    
    // Transform board based on direction for easier processing
    let workingBoard = transformBoard(newBoard, direction);
    
    // Process each row
    for (let r = 0; r < settings.boardSize; r++) {
        const row = workingBoard[r];
        const result = processRow(row);
        workingBoard[r] = result.row;
        scoreGained += result.score;
        if (result.moved) moved = true;
        mergesByRow[r] = result.merges.slice();
        result.merges.forEach(idx => mergePositionsTransformed.push({ r, c: idx }));
        if (result.removedEchoId) removedEchoIds.push(result.removedEchoId);
    }
    
    // Transform back
    gameState.board = transformBoard(workingBoard, direction, true);

    // Remove any echo duplicates that were merged
    for (const id of removedEchoIds) {
        const pair = gameState.echoPairs.get(id);
        if (pair) {
            const { r, c } = pair.copyPos;
            gameState.board[r][c] = createTile();
            gameState.echoPairs.delete(id);
            gameState.crystals += 1;
        }
    }
    const mergePositions = mergePositionsTransformed.map(pos => transformCoord(pos.r, pos.c, direction, true));
    
    const prevTilePositions = new Map();
    for (let r = 0; r < settings.boardSize; r++) {
        for (let c = 0; c < settings.boardSize; c++) {
            const tile = previousBoard[r][c];
            if (tile.id !== null) {
                prevTilePositions.set(tile.id, { r, c });
            }
        }
    }

    const movedMap = new Map();
    for (let r = 0; r < settings.boardSize; r++) {
        for (let c = 0; c < settings.boardSize; c++) {
            const tile = gameState.board[r][c];
            if (tile.id !== null) {
                const prevPos = prevTilePositions.get(tile.id);
                if (prevPos && (prevPos.r !== r || prevPos.c !== c)) {
                    movedMap.set(`${r},${c}`, {
                        r,
                        c,
                        dr: prevPos.r - r,
                        dc: prevPos.c - c
                    });
                }
            }
        }
    }

    // Calculate merge movement from second tile using previous board data
    for (let r = 0; r < settings.boardSize; r++) {
        const secondIndices = getSecondTileIndices(prevWorkingBoard[r]);
        for (let i = 0; i < mergesByRow[r].length; i++) {
            const targetIndex = mergesByRow[r][i];
            const sourceIndex = secondIndices[i];
            if (sourceIndex === undefined) continue;
            const target = transformCoord(r, targetIndex, direction, true);
            const source = transformCoord(r, sourceIndex, direction, true);
            movedMap.set(`${target.r},${target.c}`, {
                r: target.r,
                c: target.c,
                dr: source.r - target.r,
                dc: source.c - target.c
            });
        }
    }

    const movedPositions = Array.from(movedMap.values());

    if (moved) {
        updateScore(scoreGained);
        
        updateDisplay();
        renderBoard(mergePositions, movedPositions);

        // Wait for merge animations to finish before spawning new tile.
        // Disable input during the animation to avoid inconsistencies.
        gameState.gameActive = false;
        setTimeout(() => {
            addRandomTiles(getTilesPerStep(settings.boardSize));
            if (gameState.clearRowFlag) {
                clearRandomRow();
                gameState.clearRowFlag = false;
            }

            const qResult = performQuantumJumps();
            updateScore(qResult.scoreGained);

            renderBoard(qResult.mergedPositions, qResult.movedTiles, qResult.quantumPositions);
            updateDisplay();
            updateBackgroundLevel();
            checkAchievements();

            if (qResult.quantumPositions.length > 0) {
                createParticleEffect('quantum');
            } else {
                createParticleEffect('merge');
            }

            // Check game over after the new tile is placed
            if (isGameOver()) {
                setTimeout(endGame, 500);
            } else {
                gameState.gameActive = true;
                if (moveQueue.length > 0) {
                    const next = moveQueue.shift();
                    move(next);
                }
            }
        }, 250); // Match animation duration from CSS (--duration-normal)
    } else if (moveQueue.length > 0) {
        // No tiles moved, process any queued moves immediately
        const next = moveQueue.shift();
        move(next);
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

function getSecondTileIndices(row) {
    const nonZero = [];
    for (let i = 0; i < row.length; i++) {
        if (row[i].value !== 0) nonZero.push(i);
    }
    const result = [];
    let i = 0;
    while (i < nonZero.length) {
        if (i < nonZero.length - 1 && row[nonZero[i]].value === row[nonZero[i + 1]].value) {
            result.push(nonZero[i + 1]);
            i += 2;
        } else {
            i += 1;
        }
    }
    return result;
}

// Process a single row (merge tiles to the left)
function baseProcessRow(row, targetLength) {
    const newRow = row.filter(tile => tile.value !== 0 || tile.type === 'portal');
    let score = 0;
    let moved = row.some((tile, i) => tile.value !== (newRow[i] ? newRow[i].value : 0));
    const merges = [];
    let removedEchoId = null;
    
    // Merge adjacent equal tiles
    for (let i = 0; i < newRow.length - 1; i++) {
        if (newRow[i].value === newRow[i + 1].value) {
            const left = newRow[i];
            const right = newRow[i + 1];
            newRow[i] = { ...left, value: left.value * 2, type: 'normal' };
            let gained = newRow[i].value;

            // Echo duplicate handling
            for (const [origId, pair] of gameState.echoPairs.entries()) {
                if ([left.id, right.id].includes(origId) || [left.id, right.id].includes(pair.copyId)) {
                    removedEchoId = origId;
                    break;
                }
            }

            if (left.type === 'portal' && right.type === 'portal') {
                gameState.clearRowFlag = true;
            }



            score += gained;
            newRow.splice(i + 1, 1);
            merges.push(i);
            moved = true;
        }
    }

    // Portal teleportation
    for (let i = newRow.length - 2; i >= 0; i--) {
        if (newRow[i].type === 'portal' && newRow[i + 1].type !== 'portal') {
            const tele = newRow.splice(i + 1, 1)[0];
            while (newRow.length < targetLength - 1) {
                newRow.push(createTile());
            }
            newRow.push(tele);
            moved = true;
        }
    }

    // Fill the rest with zeros
    while (newRow.length < targetLength) {
        newRow.push(createTile());
    }

    return { row: newRow, score, moved, merges, removedEchoId };
}

// Process a single row (merge tiles to the left) while respecting phased-out
// phase shift tiles that should be ignored for movement but remain in place.
function processRow(row) {
    const intangible = new Map();
    const working = [];

    for (let i = 0; i < row.length; i++) {
        const tile = row[i];
        if (tile.type === 'phase' && tile.phased) {
            intangible.set(i, tile);
        } else {
            working.push(tile);
        }
    }

    const result = baseProcessRow(working, row.length - intangible.size);

    const finalRow = [];
    let workingIdx = 0;
    for (let i = 0; i < row.length; i++) {
        if (intangible.has(i)) {
            finalRow.push(intangible.get(i));
        } else {
            finalRow.push(result.row[workingIdx++] || createTile());
        }
    }

    const workingToFinalMap = [];
    for (let i = 0; i < row.length; i++) {
        if (!intangible.has(i)) {
            workingToFinalMap.push(i);
        }
    }

    const adjustedMerges = result.merges.map(idx => workingToFinalMap[idx]);

    const moved = row.some((tile, i) => tile.value !== finalRow[i].value);
    return {
        row: finalRow,
        score: result.score,
        moved,
        merges: adjustedMerges,
        removedEchoId: result.removedEchoId
    };
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

    if (maxTile > gameState.highestTile) {
        if (gameState.highestTile > 0) {
            gameState.voidCrystals += 1;
            showAchievement(`New max tile ${maxTile}! +1 Void Crystal!`);
        }
        gameState.highestTile = maxTile;
    }
}

// Show achievement popup
function showAchievement(text) {
    const popup = document.getElementById('achievementPopup');
    const textElement = document.getElementById('achievementText');
    if (!popup || !textElement) return;

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

function updatePhaseTiles() {
    for (let r = 0; r < settings.boardSize; r++) {
        for (let c = 0; c < settings.boardSize; c++) {
            const tile = gameState.board[r][c];
            if (tile.type === 'phase') {
                tile.phaseCounter -= 1;
                if (tile.phaseCounter <= 0) {
                    if (tile.phased) {
                        tile.value = tile.storedValue;
                        delete tile.storedValue;
                        tile.phased = false;
                    } else {
                        tile.storedValue = tile.value;
                        tile.value = 0;
                        tile.phased = true;
                    }
                    tile.phaseCounter = getPhaseCycle();
                }
            }
        }
    }
}

function updateEchoPairs() {
    for (const [origId, pair] of gameState.echoPairs.entries()) {
        pair.turnsLeft -= 1;
        if (pair.turnsLeft <= 0) {
            const { r, c } = pair.copyPos;
            gameState.board[r][c] = createTile();
            gameState.echoPairs.delete(origId);
            gameState.score = Math.max(0, gameState.score - 10);
        }
    }
}

function clearRandomRow() {
    const row = Math.floor(Math.random() * settings.boardSize);
    for (let c = 0; c < settings.boardSize; c++) {
        gameState.board[row][c] = createTile();
    }
}

function performQuantumJumps() {
    const mergedPositions = [];
    const movedTiles = [];
    const quantumPositions = [];
    let scoreGained = 0;
    const visited = new Set();
    const size = settings.boardSize;

    function handlePair(r1, c1, r2, c2) {
        const key1 = `${r1},${c1}`;
        const key2 = `${r2},${c2}`;
        if (visited.has(key1) || visited.has(key2)) return;
        const t1 = gameState.board[r1][c1];
        const t2 = gameState.board[r2][c2];
        if (t1.value > 0 && t1.value === t2.value && Math.random() < settings.quantumBonusChance) {
            const chooseFirst = Math.random() < 0.5;
            const targetR = chooseFirst ? r1 : r2;
            const targetC = chooseFirst ? c1 : c2;
            const sourceR = chooseFirst ? r2 : r1;
            const sourceC = chooseFirst ? c2 : c1;
            const target = gameState.board[targetR][targetC];

            target.value *= 2;
            gameState.board[sourceR][sourceC] = createTile();

            mergedPositions.push({ r: targetR, c: targetC });
            movedTiles.push({ r: targetR, c: targetC, dr: sourceR - targetR, dc: sourceC - targetC });
            quantumPositions.push({ r: targetR, c: targetC });
            scoreGained += target.value;

            visited.add(key1);
            visited.add(key2);
        }
    }

    for (let r = 0; r < size - 1; r++) {
        for (let c = 0; c < size - 1; c++) {
            handlePair(r, c, r + 1, c + 1);
            handlePair(r + 1, c, r, c + 1);
        }
    }

    return { mergedPositions, movedTiles, quantumPositions, scoreGained };
}

// Check if game is over
function isGameOver() {
    // Check for empty cells
    for (let r = 0; r < settings.boardSize; r++) {
        for (let c = 0; c < settings.boardSize; c++) {
            if (isCellEmpty(r, c)) return false;
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
    document.getElementById('finalScore').textContent = formatScoreDisplay(gameState.score);
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
    document.getElementById('settingStartTiles').value = settings.startingTiles;
    document.getElementById('settingQuantumChance').value = Math.round(settings.quantumBonusChance * 100);
    [
        ['settingPhaseSpawn', settings.phaseShiftSpawnChance],
        ['settingEchoSpawn', settings.echoDuplicateSpawnChance],
        ['settingNexusSpawn', settings.nexusPortalSpawnChance]
    ].forEach(([id, chance]) => {
        const el = document.getElementById(id);
        if (el) el.value = Math.round(chance * 100);
    });
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

    const startingTiles = parseInt(document.getElementById('settingStartTiles').value, 10);
    if (!Number.isNaN(startingTiles)) {
        const maxTiles = settings.boardSize * settings.boardSize;
        settings.startingTiles = Math.max(1, Math.min(startingTiles, maxTiles));
    }

    const quantumBonusChance = parseInt(document.getElementById('settingQuantumChance').value, 10);
    if (!Number.isNaN(quantumBonusChance)) settings.quantumBonusChance = quantumBonusChance / 100;

    [
        ['settingPhaseSpawn', 'phaseShiftSpawnChance'],
        ['settingEchoSpawn', 'echoDuplicateSpawnChance'],
        ['settingNexusSpawn', 'nexusPortalSpawnChance']
    ].forEach(([id, settingName]) => {
        const el = document.getElementById(id);
        if (el) {
            const chance = parseInt(el.value, 10);
            if (!Number.isNaN(chance)) settings[settingName] = chance / 100;
        }
    });

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
    
    if (e.key === 'r' || e.key === 'R') {
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
        
        move(direction);
        return direction;
    }
    return null;
}

// Attach touch listeners only to the game board so other UI controls remain
// responsive to taps on mobile devices.
// These listeners are registered after the DOM content is loaded when the board
// element is available.

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    updateDisplay();
    applyTranslations();
    const board = document.getElementById('gameBoard');
    board.addEventListener('click', handleBoardClick);
    board.addEventListener('touchstart', handleTouchStart, { passive: false });
    board.addEventListener('touchmove', handleTouchMove, { passive: false });
    board.addEventListener('touchend', handleTouchEnd, { passive: false });
});

// Expose functions for the browser UI
if (typeof window !== 'undefined') {
    window.startGame = startGame;
    window.showStartScreen = showStartScreen;
    window.newGame = newGame;
    window.rewindTime = rewindTime;
    window.openSettings = openSettings;
    window.closeSettings = closeSettings;
    window.saveSettingsFromMenu = saveSettingsFromMenu;
    window.resetSettingsFromMenu = resetSettingsFromMenu;
    window.handleLanguageChange = setLanguage;
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
        addRandomTiles,
        addTileWithValue,
        addProgressiveTiles,
        getMaxTile,
        loadSettings,
        saveSettings,
        saveSettingsFromMenu,
        resetSettings,
        settings,
        processRow,
        getTilesPerStep,
        moveQueue,
        saveGameState,
        rewindTime,
        startGame,
        newGame,
        initGame,
        renderBoard,
        spawnPhaseShiftTile,
        spawnEchoDuplicateTile,
        spawnNexusPortalTile,
        performQuantumJumps,
        updateScore,
        updateDisplay,
        formatScoreDisplay,
        deleteTileAt,
        enterDeleteMode,
        handleBoardClick,
        setLanguage,
        getCurrentLanguage,
        applyTranslations
    };
}
