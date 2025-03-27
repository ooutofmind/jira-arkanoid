import {AUTO, Scale} from 'phaser';
import {Boot} from "./scenes/Boot";
import {Preloader} from "./scenes/Preloader";
import {MainMenu} from "./scenes/MainMenu";
import {GameOver} from "./scenes/GameOver";
import {Game as MainGame} from './scenes/Game';

const config = {
    type: AUTO,
    width: 1080,
    height: 1080,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade'
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        MainGame,
        GameOver
    ]
};

window.game = new Phaser.Game(config);