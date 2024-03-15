import { NUM_BLOCKS, GridCell, Direction, NewPositionMode, BLOCK_METADATA } from "./data";

export const adjustScale = gameContainer => {
    let scale = 1;
    let adjustingScale = true;

    while(adjustingScale) {
        const gameContainerWidth = gameContainer.width * scale;
        const gameContainerHeight = gameContainer.height * scale;

        if (gameContainerWidth >= (window.innerWidth * 0.9) || gameContainerHeight >= (window.innerHeight * 0.9)) {
            adjustingScale = false;
        }
        scale += 1;
    }
    return scale;
}


export const initializeGrid = (columns, rows) => {
    let grid = [];
    for (let _=0; _<rows; _++) {
        let currentRow = [];
        for (let __=0; __<columns; __++) {
            currentRow.push(GridCell.Empty);
        }
        grid.push(currentRow);
    }


    return grid;
}

export const getNextBlock = () => Math.ceil(Math.random() * NUM_BLOCKS);


export const removeBlockFromGrid = (grid, blockNumber) => {
    for (let row=0; row<grid.length; row++) {
        for (let column=0; column<grid[0].length; column++) {
            if (parseInt(grid[row][column]) === parseInt(blockNumber)) {
                grid[row][column] = GridCell.Empty;
            }
        }
    }

    return grid;
}

export const addToGrid = (grid, blockNumber, midpoint) => {
    const blocks = BLOCK_METADATA.positions[blockNumber];
    let positions = [];
    let gameOver = false;

    blocks.forEach(block => {
        const posX = block[0];
        const posY = block[1] + midpoint - 1;

        positions.push([posX, posY]);
        if (grid[posX][posY] === GridCell.Empty) {
            grid[posX][posY] = blockNumber;
        }
        else {
            gameOver = true;
            return null;
        }
    });

    return { gameOver, grid, positions };
}

export const move = (grid, oldPositions, newPositions, currentBlockNumber) => {

    oldPositions.forEach(position => {
        grid[position[0]][position[1]] = GridCell.Empty;
    })

    newPositions.forEach(position => {
        grid[position[0]][position[1]] = currentBlockNumber;
    })

    return grid;
}




export const getNewPositions = (mode, positions, direction, blockNumber, dimensions={}) => {

    let newPositions = [];
    const moveDirections = [Direction.Down, Direction.Left, Direction.Right];
    const rotateDirections = [Direction.Clockwise, Direction.CounterClockwise];

    if (mode === NewPositionMode.Move && moveDirections.includes(direction)) {
        positions.forEach(position => {
            if (direction === Direction.Down) {
                newPositions.push([position[0] + 1, position[1]]);
            }
        
            else if (direction === Direction.Left) {
                newPositions.push([position[0], position[1]-1]);
            }
        
            else if (direction === Direction.Right) {
                newPositions.push([position[0], position[1]+1]);
            }
        })
    }

    else if (mode === NewPositionMode.Rotate && rotateDirections.includes(direction)) {
        const pivotIndex = BLOCK_METADATA.pivots[blockNumber];

        // return the same position for non rotatable items
        if (pivotIndex === null) return positions;

        const pivot = positions[pivotIndex];
        positions = positions.map(position => [position[0] - pivot[0], position[1] - pivot[1]]);
        
        positions.forEach(position => {
            if (direction === Direction.Clockwise) {
                newPositions.push([position[1], -position[0]]);
            }
            else if (direction === Direction.CounterClockwise) {
                newPositions.push([-position[1], position[0]]);
            }
        });

        newPositions = newPositions.map(position => [position[0]+pivot[0], position[1]+pivot[1]]);


        // translate for out of bounds after rotation
        const minValueTop = newPositions.reduce((minValue, position) => Math.min(minValue, parseInt(position[0])), Infinity);
        const minValueLeft = newPositions.reduce((minValue, position) => Math.min(minValue, parseInt(position[1])), Infinity);
        const maxValueRight = newPositions.reduce((maxValue, position) => Math.max(maxValue, parseInt(position[1])), -Infinity);

        if (minValueTop < 0) {
            newPositions = newPositions.map(position => [position[0] - minValueTop, position[1]]);
        }

        if (minValueLeft < 0) {
            newPositions = newPositions.map(position => [position[0], position[1] - minValueLeft]);
        }

        else if (maxValueRight >= dimensions.columns) {
            const translateRight = dimensions.columns - maxValueRight - 1;
            newPositions = newPositions.map(position => [position[0], position[1] + translateRight]);
        }
    }

    return newPositions;
}

export const checkLock = (grid, positions, currentBlockNumber, dimensions) => {
    let freeToMove = true;

    positions.forEach(position => {

        if (position[0] < 0) freeToMove = false;
        if (position[0] >= dimensions.rows) freeToMove = false;
        if (position[1] < 0) freeToMove = false;
        if (position[1] >= dimensions.columns) freeToMove = false;

        if (!freeToMove) return null;
        if (!(grid[position[0]][position[1]] === -1 || grid[position[0]][position[1]] === currentBlockNumber)) freeToMove = false;

        if (!freeToMove) return null;

    });

    return freeToMove;
}

export const getProjection = (grid, rows, currentBlock) => {
    let projection = 0;
    const positions = currentBlock.positions;

    let blockFound = false;

    while (!blockFound) {
        projection += 1;
        for(let positionIndex=0; positionIndex<positions.length; positionIndex++) {
            const position = positions[positionIndex];
            const x = position[0] + projection;
            const y = position[1];

            if (x >= rows) {
                blockFound = true;
            }

            else if (!(grid[x][y] === GridCell.Empty || grid[x][y] === currentBlock.number)) {
                blockFound = true;
            }
        }
    }

    return (projection-1);
}

export const removeCompleteRows = grid => {
    let completeRow, lastRowChanged;
    let rowsRemoved = 0;

    for (let row=grid.length-1; row>=0; row--) {
        completeRow = true;
        for (let column=0; column<grid[0].length; column++) {
            if (grid[row][column] < GridCell.Locked) {
                completeRow = false;
                break;
            }
        }

        if (completeRow) {
            rowsRemoved += 1;
        }
        else {
            grid[row + rowsRemoved] = [...grid[row]];
            lastRowChanged = row + rowsRemoved;
        }
    }


    for (let row=lastRowChanged-1; row>=0; row--) {
        grid[row] = Array(grid[0].length).fill(GridCell.Empty);
    }

    return [ grid, rowsRemoved ];
}


export const lockGrid = (grid, currentBlock) => {
    currentBlock.positions.forEach(position => {
        grid[position[0]][position[1]] = currentBlock.number + NUM_BLOCKS;
    });

    return grid;
}