import {Scene} from 'phaser';
import logo from '../../public/assets/Roadshow.png'

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    preload() {
        this.load.image('logo', logo)
    }

    create() {
        const logo = this.add.image(300, -270, 'logo')
            .setScale(0.6);

        this.tweens.add({
            targets: logo,
            y: 270,
            duration: 1000,
            ease: 'Bounce'
        });

        const h1Style = {
            fontFamily: 'Arial Black',
            fontSize: 80,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 5
        };
        this.add.text(512, 300, 'Realworks\nRoadshow', h1Style)
            .setOrigin(0, 0.5)

        let centerX = this.sys.game.config.width / 2;

        this.add.text(centerX, 550, 'CRM 2025', h1Style)
            .setOrigin(0.5)

        const textStyle = {
            fontFamily: 'Arial Black',
            fontSize: 38,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 5
        };

        const instructions = [
            "How many CRM tasks",
            "can you close",
            "before the end of Q2?",
            "",
            "Click to Start!"
        ]
        this.add.text(centerX, 820, instructions, textStyle)
            .setAlign('center')
            .setOrigin(0.5);

        this.input.keyboard.on('keydown-ENTER', () => this.startGame(), this);
        this.input.keyboard.on('keydown-SPACE', () => this.startGame(), this);
        this.input.once('pointerdown', () => this.startGame(), this);
    }

    startGame() {
        this.scene.start('Game');
    }
}