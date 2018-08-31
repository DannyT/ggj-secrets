import 'phaser';
import BootScene from './scenes/BootScene';
import GameScene from './scenes/GameScene';
import TitleScene from './scenes/TitleScene';


let config = {
    type: Phaser.WEBGL,              // Uses WebGL if available
    /* 
    width: 1280,
    height: 600,
    */    
    width: window.innerWidth,
    height: window.innerHeight,
    
    parent: 'content',              // container div to load into
    backgroundColor: '0x000000',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 },
        }
    },
    scene: [
        BootScene,                  // First scene to load, sets up config and remains loaded
        TitleScene,                 // Show splash screen, instructions, "press space to play" etc
        GameScene,                  // Actual game scene
    ]
};

let game = new Phaser.Game(config);


// listen for browser resize and invoke the game's resize function
window.addEventListener('resize', function (event) {
    game.resize(window.innerWidth, window.innerHeight);
}, false);
