import {Scene} from 'phaser';

export class Boot extends Scene
{
    constructor ()
    {
        super('Boot');
    }

    create ()
    {
        this.registry.set('highscore', 0);
        this.registry.set('lives', 3);

        this.scene.start('MainMenu');
    }
}