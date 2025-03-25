import * as Phaser from 'phaser';
import ballImg from '/assets/ballGrey.png';
import paddleImg from '/assets/paddleBlu.png';
import yellowBlockImg from '/assets/element_yellow_rectangle.png';

export default class PlayScene extends Phaser.Scene {
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
        this.paddle = this.physics.add.sprite(400, 550, 'paddle').setImmovable();

        this.ball = this.physics.add.sprite(400, 500, 'ball')
            .setBounce(1)
            .setCollideWorldBounds(true);
        this.ball.setData('onPaddle', true);

        this.blocks = this.physics.add.staticGroup();
        const fibonacciHits = [1, 2, 3, 5, 8, 13, 20];
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 6; j++) {
                let block = this.blocks.create(100 + j * 120, 100 + i * 50, 'block');
                block.hitPoints = Phaser.Utils.Array.GetRandom(fibonacciHits);
            }
        }

        this.physics.add.collider(this.ball, this.paddle, this.hitPaddle, null, this);
        this.physics.add.collider(this.ball, this.blocks, this.hitBlock, null, this);

        //  Input events
        this.input.on('pointermove', function (pointer)
        {

            //  Keep the paddle within the game
            this.paddle.x = Phaser.Math.Clamp(pointer.x, 52, 748);

            if (this.ball.getData('onPaddle'))
            {
                this.ball.x = this.paddle.x;
            }

        }, this);

        this.input.on('pointerup', function ()
        {

            if (this.ball.getData('onPaddle'))
            {
                this.ball.setVelocity(-75, -300);
                this.ball.setData('onPaddle', false);
            }

        }, this);
    }

    hitBlock(ball, block) {
        block.hitPoints--;
        if (block.hitPoints <= 0) {
            //brick.disableBody(true, true);
            block.destroy();
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
        if (this.ball.y > 600)
        {
            this.resetBall();
        }
    }
}