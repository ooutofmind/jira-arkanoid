import {Scene} from 'phaser';

export class GameOver extends Scene {
    constructor() {
        super('GameOver');
    }

    create() {

        fetch('/api/leaderboard')
            .then(response => response.json())
            .then(leaderboard => {
                const score = this.registry.get('highscore');

                const textStyle = {
                    fontFamily: 'Arial Black',
                    fontSize: 64,
                    color: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 8
                };

                this.add.text(this.sys.game.config.width / 2, 300, `Game Over`, textStyle)
                    .setAlign('center').setOrigin(0.5);
                this.add.text(this.sys.game.config.width / 2, 360, `Enter your name`, textStyle)
                    .setFontSize(40)
                    .setAlign('center')
                    .setOrigin(0.5);
                leaderboard = leaderboard.slice(0, 9);
                leaderboard.push({
                    "name": "_",
                    "score": score
                });

                leaderboard.sort((a, b) => b.score - a.score);
                this.playerName = "";
                let cellStyle = {
                    fontFamily: 'Arial Black',
                    fontSize: 32,
                    color: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 8
                };
                leaderboard.forEach((v, i) => {
                    const m = i + 1;
                    let y = 400 + m * 50;
                    let rankCell = this.add.text(400, y, `#${m}:      ${v.score}`, cellStyle)
                        .setOrigin(0, 0.5)

                    const nameCell = this.add.text(600, y, v.name, cellStyle)
                        .setOrigin(0, 0.5)
                    if (v.name === "_") {
                        rankCell.setColor('#ffffff')
                            .setStroke('#f62f2f', 8)
                        this.nameText = nameCell.setColor('#ffffff')
                            .setStroke('#f62f2f', 8)
                    }
                });
                this.scores = leaderboard;
            })
            .catch(error => console.error('Error fetching leaderboard:', error));


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

        this.submitScore(this.playerName, this.registry.get('highscore'));

        this.scene.start('MainMenu');
    }

    submitScore(playerName, playerScore) {
        fetch('/api/leaderboard', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name: playerName, score: playerScore})
        })
            .then(response => response.json())
            .then(data => console.log('Leaderboard updated:', data))
            .catch(error => console.error('Error updating leaderboard:', error));
    }
}