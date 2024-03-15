import { useEffect, useState } from "react";
import { Canvas } from "./components/Canvas";

import { drawGame, drawGrid, drawData, drawProjection } from "./game/ui";
import { Direction, INITIAL_STATE, META_DATA, NewPositionMode, SCORING } from "./game/data";
import { getNextBlock, initializeGrid, addToGrid, move, checkLock, lockGrid, getProjection, adjustScale, getNewPositions, removeCompleteRows, removeBlockFromGrid } from "./game/functions";
import { GameState } from "./game/data";


import { MOVE_KEYS, JUMP_KEYS, ROTATE_KEYS, HOLD_KEYS } from "./game/data";

let gameState = INITIAL_STATE;
let gameMetadata = META_DATA;

const draw = (context) => {
    if (context) {
        drawGame(context,
            gameMetadata.dimensions,
            gameMetadata.scale
        );

        drawGrid(context,
            gameState.grid,
            gameMetadata.dimensions.gameContainer,
            gameMetadata.scale
        );

        drawProjection(context,
            gameState.currentBlock.positions,
            gameState.currentBlock.projection,
            gameMetadata.dimensions.gameContainer,
            gameMetadata.scale
        );

        drawData(context,
            gameState,
            gameMetadata.dimensions,
            gameMetadata.scale
        );
    }
}



/**
 * GAME ACTIONS, includes:
 * 1. Jump Down on pressing UP
 * 2. Move left, right, and down
 * 3. Rotate block
 * 4. Hold
 */
const jumpDown = () => {
    const rowCols = { rows: gameMetadata.rows, columns: gameMetadata.columns };

    let newPositions = getNewPositions(NewPositionMode.Move, gameState.currentBlock.positions, Direction.Down);
    let freeToMove = checkLock(gameState.grid, newPositions, gameState.currentBlock.number, rowCols);

    while (freeToMove) {
        gameState.currentBlock.projection = 0;
        
        const grid = move(gameState.grid, gameState.currentBlock.positions, newPositions, gameState.currentBlock.number);
        gameState.grid = grid;
        gameState.currentBlock.positions = newPositions;

        newPositions = getNewPositions(NewPositionMode.Move, gameState.currentBlock.positions, Direction.Down);
        freeToMove = checkLock(gameState.grid, newPositions, gameState.currentBlock.number, rowCols);
    }
    
    endTurn();
}

const attemptMove = key => {
    let direction = null;

    if (key === "ArrowLeft") {
        direction = Direction.Left;
    }

    if (key === "ArrowRight") {
        direction = Direction.Right;
    }

    if (key === "ArrowDown") {
        direction = Direction.Down;
    }

    if (direction !== null) {
        const rowCols = { rows: gameMetadata.rows, columns: gameMetadata.columns };

        const newPositions = getNewPositions(NewPositionMode.Move, gameState.currentBlock.positions, direction);
        const freeToMove = checkLock(gameState.grid, newPositions, gameState.currentBlock.number, rowCols);
        if (freeToMove) {
            const grid = move(gameState.grid, gameState.currentBlock.positions, newPositions, gameState.currentBlock.number);
            gameState.grid = grid;
            gameState.currentBlock.positions = newPositions;
            gameState.currentBlock.projection = getProjection(gameState.grid, gameMetadata.rows, gameState.currentBlock);
        }
        return true;
    }

    else {
        return false;
    }
}

const attemptRotate = () => {
    const rowCols = { rows: gameMetadata.rows, columns: gameMetadata.columns};
    const newPositions = getNewPositions(NewPositionMode.Rotate, gameState.currentBlock.positions, Direction.Clockwise, gameState.currentBlock.number, rowCols);
    const freeToMove = checkLock(gameState.grid, newPositions, gameState.currentBlock.number, rowCols);
    if (freeToMove) {
        const grid = move(gameState.grid, gameState.currentBlock.positions, newPositions, gameState.currentBlock.number);
        gameState.grid = grid;
        gameState.currentBlock.positions = newPositions;
        gameState.currentBlock.projection = getProjection(gameState.grid, gameMetadata.rows, gameState.currentBlock);
    }
    
    return freeToMove;
}


const hold = () => {
    const holdBlock = gameState.holdBlock;

    gameState.state = GameState.Locked;
    gameState.holdBlock = gameState.currentBlock.number;
    gameState.grid = removeBlockFromGrid(gameState.grid, gameState.currentBlock.number);


    if (holdBlock !== 0) {
        gameState.nextBlockQueue = gameState.nextBlock;
        gameState.nextBlock = holdBlock;
    }
}



