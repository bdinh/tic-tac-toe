'use strict';

$(function () {

    // Game setting object that stores the current setting of the game
    let gameSetting = {
        dimension: -1,
        timer: -1,
        inARow: -1,
        difficulty: '',
        startingTurn: '',

        // Function within our object that initializes the settings of the game
        init: function () {
            let dimensionId = $('input[name=dimension]:checked').attr('id');
            this.dimension = parseInt(dimensionId[dimensionId.length - 1]);
            this.difficulty = $('input[name=difficulty]:checked').attr('id');
            let timerId = $('input[name=timer]:checked').attr('id');
            this.timer = parseInt(timerId !== "timer-10" ? timerId[timerId.length - 1]
                : timerId.substring(timerId.length - 2));
            this.inARow = parseInt($('select option:selected').val());
            this.startingTurn = $('input[name=turn]:checked').attr('id');
        }
    };

    // Game state object that stores the relevant information about the state of our game
    let gameState = {
        sessionTime: 0,
        currentTurn: '',
        gameBoard: [],
        openPositions: [],
        winningCombos: [],

        // Function within our object that initializes the initial state of our game
        init: function () {
            this.currentTurn = gameSetting.startingTurn;
            let initialState = this.createInitialGameState();
            this.gameBoard = initialState.board;
            this.openPositions = initialState.openMoves;
            this.winningCombos = this.getWinningStates();
        },

        // Function that creates the initial game state object of our game.
        createInitialGameState: function () {
            let boardState = {};
            let openMoves = [];
            let board = [];
            for (let i = 0; i < gameSetting.dimension; i++) {
                let row = [];
                for (let j = 0; j < gameSetting.dimension; j++) {
                    row.push("-");
                    openMoves.push(convertCordinate({
                        x: i,
                        y: j,
                    }));
                }
                board.push(row);
            }
            boardState.openMoves = openMoves;
            boardState.board = board;
            return boardState;
        },

        // Function that generates the winning combination in our game given the current game setting
        getWinningStates: function () {
            let winningStates = [];
            let board = [];
            for (let i = 0; i < gameSetting.dimension; i++) {
                let row = [];
                for (let j = 1; j <= gameSetting.dimension; j++) {
                    row.push(gameSetting.dimension*i + j);
                }
                board.push(row);
            }

            for( let i = 0 ; i < (board.length * 2) - 1 ; i++ ) {
                let temp = [];
                for( let j = 0 ; j <= i ; j++ ) {
                    let k = i - j;
                    if( k < board.length && j < board.length ) {
                        temp.push(board[k][j]);
                    }
                }
                if (temp.length === gameSetting.inARow) {
                    winningStates.push(temp);
                }
            }

            for (let i = 1 - gameSetting.dimension; i < gameSetting.dimension; i++) {
                let temp= [];
                for (let j = 0; j < gameSetting.dimension; j++) {
                    if ((i + j) >= 0 && (i + j) < gameSetting.dimension) {
                        temp.push(board[j][i + j]);
                    }
                }
                if (temp.length === gameSetting.inARow) {
                    winningStates.push(temp);
                }
            }

            for (let i = 0; i < gameSetting.dimension; i++) {
                let vertical = [];
                let horizontal = [];
                for (let j = 0; j < gameSetting.dimension; j++) {
                    horizontal.push(board[i][j]);
                    vertical.push(board[j][i]);
                }
                winningStates.push(horizontal);
                winningStates.push(vertical);
            }
            return winningStates;
        }
    };

    // Agent object that stores the information of the agents' icon in our game
    let agents = {
        userIcon: '',
        aiIcon: '',

        // Function that initializes the agent's icons within our object
        init: function () {
            this.userIcon = $('input[name=icon]:checked').attr('id')[0];
            this.aiIcon = this.getOpponent(this.userIcon);
            },

        // Function that returns the opponent icon of the agent that was passed in
        getOpponent: function (player) {
            if (player === "X") {
                return "O";
            }
            return "X";
        },

        // Function that returns the icon of the agent that was passed in
        getPlayerIcon: function (player) {
            if (player === "user") {
                return this.userIcon;
            }
            return this.aiIcon;
        },
    };

    // Game state object that keeps tract of the possible end game statistic of the current session
    let endGameStats = {
        aiWinCount: 0,
        userWinCount: 0,
        tieCount: 0,
    };

    // Set up setting button to show setting modal menu
    $('.setting-button').on('click', function () {
        $('#myModal').modal('show');
    });

    // Disabled buttons (4x4 & 5x5) in the dimension setting
    $('.btn-group .btn.disabled').click(function(event) {
        event.stopPropagation();
    });

    // Calls appropriate function based on the current status of the game upon pressing the play button
    $('.start-button').on('click', function () {
        let currentFunction = $(this).html();
        if (currentFunction === "Play") {
            $('.setting-button').prop('disabled', true);
            $(this).prop('disabled', true);
            startGame();
            setupDisplay();
        } else if (currentFunction === "Play Again") {
            $('.setting-button').prop('disabled', true);
            $(this).prop('disabled', true);
            newGame();
            startGame();
        }
    });

    // Sets up an event handler that manages and updates the settings for the game state
    $('.modal-save-button').on('click', function () {
        $('#myModal').modal('hide');
        getSettings();
        drawBoard();
    });


    initialSetup();

    // Calls subsequent function that sets up the initial configuration of the game
    function initialSetup() {
        getSettings();
        fillInWinOptions();
        drawBoard();
    }

    // Initially inserts information about the statistic of the game based
    function setupDisplay() {
        $('#user-win-count').text(endGameStats.userWinCount);
        $('#ai-win-count').text(endGameStats.aiWinCount);
        $('#tie-count').text(endGameStats.tieCount);
        $('#current-session').text(gameState.sessionTime + " seconds");
        setInterval(function () {
            gameState.sessionTime++;
            let displayTime;
            let minute = Math.floor(gameState.sessionTime / 60);
            let seconds =  gameState.sessionTime % 60;
            if (minute === 0) {
                displayTime = seconds + " seconds";
            } else {
                displayTime = minute + " minute " + seconds + " seconds";
            }
            $('#current-session').text(displayTime);
        }, 1000);
    }

    // Calls the initialization functions of the objects within our game
    function getSettings() {
        gameSetting.init();
        agents.init();
        gameState.init();
        $('.timer-display').text(gameSetting.timer + " seconds left");

    }

    // Function that fills in the options for in-a-row based on the dimensions given
    function fillInWinOptions() {
        let dimensionsButton = $('.dimension-button');
        let select = $('#winning-option');
        dimensionsButton.on('click', function () {
            select.empty();
            let selectedDimension = stripString($(this).children('input').attr('id'));

            // Get rid of magic number of 3..
            for (let i = parseInt(selectedDimension); i >= 3; i--) {
                let option = $('<option></option>');
                option.attr('value', i);
                option.text(i);
                select.append(option);
            }
        });
    }

    // Starts the game based on the current setting established through the setting modal
    function startGame() {
        let timerDisplay = $('.timer-display');
        let turnTimer = gameSetting.timer;
        if (gameSetting.startingTurn === "ai") {
            $('.turn-text').text("It's the AI's turn");
            timerDisplay.removeClass('timer-hide');
            timerDisplay.addClass('timer-show');
            let countDownTimer = setInterval(function () {
                turnTimer--;
                if (turnTimer === 0) {
                    clearInterval(countDownTimer);
                    $('.board-piece').on('click', manageTurn);
                    $('.turn-text').text("It's your turn");
                    timerDisplay.addClass('timer-hide');
                    timerDisplay.removeClass('timer-show');
                    timerDisplay.text(gameSetting.timer + " seconds left");
                } else {
                    timerDisplay.text(turnTimer + " seconds left");
                }
            }, 1000);
            setTimeout(function () {
                let newMove = getAIMove();
                makeMove(newMove);
                gameState.currentTurn = "user";
            }, 1000 * gameSetting.timer);
        } else {
            $('.turn-text').text("It's your turn");
            $('.board-piece').on('click', manageTurn);
        }
    }

    // Check whether the game is over and returns a value accordingly
    function gameOver(board) {
        let returnState = false;
        let won = false;
        gameState.winningCombos.forEach(function (combo) {
            let userCount = 0;
            let aiCount = 0;
            combo.forEach(function (index) {
                let arrayPosition = getBoardPosition(index - 1);
                if (board[arrayPosition.x][arrayPosition.y] === agents.userIcon) {
                    userCount++;
                } else if (board[arrayPosition.x][arrayPosition.y] === agents.aiIcon) {
                    aiCount++;
                }
            });
            if (userCount === gameSetting.inARow) {
                won = true;
                returnState = -1;
            } else if (aiCount === gameSetting.inARow) {
                returnState = 1;
                won = true;
            }
        });
        if (!won && filledBoard(board)) {
            returnState = 0;
        }
        return returnState;
    }

    // Generates an AI move based on the setting set in the setting modal
    function getAIMove() {
        let position;
        if (gameSetting.difficulty === "difficulty-easy") {
            let randomIndex = getRandomInt(0, gameState.openPositions.length - 1);
            position = gameSetting.openPositions[randomIndex]
        } else if (gameSetting.difficulty === "difficulty-medium") {
            let randomValue = getRandomInt(0,1);
            if (randomValue === 0) {
                let randomIndex = getRandomInt(0, gameState.openPositions.length - 1);
                position = gameState.openPositions[randomIndex]
            } else {
                let startTime = new Date();
                let bestState = minimax(gameState.gameBoard, agents.aiIcon, 0, startTime);
                position = convertCordinate(getNewMove(bestState.board));
            }
        } else {
            let startTime = new Date();
            let bestState = minimax(gameState.gameBoard, agents.aiIcon, 0, startTime);
            position = convertCordinate(getNewMove(bestState.board));
        }
        return position;
    }

    // Manages the user and AI turn
    function manageTurn() {
        let timerDisplay = $('.timer-display');
        if (!filledBoard(gameState.gameBoard) && !gameOver(gameState.gameBoard)) {
            let position = stripString($(this).attr('id'));
            makeMove(position);
            $('.board-piece').off('click');
            if (gameOver(gameState.gameBoard) === false && !filledBoard(gameState.gameBoard)) {
                $('.turn-text').text("It's the AI's turn");
                timerDisplay.removeClass('timer-hide');
                timerDisplay.addClass('timer-show');
                let turnTimer = gameSetting.timer;
                let countDownTimer = setInterval(function () {
                    turnTimer--;
                    if (turnTimer === 0) {
                        clearInterval(countDownTimer);
                        $('.board-piece').on('click', manageTurn);
                        timerDisplay.addClass('timer-hide');
                        timerDisplay.removeClass('timer-show');
                        timerDisplay.text(gameSetting.timer + " seconds left");
                        $('.turn-text').text("It's your turn");
                    } else {
                        timerDisplay.text(turnTimer + " seconds left");
                    }
                }, 1000);
                setTimeout(function () {
                    let newMove = getAIMove();
                    makeMove(newMove);
                }, 1000 * gameSetting.timer);
            }
        }
    }

    // Resets the settings and game state of the current game in order to start a new game
    function resetGameState() {
        let startButton = $('.start-button');
        let settingButton = $('.setting-button');
        startButton.html('Play Again');
        settingButton.html('Change Settings');
        let pieces = $('.board-piece');
        pieces.off('click');
        startButton.prop('disabled', false);
        settingButton.prop('disabled', false);
    }

    // Sets up a new game by grabbing new user setting as well as emptying out the current external game board
    function newGame() {
        let newGameState = gameState.createInitialGameState();
        gameState.gameBoard = newGameState.board;
        gameState.openPositions = newGameState.openMoves;
        $('.board-piece').empty();
        getSettings();
    }

    // Get the new move coordinate position of our game board
    function getNewMove(board) {
        for (let i = 0; i < gameSetting.dimension; i++) {
            for (let j = 0; j < gameSetting.dimension; j++) {
                if (board[i][j] !== gameState.gameBoard[i][j]) {
                    return {
                        x: i,
                        y: j
                    }
                }
            }
        }
        return -1;
    }

    // Visually marks the external state of the game to correspond to the moves made by the AI and the user
    function makeMove(position) {
        let pieceId = "#position-" + position;
        let arrayPosition = getBoardPosition(position);
        gameState.gameBoard[arrayPosition.x][arrayPosition.y] = agents.getPlayerIcon(gameState.currentTurn);
        removeFromArray(gameState.openPositions, position);
        if (agents.getPlayerIcon(gameState.currentTurn) === "X") {
            if ( gameState.currentTurn === "user") {
                gameState.currentTurn = "ai";
            } else {
                gameState.currentTurn = "user";
            }
            $(pieceId).append($('<span class="fa fa-times times-symbol"></span>'));
            $(pieceId).off('click');
        } else {
            if ( gameState.currentTurn === "user") {
                gameState.currentTurn = "ai";
            } else {
                gameState.currentTurn = "user";
            }
            $(pieceId).append($('<span class="fa fa-circle-o circle-symbol"></span>'));
            $(pieceId).off('click');
        }
        let winner = gameOver(gameState.gameBoard);
        if(filledBoard(gameState.gameBoard) || winner !== false) {
            let endingText;
            switch(winner) {
                case 1:
                    endingText = "AI Win";
                    endGameStats.aiWinCount++;
                    break;
                case 0:
                    endingText = "It's a tie";
                    endGameStats.tieCount++;
                    break;

                case -1:
                    endingText = "User Win";
                    endGameStats.userWinCount++;
                    break;
            }
            $('.turn-text').text(endingText);
            $('#user-win-count').text(endGameStats.userWinCount);
            $('#ai-win-count').text(endGameStats.aiWinCount);
            $('#tie-count').text(endGameStats.tieCount);
            resetGameState();
        }
    }

    // Check whether the passed in user was won the game
    function checkUserWin(board, player) {
        let win = false;
        gameState.winningCombos.forEach(function (combo) {
            let count = 0;
            combo.forEach(function (index) {
                let arrayPosition = getBoardPosition(index - 1);
                if (board[arrayPosition.x][arrayPosition.y] === player) {
                    count++;
                }
            });
            if (count === gameSetting.inARow) {
                win = true;
            }
        });
        return win;
    }

    // Simple score function that rewards only terminal states of the game
    function scoreFunction(board, player, move) {
        if (checkUserWin(board, player) && player === agents.aiIcon) {
            return 10 - move;
        } else if (checkUserWin(board, agents.getOpponent(player)) && player === agents.userIcon) {
            return -10 + move;
        } else {
            return 0
        }
    }

    // MiniMax Algorithm that generates and sets values to each potential state and returns the state
    // that gives the agent the best possible value
    function minimax(board, player, depth, time) {
        let gameStatus = gameOver(board);
        let currentTime = new Date();
        let timeDiff = (currentTime - time) / 1000;
        if (gameStatus !== false || timeDiff > gameSetting.timer * .98) {
            switch (gameStatus) {
                case 1:
                    return {
                        score: 10 - depth,
                        board: board
                    };
                case 0:
                    return {
                        score: 0,
                        board: board
                    };
                case -1:
                    return {
                        score: -10 + depth,
                        board: board
                    };
            }
        } else {
            let nextScore = null;
            let nextBoard = null;
            for (let i = 0; i < gameSetting.dimension; i++) {
                for (let j = 0; j < gameSetting.dimension; j++) {
                    if (board[i][j] === "-") {
                        board[i][j] = player;
                        let next = minimax(board, agents.getOpponent(player), depth + 1);
                        let value = next.score;
                        if ((player === agents.aiIcon && (nextScore === null || value > nextScore))
                            || (player === agents.userIcon && (nextScore === null || value < nextScore))) {
                            nextBoard = board.map(function (arr) {
                                return arr.slice();
                            });
                            nextScore = value;
                        }
                        board[i][j] = "-";
                    }
                }
            }
            return {
                score: nextScore,
                board: nextBoard
            };
        }
    }

    // Static evaluation function that returns a value associated with how many consecutive icons
    // are on each potential winning combinations. This will be utilizes as I scale the game for a
    // larger dimension board
    function staticEvaluation(board) {
        let xScore = 0;
        let oScore = 0;
        gameState.winningCombos.forEach(function (combo) {
            let xCount = 0;
            let oCount = 0;
            combo.forEach(function (index) {
                let arrayPosition = getBoardPosition(index -1);
                let indexValue = board[arrayPosition.x][arrayPosition.y];
                if (indexValue === "X") {
                    xCount++;
                } else if (indexValue === "O") {
                    oCount++;
                }
            });
            let normalizedXCount = xCount - oCount;
            let normalizedXOCount = oCount - xCount;
            xScore += calculateScore(normalizedXCount);
            oScore += calculateScore(normalizedXOCount);
        });
        return xScore - oScore;
    }

    // Helper function that returns a score for the number of icons
    function calculateScore(count) {
        if (count <= 0) {
            return 0
        }
        return Math.pow(10, count - 1);
    }

    // Returns an array of all the possible moves allowed for that current state, given a current move
    function getSuccessors(board, nextMove) {
        let successors = [];
        for (let i = 0; i < gameSetting.dimension; i++) {
            for (let j = 0; j < gameSetting.dimension; j++) {
                let boardTemp = JSON.parse(JSON.stringify(board));
                if (boardTemp[i][j] === "-") {
                    boardTemp[i][j] = nextMove;
                    successors.push(boardTemp);
                }
            }
        }
        return successors;
    }

    // Strips a string and returns the value that correspond to that string
    function stripString(string) {
        let length = string.length;
        return parseInt(string[length - 1]);
    }

    // Draws the external board of the game given the current set settings
    function drawBoard() {
        let gameBoard = $('#game-board');
        gameBoard.empty();

        let divRow;

        for (let i = 0; i < Math.pow(gameSetting.dimension, 2); i++) {
            if (i % gameSetting.dimension === 0) {
                divRow = $('<div></div>');
                divRow.addClass('row-' + ((i / gameSetting.dimension) + 1 ) + " row board-row")
            }

            let divCol = $('<div></div>');

            // divCol.addClass("position-" + xPosition + yPosition);
            divCol.attr('id', "position-" + parseInt(i));
            if (gameSetting.dimension === 3) {
                divCol.addClass("board-piece col-4");
            } else if (gameSetting.dimension === 4) {
                divCol.addClass("board-piece col-3");
            } else if (gameSetting.dimension === 5) {
                divCol.addClass("board-piece col-xs-15");
            } else {
                divCol.addClass("board-piece col-2");
            }


            // Get rid of border top for first row
            if (Math.floor(i / gameSetting.dimension) === 0) {
                divCol.addClass('no-top');
            }

            // Get rid of left border
            if (i % gameSetting.dimension === 0) {
                divCol.addClass('no-left');
            }

            // Get rid of right border
            if (i % gameSetting.dimension === (gameSetting.dimension - 1)) {
                divCol.addClass('no-right');
            }

            // Get rid of border top for first row
            if (Math.floor(i / gameSetting.dimension) === (gameSetting.dimension - 1)) {
                divCol.addClass('no-bottom');
            }

            divRow.append(divCol);
            gameBoard.append(divRow);
        }
    }

    // Converts the coordinate given into a integer value that represents the index of that piece
    function convertCordinate(cordinate) {
        return (cordinate.x * gameSetting.dimension) + cordinate.y;
    }

    // Returns a coordinate object that returns the position of that index passed
    function getBoardPosition(index) {
        let result = {};
        result.x = Math.floor(index / gameSetting.dimension);
        result.y = index % gameSetting.dimension;
        return result;
    }

    // Returns a random integer between a min and max
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Checks whether the game board is filled
    function filledBoard(board) {
        for (let i = 0; i < gameSetting.dimension; i++) {
            for (let j = 0; j < gameSetting.dimension; j++) {
                if (board[i][j] !== agents.userIcon && board[i][j] !== agents.aiIcon) {
                    return false;
                }
            }
        }
        return true;
    }

    // Remove a value from the array
    function removeFromArray(array, element) {
        let index = array.indexOf(element);
        array.splice(index, 1);
    }

});