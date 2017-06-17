'use strict';

var S2 = require('../src/s2geometry.js').S2;

var lat = 40.2574448;
var lng = -111.7089464;
var level = 15;

var key = S2.latLngToKey(lat, lng, level);
// '4/032212303102210'
console.log(key);

var id = S2.keyToId(key);
// '9749618446378729472'
console.log(id);

var neighbors = S2.latLngToNeighborKeys(lat, lng, level);
// [ keyLeft, keyDown, keyRight, keyUp ]
console.log(neighbors);

var nextKey = S2.nextKey(key);
console.log(nextKey);
var prevKey = S2.prevKey(key);
console.log(prevKey);