const endTurn = () => {
    let rowsRemoved;

    gameState.grid = lockGrid(gameState.grid, gameState.currentBlock);
    [gameState.grid, rowsRemoved] = removeCompleteRows(gameState.grid);
    gameState.state = GameState.Locked;
    gameState.score += SCORING[parseInt(rowsRemoved)];

}





/**
 * ACTUAL GAME.
 * Contains:
 * 1. step and initialize functions
 * 2. action listeners
 * 3. Update UI code
 */
const App = () => {
    const [context, setContext] = useState(null);
    const [speed, setSpeed] = useState(1);

    useEffect(() => {
        if (context) {
            // add action listeners
            window.addEventListener("keydown", event => {

                if (gameState.state !== GameState.Locked) {
                    // move
                    if (MOVE_KEYS.includes(event.key)) {
                        if (attemptMove(event.key)) {
                            draw(context);
                        }
                    }


                    // jump straight down
                    if (JUMP_KEYS.includes(event.key)) {
                        jumpDown();
                        draw(context);
                    }

                    
                    // rotation
                    if (ROTATE_KEYS.includes(event.key)) {
                        if (attemptRotate()) {
                            draw(context);
                        }
                    }


                    // hold
                    if (HOLD_KEYS.includes(event.key)) {

                        if (!gameState.holdSwitched) {
                            hold();
                            draw(context);

                            gameState.holdSwitched = true;
                        }
                    }
                }
            });
        }
    }, [context]);

    const initialized = () => gameMetadata.dimensions.dimsDefined;
    const initialize = () => {
        if (context) {
            const game = {}
            const gameContainer = {}

            game.width = gameMetadata.columns;
            game.height = gameMetadata.rows;

            const gameDataContainerWidth = 5;
            const helpContainerHeight = 2;

            gameContainer.width = (game.width + gameDataContainerWidth + 1);// padding
            gameContainer.height = (game.height + helpContainerHeight + 1);// padding

            gameMetadata.dimensions.gameContainer = gameContainer;
            gameMetadata.dimensions.game = game;
            gameMetadata.scale = adjustScale(gameMetadata.dimensions.gameContainer);
            gameMetadata.dimensions.dimsDefined = true;
        }
    }


    const step = () => {

        if (context) {

            setSpeed(parseInt(gameState.score / 500) + 1);

            // initialize game
            if (gameState.grid === null) {
                gameState.grid = initializeGrid(gameMetadata.columns, gameMetadata.rows);
                gameState.state = GameState.Locked;
                gameState.nextBlock = getNextBlock();
            }

            
            // step actions
            if (gameState.gameOver) {
                alert("Game over");
                setSpeed(0);
            }

            else if (gameState.state === GameState.Locked) {
                gameState.currentBlock.number = gameState.nextBlock;
                
                const midpoint = parseInt(gameMetadata.columns/2);
                const { gameOver, grid, positions } = addToGrid(gameState.grid, gameState.currentBlock.number, midpoint);

                
                if (!gameOver) {
                    gameState.grid = grid;
                    gameState.currentBlock.positions = positions;
                    gameState.currentBlock.projection = getProjection(gameState.grid, gameMetadata.rows, gameState.currentBlock);

                    if (gameState.nextBlockQueue === 0) {
                        gameState.nextBlock = getNextBlock();
                        gameState.holdSwitched = false;
                    }

                    else {
                        gameState.nextBlock = gameState.nextBlockQueue;
                        gameState.nextBlockQueue = 0;
                    }

                    gameState.state = GameState.Moving;
                    gameState.gameOver = false;
                }
                else {
                    gameState.gameOver = true;
                }
            }

            else if (gameState.state === GameState.Moving) {
                const rowCols = { rows: gameMetadata.rows, columns: gameMetadata.columns};
                const newPositions = getNewPositions(NewPositionMode.Move, gameState.currentBlock.positions, Direction.Down);
                const freeToMove = checkLock(gameState.grid, newPositions, gameState.currentBlock.number, rowCols);
                if (freeToMove) {
                    const grid = move(gameState.grid, gameState.currentBlock.positions, newPositions, gameState.currentBlock.number);
                    gameState.grid = grid;
                    gameState.currentBlock.positions = newPositions;
                    gameState.currentBlock.projection = getProjection(gameState.grid, gameMetadata.rows, gameState.currentBlock);
                }
    
                else {
                    endTurn();
                }
            }
        }
    }

    return (
        <Canvas
            fps={speed}
            draw={draw} step={step}
            initialize={initialize} initialized={initialized}
            setMainContext={setContext}
        />
    )
}

export default App;