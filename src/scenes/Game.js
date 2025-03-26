import {Scene} from 'phaser';
import ballImg from '/public/assets/ballGrey.png';
import paddleImg from '/public/assets/paddleBlu.png';
import yellowBlockImg from '/public/assets/element_yellow_rectangle.png';

export class Game extends Scene {
    constructor() {
        super({ key: 'breakout' });
    }

    preload() {
        this.load.image('paddle', paddleImg);
        this.load.image('ball', ballImg);
        this.load.image('block', yellowBlockImg);
    }

    create() {
        this.physics.world.setBoundsCollision(true, true, true, false);
        this.paddle = this.physics.add.sprite(512, 720, 'paddle').setImmovable();

        this.ball = this.physics.add.sprite(512, 690, 'ball')
            .setBounce(1)
            .setCollideWorldBounds(true);
        this.ball.setData('onPaddle', true);

        this.blocks = this.physics.add.staticGroup();
        const fibonacciHits = [1, 2, 3, 5, 8];
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 8; j++) {
                let x = 90 + j * 120;
                let y = 100 + i * 50;
                let block = this.blocks.create(x, y, 'block');
                block.setDisplaySize(100, 50);
                block.refreshBody();
                block.hitPoints = Phaser.Utils.Array.GetRandom(fibonacciHits);
                block.textRef = this.add.text(x, y, block.hitPoints, {fontSize: '16px', fill: '#fff'})
                    .setOrigin(0.5)
                    .setDepth(1);
            }
        }

        this.physics.add.collider(this.ball, this.paddle, this.hitPaddle, null, this);
        this.physics.add.collider(this.ball, this.blocks, this.hitBlock, null, this);

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    hitBlock(ball, block) {
        block.hitPoints--;
        block.textRef.setText(block.hitPoints);
        if (block.hitPoints <= 0) {
            block.destroy();
            block.textRef.destroy();
            if (this.blocks.countActive() === 0)
            {
                this.resetLevel();
            }
        }
    }

    hitPaddle (ball, paddle)
    {
        let diff = 0;

        if (ball.x < paddle.x)
        {
            //  Ball is on the left-hand side of the paddle
            diff = paddle.x - ball.x;
            ball.setVelocityX(-10 * diff);
        }
        else if (ball.x > paddle.x)
        {
            //  Ball is on the right-hand side of the paddle
            diff = ball.x - paddle.x;
            ball.setVelocityX(10 * diff);
        }
        else
        {
            //  Ball is perfectly in the middle
            //  Add a little random X to stop it bouncing straight up!
            ball.setVelocityX(2 + Math.random() * 8);
        }
    }

    resetBall ()
    {
        this.ball.setVelocity(0);
        this.ball.setPosition(this.paddle.x, 500);
        this.ball.setData('onPaddle', true);
    }

    resetLevel ()
    {
        this.resetBall();

        this.blocks.children.each(brick =>
        {

            brick.enableBody(false, 0, 0, true, true);

        });
    }

    update() {
        if (this.cursors.left.isDown) {
            this.paddle.setVelocityX(-300);
        } else if (this.cursors.right.isDown) {
            this.paddle.setVelocityX(300);
        } else {
            this.paddle.setVelocityX(0);
        }

        if (this.cursors.up.isDown && this.ball.getData('onPaddle')) {
            this.ball.setVelocity(-75, -300);
            this.ball.setData('onPaddle', false);
        }

        // Keep the ball on the paddle before launch
        if (this.ball.getData('onPaddle')) {
            this.ball.x = this.paddle.x;
        }

        if (this.ball.y > 768)
        {
            this.resetBall();
        }
    }
}