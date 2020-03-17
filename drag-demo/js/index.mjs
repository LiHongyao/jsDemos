import {
    dragBox,
    dragCorners
} from './lib.mjs';
let oBox = document.querySelector('.box');
let aBtn = [...document.querySelectorAll('.btn')];
dragBox(oBox);
dragCorners(oBox, aBtn);
