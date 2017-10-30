'use strict';

$(function () {
    let gameBoard = $('#game-board');

    let n = 3;

    let divRow;
    for (let i = 0; i < n * n; i++) {
        if (i % n === 0) {
            divRow = $('<div></div>');
            divRow.addClass('row-' + ((i / n) + 1 ) + " row board-row")
        }

        let divCol = $('<div></div>');
        divCol.addClass("position-" + (i + 1) + " board-piece col-4");

        // Get rid of border top for first row
        if (Math.floor(i / 3) === 0) {
            divCol.addClass('no-top');
        };

        // Get rid of left border
        if (i % n === 0) {
            divCol.addClass('no-left');
        };

        // Get rid of right border
        if (i % n === 2) {
            divCol.addClass('no-right');
        };

        divRow.append(divCol);
        gameBoard.append(divRow);
    }

    $('.modal-button').on('click', function () {
        $('#myModal').modal('show');
    });



});