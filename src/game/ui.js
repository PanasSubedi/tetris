import { BLOCK_METADATA, GAME_DATA_LABELS, GridCell, HELP_TEXT_LABELS, NUM_BLOCKS } from "./data";

const SHADOW_BLUR = 5;


const padScore = (score, size) => {
    score = score.toString();
    while(score.length < size) {
        score = "0" + score;
    }

    return score;
}

const fillRect = (context, left, top, length, padding) =>
    context.fillRect(left + padding, top + padding, length - (padding*2), length - (padding*2));

const drawBlock = (context, left, top, length, modifier="", blockNumber=1) => {
    const [primaryColor, secondaryColor] = BLOCK_METADATA.colors[blockNumber] || BLOCK_METADATA.colors[blockNumber-NUM_BLOCKS];

    if (modifier === "outline") {
        // For projection
        context.fillStyle = "#555";
        fillRect(context, left, top, length, 1);

        context.fillStyle = "#000";
        fillRect(context, left, top, length, 4);
    }
    
    else {
        // For actual game blocks
        context.shadowBlur = SHADOW_BLUR;

        context.fillStyle = primaryColor;
        fillRect(context, left, top, length, 1);

        context.fillStyle = secondaryColor;
        fillRect(context, left, top, length, 4);

        context.fillStyle = "#888";
        fillRect(context, left, top, 2, 0);
        fillRect(context, left + length - 2, top + length - 2, 2, 0);

        context.shadowBlur = 0;
    }
}

export const drawGame = (context, dimensions, scale) => {

    const { gameContainer, game } = dimensions;

    // game container
    const gameContainerWidth = gameContainer.width * scale;
    const gameContainerHeight = gameContainer.height * scale;
    const gameContainerLeft = (window.innerWidth - gameContainerWidth) / 2;
    const gameContainerTop = (window.innerHeight - gameContainerHeight) / 2;


    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    context.shadowColor = "white";
    
    context.fillStyle = "rgb(50, 50, 50)";
    context.fillRect(gameContainerLeft, gameContainerTop, gameContainerWidth, gameContainerHeight);


    // main game screen
    const gameWidth = game.width * scale;
    const gameHeight = game.height * scale;
    const gameLeft = gameContainerLeft + (scale * 0.5);
    const gameTop = gameContainerTop + (scale * 0.5);

    context.fillStyle = "rgb(0, 0, 0)";
    context.fillRect(gameLeft, gameTop, gameWidth, gameHeight);



    // game data display
    const gameDataContainerLeft = gameContainerLeft + gameWidth + scale;
    const gameDataContainerTop = gameTop;

    context.font = `${scale/2}px Verdana`;
    context.fillStyle = "#dd0";
    context.shadowBlur = SHADOW_BLUR;
    GAME_DATA_LABELS.forEach(label => {
        context.fillText(label.text, gameDataContainerLeft, gameDataContainerTop + (scale * label.offset));
    });
    context.shadowBlur = 0;

    const helpContainerLeft = gameLeft;
    const helpContainerTop = gameContainerTop + gameHeight + scale;

    context.font = `${parseInt(scale/2)}px Verdana`;
    context.fillStyle = "#eee";
    HELP_TEXT_LABELS.forEach(label => {
        context.fillText(label.text, helpContainerLeft + (scale * label.offset[0]), helpContainerTop + (scale * label.offset[1]))
    });

}

export const drawData = (context, state, dimensions, scale) => {

    const { gameContainer, game } = dimensions;

    const gameContainerWidth = gameContainer.width * scale;
    const gameContainerHeight = gameContainer.height * scale;
    const gameContainerLeft = (window.innerWidth - gameContainerWidth) / 2;
    const gameContainerTop = (window.innerHeight - gameContainerHeight) / 2;
    const gameWidth = game.width * scale;
    const gameTop = gameContainerTop + (scale * 0.5);

    const gameDataLeft = gameContainerLeft + gameWidth + scale;


    // Score
    const scoreLabelTop = gameTop + (GAME_DATA_LABELS.filter(label => label.name === "score")[0].offset * scale);
    const scoreTop = scoreLabelTop + (scale * 1.5);

    context.font = `${scale}px Verdana`;
    context.fillStyle = "#dd0";
    context.shadowBlur = SHADOW_BLUR;
    context.fillText(
        "score" in state ? padScore(state.score, 6) : padScore(0, 6),
        gameDataLeft, scoreTop,
    );
    context.shadowBlur = 0;


    // Hold block
    const holdContainerTop = gameContainerTop + (GAME_DATA_LABELS.filter(label => label.name === "hold")[0].offset * scale);
    if ("holdBlock" in state && state.holdBlock !== 0) {
        const holdBlock = BLOCK_METADATA.positions[state.holdBlock];
        holdBlock.forEach(blockPiece => {
            const left = gameDataLeft + (blockPiece[1] * (scale * 0.75));
            const top = holdContainerTop + scale + (blockPiece[0] * (scale * 0.75));
            drawBlock(context, left, top, scale * 0.75, "", state.holdBlock);
        });
    }

    const nextContainerTop = gameContainerTop + (GAME_DATA_LABELS.filter(label => label.name === "next")[0].offset * scale);
    if ("nextBlock" in state && state.nextBlock !== 0) {
        const nextBlock = BLOCK_METADATA.positions[state.nextBlock];
        nextBlock.forEach(blockPiece => {
            const left = gameDataLeft + (blockPiece[1] * (scale * 0.75));
            const top = nextContainerTop + scale + (blockPiece[0] * (scale * 0.75));
            drawBlock(context, left, top, scale * 0.75, "", state.nextBlock);
        });
    }
}

export const drawProjection = (context, positions, projection, gameContainer, scale) => {

    const gameContainerWidth = gameContainer.width * scale;
    const gameContainerHeight = gameContainer.height * scale;
    const gameContainerLeft = (window.innerWidth - gameContainerWidth) / 2;
    const gameContainerTop = (window.innerHeight - gameContainerHeight) / 2;
    const gameLeft = gameContainerLeft + (scale * 0.5);
    const gameTop = gameContainerTop + (scale * 0.5);

    positions.forEach(position => {
        if (projection > 0) {
            const left = gameLeft + position[1] * scale;
            const top = gameTop + (position[0] + projection) * scale;
            drawBlock(context, left, top, scale, "outline", 1);
        }
    });
}

export const drawGrid = (context, grid, gameContainer, scale) => {

    const gameContainerWidth = gameContainer.width * scale;
    const gameContainerHeight = gameContainer.height * scale;
    const gameContainerLeft = (window.innerWidth - gameContainerWidth) / 2;
    const gameContainerTop = (window.innerHeight - gameContainerHeight) / 2;
    const gameLeft = gameContainerLeft + (scale * 0.5);
    const gameTop = gameContainerTop + (scale * 0.5);

    grid.forEach((row, rowIndex) => {
        row.forEach((cell, cellIndex) => {
            if (cell !== GridCell.Empty) {
                const left = gameLeft + cellIndex * scale;
                const top = gameTop + rowIndex * scale;
                drawBlock(context, left, top, scale, "", cell);
            }
        })
    })
}