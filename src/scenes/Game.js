import {Scene} from 'phaser';
import ballImg from '/public/assets/ballGrey.png';
import paddleImg from '/public/assets/paddleRed.png';
import epicBlockImg from '/public/assets/element_purple_rectangle.png';
import epicsJson from '../epics.json';

export class Game extends Scene {
    constructor() {
        super('Game');
        this.__defaultVelocity = 500;
        this.__paddleBottomOffset = 70;
    }

    preload() {
        this.load.image('paddle', paddleImg);
        this.load.image('ball', ballImg);
        this.load.image('block', epicBlockImg);
    }

    create() {
        this.score = 0;
        const textStyle = { fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff', stroke: '#000000', strokeThickness: 8 };
        this.scoreText = this.add.text(32, this.sys.game.config.height - 55, "Score: 0", textStyle).setDepth(1);

        this.physics.world.setBoundsCollision(true, true, true, false);
        this.paddle = this.physics.add.sprite(this.sys.game.config.width / 2, this.sys.game.config.height - this.__paddleBottomOffset, 'paddle').setImmovable();

        this.ball = this.physics.add.sprite(this.paddle.x, this.paddle.y - 30, 'ball')
            .setBounce(1)
            .setCollideWorldBounds(true);
        this.ball.setData('onPaddle', true);

        this.blocks = this.physics.add.staticGroup();
        const epicNames = this.extractIssues(epicsJson);
        const fibonacciHits = [
            1, 1, 1, 1, 1, 1,
            2, 2, 2, 2,
            3, 3, 3,
            5, 5,
            8
        ];
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 6; j++) {
                let x = 140 + j * 155;
                let y = 100 + i * 80;
                let block = this.blocks.create(x, y, 'block');
                block.setScale(2.4, 2.3);
                block.refreshBody();
                block.hitPoints = Phaser.Utils.Array.GetRandom(fibonacciHits);
                block.storyPoints = block.hitPoints;
                const epicName = Phaser.Utils.Array.GetRandom(epicNames);
                block.textRefSummary = this.add.text(x - 6, y, epicName)
                    .setStyle({
                        fontFamily: 'BlinkMacSystemFont, "Segoe UI"',
                        fontSize: '12px',
                        fill: '#f5f5f5',
                        backgroundColor: '#20845a',
                        wordWrap: {
                            width: block.displayWidth - 35
                        }
                    })
                    .setOrigin(0.5, 0.5)
                    .setDepth(1);
                block.textRef = this.add.text(x + 63, y, block.hitPoints)
                    .setStyle({
                        fontSize: '20px',
                        fontFamily: 'BlinkMacSystemFont, "Segoe UI"',
                        fill: '#fff'
                    })
                    .setOrigin(0.5)
                    .setDepth(1);
            }
        }

        this.physics.add.collider(this.ball, this.paddle, this.hitPaddle, null, this);
        this.physics.add.collider(this.ball, this.blocks, this.hitBlock, null, this);

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    extractIssues(jsonData) {
        if (!jsonData || !jsonData.values) {
            return [];
        }

        return jsonData.values.map(issue => issue.summary.toUpperCase())
            .map(summary => this.truncateWithEllipsis(summary, 45));
    }

    truncateWithEllipsis(str, maxLength) {
        return str.length > maxLength ? str.substring(0, maxLength - 3) + '...' : str;
    }

    hitBlock(ball, block) {
        block.hitPoints--;
        block.textRef.setText(block.hitPoints);
        if (block.hitPoints <= 0) {
            this.score += block.storyPoints;
            this.scoreText.setText(`Score: ${this.score}`);
            block.destroy();
            block.textRef.destroy();
            block.textRefSummary.destroy();
            if (this.blocks.countActive() === 0) {
                this.gameOver();
            }
        }
    }

    hitPaddle(ball, paddle) {
        let diff = 0;

        if (ball.x < paddle.x) {
            //  Ball is on the left-hand side of the paddle
            diff = paddle.x - ball.x;
            ball.setVelocityX(-10 * diff);
        } else if (ball.x > paddle.x) {
            //  Ball is on the right-hand side of the paddle
            diff = ball.x - paddle.x;
            ball.setVelocityX(10 * diff);
        } else {
            //  Ball is perfectly in the middle
            //  Add a little random X to stop it bouncing straight up!
            ball.setVelocityX(2 + Math.random() * 8);
        }
    }

    resetBall() {
        this.ball.setVelocity(0);
        this.ball.setPosition(this.paddle.x, this.paddle.y - 30);
        this.ball.setData('onPaddle', true);
    }

    gameOver() {
        this.ball.setVelocity(0)
        const highscore = this.registry.get('highscore');
        if (this.score > highscore) {
            this.registry.set('highscore', this.score)
        }
        this.time.delayedCall(1000, () => this.scene.start('GameOver'));
    }

    update() {
        if (this.cursors.left.isDown) {
            this.paddle.setVelocityX(-this.__defaultVelocity);
        } else if (this.cursors.right.isDown) {
            this.paddle.setVelocityX(this.__defaultVelocity);
        } else {
            this.paddle.setVelocityX(0);
        }

        this.paddle.x = Phaser.Math.Clamp(this.paddle.x, this.paddle.displayWidth / 2, this.sys.game.config.width - this.paddle.displayWidth / 2);

        if (this.cursors.up.isDown && this.ball.getData('onPaddle')) {
            this.ball.setVelocity(-75, -this.__defaultVelocity);
            this.ball.setData('onPaddle', false);
        }

        // Keep the ball on the paddle before launch
        if (this.ball.getData('onPaddle')) {
            this.ball.x = this.paddle.x;
        }

        if (this.ball.y > this.sys.game.config.height + 5) {
            this.resetBall();
        }
    }
}