import {Scene} from 'phaser';
import ballImg from '/public/assets/ballGrey.png';
import paddleImg from '/public/assets/paddleRed.png';
import greyBlockPng from '/public/assets/element_grey_rectangle.png';
import redBlockPng from '/public/assets/element_red_rectangle.png';
import yellowBlockPng from '/public/assets/element_yellow_rectangle.png';
import blueBlockPng from '/public/assets/element_blue_rectangle.png';
import purpleBlockPng from '/public/assets/element_purple_rectangle.png';
import greenBlockPng from '/public/assets/element_green_rectangle.png';
import epicsJson from '../epics.json';
import levelsDef from '../levels.json';

export class Game extends Scene {
    constructor() {
        super('Game');
        this.__defaultVelocity = 500;
        this.__paddleBottomOffset = 70;
    }

    preload() {
        this.load.image('paddle', paddleImg);
        this.load.image('ball', ballImg);

        this.load.image('greyBlock', greyBlockPng);
        this.load.image('redBlock', redBlockPng);
        this.load.image('yellowBlock', yellowBlockPng);
        this.load.image('blueBlock', blueBlockPng);
        this.load.image('purpleBlock', purpleBlockPng);
        this.load.image('greenBlock', greenBlockPng);
    }

    create() {

        this.gamepad = this.input.gamepad.pad1;

        const textStyle = {
            fontFamily: 'Arial Black',
            fontSize: 38,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8
        };
        this.lives = this.registry.get('lives');
        this.livesText = this.add.text(this.sys.game.config.width - 200, this.sys.game.config.height - 55, `Balls: ${this.lives}`, textStyle).setDepth(1);
        this.score = 0;
        this.scoreText = this.add.text(32, this.sys.game.config.height - 55, "Score: 0", textStyle).setDepth(1);

        this.physics.world.setBoundsCollision(true, true, true, false);
        this.paddle = this.physics.add.sprite(this.sys.game.config.width / 2, this.sys.game.config.height - this.__paddleBottomOffset, 'paddle').setImmovable();

        this.ball = this.physics.add.sprite(this.paddle.x, this.paddle.y - 30, 'ball')
            .setBounce(1)
            .setCollideWorldBounds(true);
        this.ball.setData('onPaddle', true);

        this.blocks = this.physics.add.staticGroup();

        this.level = "Q2"
        this.setupBlocks();

        this.physics.add.collider(this.ball, this.paddle, this.hitPaddle, null, this);
        this.physics.add.collider(this.ball, this.blocks, this.hitBlock, null, this);

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    setupBlocks() {
        const levelName = this.level;
        const epicNames = this.extractIssues(epicsJson);
        const fibonacciHits = [
            1, 1, 1, 1, 1, 1,
            2, 2, 2, 2,
            3, 3, 3,
            5, 5,
            8
        ];
        const levelDef = levelsDef[levelName];

        for (let i = 0; i < levelDef.map.length; i++) {
            let row = levelDef.map[i];
            for (let j = 0; j < row.length; j++) {
                let hitPoints = row[j];
                if ("*" === hitPoints) {
                    hitPoints = Phaser.Utils.Array.GetRandom(fibonacciHits)
                } else {
                    hitPoints = +hitPoints;
                }
                if (hitPoints === 0) {
                    continue
                }
                let x = 115 + j * 170;
                let y = 170 + i * 80;
                let block = this.blocks.create(x, y, 'greyBlock');
                block.setScale(2.7, 2.495);
                block.refreshBody();
                block.hitPoints = hitPoints;
                block.storyPoints = block.hitPoints;
                const epicName = Phaser.Utils.Array.GetRandom(epicNames);
                let blockStyle = this.getBlockStyle(i, block.displayWidth);
                block.textRefSummary = this.add.text(x - 6, y, epicName)
                    .setStyle(blockStyle)
                    .setOrigin(0.5, 0.5)
                    .setDepth(1);
                block.textRefSummary.bg = this.createRoundRect(block.textRefSummary, this.hexToNumberFormat(blockStyle.backgroundColor));
                block.textRef = this.add.text(x + 70, y, block.hitPoints)
                    .setStyle({
                        fontSize: '18px',
                        fontFamily: 'BlinkMacSystemFont, "Segoe UI"',
                        fill: '#3a4977'
                    })
                    .setOrigin(0.5)
                    .setDepth(1);
                block.textRef.bg = this.createRoundRect(block.textRef, 0xf5f5f5);
            }
        }
    }

    hexToNumberFormat(hex) {
        // Remove the '#' if present
        hex = hex.replace(/^#/, '');

        // Convert to a hexadecimal number representation
        return `0x${hex}`;
    }

    createRoundRect(text, fill) {
        const bg = this.add.graphics();
        bg.fillStyle(fill, 1); // Red background
        let padding = 8;
        bg.fillRoundedRect(text.x - text.displayOriginX - padding / 2, text.y - text.displayOriginY - padding / 2, text.displayWidth + padding, text.displayHeight + padding, 6);
        bg.setDepth(text.depth - 1);
        return bg
    }

    getBlockStyle(rowIndex, blockWidth) {
        let baseStyle = {
            fontFamily: 'BlinkMacSystemFont, "Segoe UI"',
            fontSize: '12px',
            wordWrap: {
                width: blockWidth - 35
            }
        };
        if (rowIndex === 5) {
            baseStyle.backgroundColor = '#20845a';
            baseStyle.fill = '#f5f5f5'
        } else if (rowIndex === 4) {
            baseStyle.backgroundColor = '#0c66e4';
            baseStyle.fill = '#f5f5f5'
        } else if (rowIndex === 2) {
            baseStyle.backgroundColor = '#c9372c';
            baseStyle.fill = '#f5f5f5'
        } else if (rowIndex === 3) {
            baseStyle.backgroundColor = '#ffd5d2';
            baseStyle.fill = '#ae2e24'
        } else if (rowIndex === 1) {
            baseStyle.backgroundColor = '#f8e6a0';
            baseStyle.fill = '#7f5f01'
        } else if (rowIndex === 0) {
            baseStyle.backgroundColor = '#6e5dc6';
            baseStyle.fill = '#f5f5f5'
        }
        return baseStyle
    }

    extractIssues(jsonData) {
        if (!jsonData || !jsonData.values) {
            return [];
        }

        return jsonData.values
            .map(issue => issue.name || issue.summary)
            .map(name => name.toUpperCase())
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
            block.textRef.bg.destroy();
            block.textRefSummary.destroy();
            block.textRefSummary.bg.destroy();
            if (this.blocks.countActive() === 0) {
                const thisLevel = this.level
                this.level = levelsDef[this.level].nextLevel
                if (!this.level) {
                    this.gameOver();
                } else {
                    const textStyle = {
                        fontFamily: 'Arial Black',
                        fontSize: 38,
                        color: '#ffffff',
                        stroke: '#000000',
                        strokeThickness: 8
                    }
                    this.tmpText = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 2, `LEVEL ${thisLevel} CLEAR!`, textStyle)
                        .setOrigin(0.5)
                        .setDepth(1);
                    this.ball.setVelocity(0)
                    this.time.delayedCall(2000, () => {
                        this.tmpText.destroy()
                        this.resetBall()
                        this.setupBlocks()
                    });
                }
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
        this.registry.set('highscore', this.score)
        this.time.delayedCall(1000, () => this.scene.start('GameOver'));
    }

    update() {
        let moveLeft = this.cursors.left.isDown;
        let moveRight = this.cursors.right.isDown;
        let moveUp = this.cursors.up.isDown;
        let ratio = 1;

        if (this.gamepad) {
            moveLeft = this.gamepad.axes[0] < -0.2 || this.gamepad.left;  // Left stick left
            moveRight = this.gamepad.axes[0] > 0.2 || this.gamepad.right;  // Left stick right
            moveUp = this.gamepad.buttons[0].pressed || this.gamepad.buttons[12].pressed || this.gamepad.axes[1] < -0.5;
        }

        if (moveLeft) {
            this.paddle.setVelocityX(-this.__defaultVelocity);
        } else {
            if (moveRight) {
                this.paddle.setVelocityX(this.__defaultVelocity);
            } else {
                this.paddle.setVelocityX(0);
            }
        }

        this.paddle.x = Phaser.Math.Clamp(this.paddle.x, this.paddle.displayWidth / 2, this.sys.game.config.width - this.paddle.displayWidth / 2);

        if (moveUp && this.ball.getData('onPaddle')) {
            this.ball.setVelocity(-75, -this.__defaultVelocity);
            this.ball.setData('onPaddle', false);
        }

        // Keep the ball on the paddle before launch
        if (this.ball.getData('onPaddle')) {
            this.ball.x = this.paddle.x;
        }

        if (this.ball.y > this.sys.game.config.height + 5) {
            this.lives--;
            this.livesText.setText(`Balls: ${this.lives}`);
            this.resetBall();

            if (this.lives === 0) {
                this.gameOver();
            }
        }
    }
}