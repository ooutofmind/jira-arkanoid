import {Scene} from 'phaser';

export class GameOver extends Scene {
    constructor() {
        super('GameOver');
    }

    create() {
        //  Get the current highscore from the registry
        const score = this.registry.get('highscore');

        const textStyle = {
            fontFamily: 'Arial Black',
            fontSize: 64,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8
        };

        this.add.text(this.sys.game.config.width / 2, 300, `Game Over`, textStyle).setAlign('center').setOrigin(0.5);
        this.scores = JSON.parse(localStorage.getItem("leaderboard")) || [];
        this.scores.push({
            "name": "_",
            "highscore": score
        });

        this.scores.sort((a, b) => b.highscore - a.highscore);
        this.playerName = "";
        let cellStyle = {
            fontFamily: 'Arial Black',
            fontSize: 32,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8
        };
        this.scores.forEach((v, i) => {
            const m = i + 1;
            let y = 400 + m * 50;
            const rankCell = this.add.text(400, y, `#${m}:      ${v.highscore}`, cellStyle)
                .setOrigin(0, 0.5)

            const nameCell = this.add.text(600, y, v.name, cellStyle)
                .setOrigin(0, 0.5)
            if (v.name === "_") {
                this.nameText = nameCell;
            }
        });


        this.input.keyboard.on('keydown', this.handleInput, this);
    }

    handleInput(event) {
        if (event.keyCode === 8) { // Backspace
            this.playerName = this.playerName.slice(0, -1);
        } else if (event.keyCode === 13) { // Enter key
            this.saveScore();
        } else if (this.playerName.length < 10 && event.key.length === 1) {
            this.playerName += event.key;
        }

        // Update text display
        this.nameText.setText(this.playerName || "_");
    }

    saveScore() {
        if (!this.playerName.trim()) return;

        this.scores.filter(it => it.name === "_")[0].name = this.playerName

        // Sort & keep top 5 scores
        this.scores = this.scores.slice(0, 5);

        localStorage.setItem("leaderboard", JSON.stringify(this.scores));

        this.scene.start('MainMenu');
    }
}