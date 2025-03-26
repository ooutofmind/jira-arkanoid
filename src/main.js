import { Game as MainGame } from './scenes/Game';
import { AUTO, Scale,Game } from 'phaser';

const config = {
    type: AUTO,
    width: 1024,
    height: 768,
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
        MainGame
    ]
};

window.game = new Phaser.Game(config);