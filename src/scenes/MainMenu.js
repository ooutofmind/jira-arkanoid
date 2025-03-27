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
        this.add.image(512, 384, 'background');

        const logo = this.add.image(512, -270, 'logo');

        this.tweens.add({
            targets: logo,
            y: 270,
            duration: 1000,
            ease: 'Bounce'
        });

        const textStyle = {
            fontFamily: 'Arial Black',
            fontSize: 38,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8
        };

        const instructions = [
            "How many tasks can you close",
            "before the end of Q2?",
            "",
            "Click to Start!"
        ]

        this.add.text(512, 700, instructions, textStyle)
            .setAlign('center')
            .setOrigin(0.5);

        this.input.once('pointerdown', () => {
            this.scene.start('Game');
        });
    }
}