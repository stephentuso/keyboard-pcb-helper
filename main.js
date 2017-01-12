var ONE_U = 19.05;
var KEY_WIDTH = 56;

var inches = false;

var footprintSize;
var offsetX;
var offsetY;

$(document).ready(function() {

    $("#mm").click(function() {
        if (inches) {
            convertAllInputs(toMm);
        }
        inches = false;
        updateUnitLabels();
    });

    $("#in").click(function() {
        if (!inches) {
            convertAllInputs(toInches);
        }
        inches = true;
        updateUnitLabels();
    });

    $("#submit").click(function() {
        var values;
        try {
            var layoutInput = document.querySelector('#keyboard-layout-input').value;
            var footInput = $('#footprint-size-input').get(0).value;
            var xOffInput = $('#x-offset-input').get(0).value;
            var yOffInput = $('#y-offset-input').get(0).value;
            footprintSize = _parseNumberInput(footInput);
    	    offsetX = _parseNumberInput(xOffInput);
    	    offsetY = _parseNumberInput(yOffInput);
            values = parseInput(layoutInput);
        } catch (e) {
            window.alert(e);
            return;
        }

        calculateDimensions(values);
        layoutKeys(values);
        layoutTable(values);
    });

});

function _parseNumberInput(value) {
    if (!value) {
        return 0;
    }

    var num = parseFloat(value);

    if (isNaN(num)) {
        throw new Error("Invalid number input");
    }

    return convertInputNumber(num);
}

function toMm(inches) {
    return inches * 25.4;
}

function toInches(mm) {
    return mm / 25.4;
}

function convertInputNumber(input) {
    return inches ? toMm(input) : input;
}

function convertOutputNumber(output) {
    return inches ? toInches(output) : output;
}

function convertAllInputs(func) {
    var inputs = [
        $('#footprint-size-input'),
        $('#x-offset-input'),
        $('#y-offset-input')
    ];

    for (var i = 0; i < inputs.length; i++) {
        var val = parseFloat(inputs[i].val());
        if (!isNaN(val)) {
            inputs[i].val(func(val));
        }
    }
}

function updateUnitLabels() {
    var unit = inches ? "in" : "mm";
    $('.unit').text(unit);
}

/**
 * Returns the distance between the footprints of two adjacent keys
 * @param cur Size of current key in units
 * @param prev Size of previous key in units
 * @param cut Size of cutout / footprint in mm
 */
function between(cur, prev, footprint) {
    footprint = footprint || 15.6;

    var prevOffset = !prev ? 0 : between(prev);

    return ((ONE_U * cur - footprint) / 2) + prevOffset;
}

/**
 * Returns the offset between the leading edges of footprints of two adjacent
 * keys
 * @param cur Size of current key in units
 * @param prev Size of previous key in units
 * @param footprint Size of footprint in mm
 */
function offset(cur, prev, footprint) {
    footprint = footprint || 15.6;

    var b = between(cur, prev, footprint);
    return !prev ? b : b + footprint;
}

function parseInput(input) {

    // Fix single and unquoted keys
    input = input.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');

    var inputArr;
    try {
        inputArr = JSON.parse(input);
    } catch (e) {
        inputArr = JSON.parse("[" + input + "]");
    }

    if (!inputArr) {
        window.alert("Error parsing layout");
        return;
    }

    var values = [];

    var currentKey = {
        w: 1,
        h: 1,
        relX: 0,
        relY: 0,
        absX: 0,
        absY: 0
    }

    for (var i = 0; i < inputArr.length; i++) {
        if (inputArr[i].constructor === Array) {
            values.push(getRowValues(inputArr[i], currentKey));
            currentKey.relX = 0;
            currentKey.absX = 0;
            currentKey.relY = 0;
            currentKey.absY += 1;
            currentKey.w = 1;
            currentKey.h = 1;
        }
    }

    return values;
}

function getRowValues(row, currentKey) {
    var values = [];

    for (var i = 0; i < row.length; i++) {
        var item = row[i];

        if (typeof item === 'string' || item instanceof String) {
            values.push(copyCurrentKey(currentKey));
            currentKey.relX = 0;
            currentKey.absX += currentKey.w;
            currentKey.w = 1;
            currentKey.h = 1;
            continue;
        }

        currentKey.w = item.w || 1;
        currentKey.h = item.h || 1;

        if (item.x) {
            currentKey.relX = item.x;
            currentKey.absX += item.x;
        }

        if (item.y) {
            currentKey.relY = item.y;
            currentKey.absY += item.y;
        }

    }

    return values;
}

function copyCurrentKey(currentKey) {
    return {
        w: currentKey.w,
        h: currentKey.h,
        relX: currentKey.relX,
        relY: currentKey.relY,
        absX: currentKey.absX,
        absY: currentKey.absY
    }

}

function calculateDimensions(values) {

    for (var i = 0; i < values.length; i++) {
        _calculateRowDimens(values[i]);
    }

}

function _calculateRowDimens(row) {

    for (var i = 0; i < row.length; i++) {
        var key = row[i];
        key.absXmm = key.absX * ONE_U;
        key.absYmm = key.absY * ONE_U;
        key.footX = key.absXmm + offsetX + between(key.w, null, footprintSize);
        key.footY = key.absYmm + offsetY + between(key.h, null, footprintSize);
    }

}

function layoutKeys(values) {
    var $container = $('.key-container');

    $container.empty();

    var bottomPosition;
    for (var i = 0; i < values.length; i++) {
        bottomPosition = _addKeyRow(values[i], $container);
    }

    $container.css('height', String(bottomPosition) + "px");
}

function _addKeyRow(row, $parent) {
    var bottomPosition = 0;
    for (var i = 0; i < row.length; i++) {

        var key = $('<div>');
        key.addClass("keyboard-key");
        key.css('width', String(row[i].w * KEY_WIDTH) + "px");
        key.css('height', String(row[i].h * KEY_WIDTH) + "px");
        key.css('left', String(row[i].absX * KEY_WIDTH) + "px");
        key.css('top', String(row[i].absY * KEY_WIDTH) + "px");

        var leftOffset = (row[i].footX - (row[i].absX * ONE_U)) / ONE_U;
        var topOffset = (row[i].footY - (row[i].absY * ONE_U)) / ONE_U;

        var footprint = $('<div>');
        footprint.addClass('footprint');

        var size = (footprintSize / ONE_U) * KEY_WIDTH;
        footprint.css("width", String(size) + "px");
        footprint.css("height", String(size) + "px");
        footprint.css("left", String(leftOffset * KEY_WIDTH) + "px");
        footprint.css("top", String(topOffset * KEY_WIDTH) + "px");

        key.append(footprint);

        $parent.append(key);

        var bottom = (row[i].absY + row[i].h) * KEY_WIDTH;
        if (bottom > bottomPosition) {
            bottomPosition = bottom;
        }
    }

    return bottomPosition;
}

function layoutTable(values) {
    var $table = $('#table');
    $table.empty();

    for (var i = 0; i < values.length; i++) {
        _addTableRow(values[i], $table);
    }

}

function _addTableRow(row, $parent) {
    var $row = $('<tr>');
    for (var i = 0; i < row.length; i++) {

        var $td = $('<td>');
        var x = $('<p>');
        x.text("x: " + _coordText(row[i].footX));
        var y = $('<p>');
        y.text("y: " + _coordText(row[i].footY));
        $td.append(x);
        $td.append(y);

        $row.append($td);
    }
    $parent.append($row);
}

function _coordText(value) {

    var num = convertOutputNumber(value);
    var unit = inches ? " in" : " mm";

    return String(num.toFixed(4)) + unit;
}
