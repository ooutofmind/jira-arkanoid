import {AUTO, Scale} from 'phaser';
import {Boot} from "./scenes/Boot";
import {MainMenu} from "./scenes/MainMenu";
import {GameOver} from "./scenes/GameOver";
import {Game as MainGame} from './scenes/Game';

const config = {
    type: AUTO,
    width: 1080,
    height: 1080,
    parent: 'game-container',
    backgroundColor: '#028af8',
    input: {
        gamepad: true
    },
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade'
    },
    scene: [
        Boot,
        MainMenu,
        MainGame,
        GameOver
    ]
};

window.game = new Phaser.Game(config);