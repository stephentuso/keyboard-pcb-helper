var ONE_U = 19.05;
var KEY_WIDTH = 56;

$(document).ready(function() {

    $("#submit").click(function() {
        var input = document.querySelector('#keyboard-layout-input').value;
        var footprint = parseInt(document.querySelector('#footprint-size-input').value);
        var values = parseInput(input);
        layoutKeys(values, footprint);
    });

});

function between(cur, prev, cut) {
    cut = cut || 14;

    var prevOffset = !prev ? 0 : between(prev);

    return ((ONE_U * cur - cut) / 2) + prevOffset;
}

function offset(cur, prev, cut) {
    cut = cut || 14;

    var b = between(cur, prev, cut);
    return !prev ? b : b + cut;
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

    console.log(values);

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

    }

}

function getDimens(key, prev) {



}

function layoutKeys(values, footprint) {
    var $container = $('.key-container');

    var topYCoord = between(1, null, footprint);

    $container.empty();
    for (var i = 0; i < values.length; i++) {
        addRow(values[i], $container, footprint);
    }
}

function addRow(row, $parent, footprintSize, topYCoord) {
    for (var i = 0; i < row.length; i++) {

        var key = $('<div>');
        key.addClass("keyboard-key");
        key.css('width', String(row[i].w * KEY_WIDTH) + "px");
        key.css('height', String(row[i].h * KEY_WIDTH) + "px");
        key.css('left', String(row[i].absX * KEY_WIDTH) + "px");
        key.css('top', String(row[i].absY * KEY_WIDTH) + "px");

        var leftOffset = (between(row[i].w, null, footprintSize) / ONE_U);
        var topOffset = (between(row[i].h, null, footprintSize) / ONE_U);

        var footprint = $('<div>');
        footprint.addClass('footprint');

        var size = (footprintSize / ONE_U) * KEY_WIDTH;
        footprint.css("width", String(size) + "px");
        footprint.css("height", String(size) + "px");
        footprint.css("left", String(leftOffset * KEY_WIDTH) + "px");
        footprint.css("top", String(topOffset * KEY_WIDTH) + "px");

        key.append(footprint);

        $parent.append(key);
    }

}