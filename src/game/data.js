export const DEFAULT_ROWS = 23;
export const DEFAULT_COLUMNS = 11;


export const MOVE_KEYS = ["ArrowLeft", "ArrowRight", "ArrowDown"];
export const JUMP_KEYS = ["ArrowUp", "J", "j"];
export const ROTATE_KEYS = ["R", "r"];
export const HOLD_KEYS = ["H", "h"];

export const NUM_BLOCKS = 7;


export const BLOCK_METADATA = {
    positions : {
        1: [[0, 0], [0, 1], [0, 2], [0, 3]],
        2: [[0, 0], [1, 0], [1, 1], [1, 2]],
        3: [[0, 2], [1, 2], [1, 1], [1, 0]],
        4: [[0, 0], [0, 1], [1, 0], [1, 1]],
        5: [[0, 1], [0, 2], [1, 0], [1, 1]],
        6: [[0, 0], [0, 1], [1, 1], [1, 2]],
        7: [[0, 1], [1, 0], [1, 1], [1, 2]],
    },

    pivots: {
        1: 1, 2: 1, 3: 1, 4: null, 5: 0, 6: 1, 7: 2
    },

    colors: {
        1: ["#FF007F", "#F0F8FF"], // Deep Pink & Light Blue
        2: ["#9B4F08", "#F5E0C3"], // Terracotta & Cream
        3: ["#00C8FB", "#F7CAC9"], // Aqua Blue & Peach
        4: ["#F9AA33", "#FFEECC"], // Mustard Yellow & Light Coral
        5: ["#A020F0", "#FCE4EC"], // Deep Purple & Lavender
        6: ["#3F51B5", "#F9E0E3"], // Royal Blue & Light Pink
        7: ["#CDDC39", "#FDF1C4"], // Olive Green & Light Cream
    },
}

export const SCORING = {
    0: 0, 1: 100, 2: 300, 3: 600, 4: 1000
}

export const NewPositionMode ={
    Move: 0,
    Rotate: 1,
}

export const GridCell = {
    Empty: -1,
    Moving: 0,
    Locked: NUM_BLOCKS+1,
}

export const GameState = {
    Locked: 0,
    Moving: 1,
    UpdatingScore: 2,
}

export const Direction = {
    Down: 0,
    Left: 1,
    Right: 2,
    Clockwise: 3,
    CounterClockwise: 4,
}

export const META_DATA = {
    dimensions: {
        game: null,
        gameContainer: null,
        dimsDefined: false,
    },
    columns: DEFAULT_COLUMNS,
    rows: DEFAULT_ROWS,
    scale: 0,
}

export const INITIAL_STATE = {
    score: 0,
    nextBlock: 0,
    nextBlockQueue: 0,
    holdBlock: 0,
    holdSwitched: false,
    grid: null,
    currentBlock: {
        number: 0,
        positions: [],
        projection: 0,
    },
    gameOver: false,
}

export const GAME_DATA_LABELS = [
    { name:"hold", text: "Hold", offset: 1 },
    { name:"next", text: "Next", offset: 6 },
    { name:"score", text: "Score", offset: DEFAULT_ROWS - 2 },
];

export const HELP_TEXT_LABELS = [
    { name: "direction", text: "Left, right, down - Move", offset: [0.5, 0.5] },
    { name: "rotate", text: "R - Rotate", offset: [10.5, 0.5] },
    { name: "hold", text: "H - Hold", offset: [10.5, 1.5] }
];