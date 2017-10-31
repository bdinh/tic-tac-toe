'use strict';

$(function () {
    let gameBoard = $('#game-board');
    let n = 6;
    let timer = 3;
    let difficulty = 'easy';

    let divRow;
    for (let i = 0; i < n * n; i++) {
        if (i % n === 0) {
            divRow = $('<div></div>');
            divRow.addClass('row-' + ((i / n) + 1 ) + " row board-row")
        }

        let divCol = $('<div></div>');

        // Checks for dimensions of game
        if (n === 3) {
            divCol.addClass("position-" + (i + 1) + " board-piece col-4");
        } else if (n === 4) {
            divCol.addClass("position-" + (i + 1) + " board-piece col-3");
        } else if ( n === 5) {
            divCol.addClass("position-" + (i + 1) + " board-piece col-xs-15");
        } else {
            divCol.addClass("position-" + (i + 1) + " board-piece col-2");
        }


        // Get rid of border top for first row
        if (Math.floor(i / n) === 0) {
            divCol.addClass('no-top');
        };

        // Get rid of left border
        if (i % n === 0) {
            divCol.addClass('no-left');
        };

        // Get rid of right border
        if (i % n === (n - 1)) {
            divCol.addClass('no-right');
        };

        // Get rid of border top for first row
        if (Math.floor(i / n) === (n - 1)) {
            divCol.addClass('no-bottom');
        };



        divRow.append(divCol);
        gameBoard.append(divRow);
    }

    $('.setting-button').on('click', function () {
        $('#myModal').modal('show');
    });

    getSettings();

    fillInWinOptions();

    function getSettings() {
        difficulty = $('input[name=difficulty]:checked').attr('id');
        let dimensionId = $('input[name=dimension]:checked').attr('id');
        n = parseInt(dimensionId[dimensionId.length - 1]);
        let timerId = $('input[name=timer]:checked').attr('id');
        timer = parseInt(timerId[timerId.length - 1]);
        console.log(timer);
    }

    function fillInWinOptions() {
        let dimensionsButton = $('.dimension-button');
        let select = $('#winning-option');
        dimensionsButton.on('click', function () {
            select.empty();
            let selectedDimension = stripString($(this).children('input').attr('id'));

            // Get rid of magic number of 3..
            for (let i = parseInt(selectedDimension); i >= 3; i--) {
                console.log(i);
                let option = $('<option></option>');
                option.attr('value', i);
                option.text(i);
                select.append(option);
            }

            // console.log($(this).children('input').attr('id'));
            console.log(selectedDimension);
        });


    }


    function stripString(string) {
        let length = string.length;
        return parseInt(string[length - 1]);
    }

});