// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_HEIGHT = 20;
const PADDLE_WIDTH = 100;
const BALL_RADIUS = 10;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 10;

// Game state
let canvas, ctx;
let paddleX, paddleY;
let ballX, ballY;
let ballDX, ballDY;
let score = 0;
let bricks = [];
let gameLoop;

// Initialize game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Initialize paddle
    paddleX = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
    paddleY = CANVAS_HEIGHT - PADDLE_HEIGHT - 10;
    
    // Initialize ball
    ballX = CANVAS_WIDTH / 2;
    ballY = CANVAS_HEIGHT - PADDLE_HEIGHT - BALL_RADIUS - 10;
    ballDX = 4;
    ballDY = -4;
    
    // Initialize bricks
    initBricks();
    
    // Start game loop
    gameLoop = setInterval(update, 1000 / 60);
    
    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
}

// Initialize bricks
function initBricks() {
    const brickWidth = (CANVAS_WIDTH - (BRICK_COLS + 1) * BRICK_PADDING) / BRICK_COLS;
    
    for (let i = 0; i < BRICK_ROWS; i++) {
        bricks[i] = [];
        for (let j = 0; j < BRICK_COLS; j++) {
            bricks[i][j] = {
                x: j * (brickWidth + BRICK_PADDING) + BRICK_PADDING,
                y: i * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_PADDING,
                width: brickWidth,
                height: BRICK_HEIGHT,
                active: true
            };
        }
    }
}

// Handle keyboard input
function handleKeyDown(e) {
    const speed = 8.8;
    if (e.key === 'ArrowLeft' && paddleX > 0) {
        paddleX -= speed;
    } else if (e.key === 'ArrowRight' && paddleX < CANVAS_WIDTH - PADDLE_WIDTH) {
        paddleX += speed;
    }
}

// Update game state
function update() {
    // Update ball position
    ballX += ballDX;
    ballY += ballDY;
    
    // Ball collision with walls
    if (ballX + BALL_RADIUS > CANVAS_WIDTH || ballX - BALL_RADIUS < 0) {
        ballDX = -ballDX;
    }
    if (ballY - BALL_RADIUS < 0) {
        ballDY = -ballDY;
    }
    
    // Ball collision with paddle
    if (ballY + BALL_RADIUS > paddleY && 
        ballX > paddleX && 
        ballX < paddleX + PADDLE_WIDTH) {
        ballDY = -Math.abs(ballDY);
    }
    
    // Ball collision with bricks
    for (let i = 0; i < BRICK_ROWS; i++) {
        for (let j = 0; j < BRICK_COLS; j++) {
            const brick = bricks[i][j];
            if (brick.active && 
                ballX + BALL_RADIUS > brick.x && 
                ballX - BALL_RADIUS < brick.x + brick.width &&
                ballY + BALL_RADIUS > brick.y && 
                ballY - BALL_RADIUS < brick.y + brick.height) {
                brick.active = false;
                ballDY = -ballDY;
                score += 10;
                document.getElementById('score').textContent = `Score: ${score}`;
            }
        }
    }
    
    // Game over condition
    if (ballY + BALL_RADIUS > CANVAS_HEIGHT) {
        clearInterval(gameLoop);
        alert('Game Over! Your score: ' + score);
        location.reload();
    }
    
    // Draw everything
    draw();
}

// Draw game objects
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw paddle
    ctx.fillStyle = '#0052cc';
    ctx.fillRect(paddleX, paddleY, PADDLE_WIDTH, PADDLE_HEIGHT);
    
    // Draw ball
    ctx.beginPath();
    ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#172b4d';
    ctx.fill();
    ctx.closePath();
    
    // Draw bricks
    for (let i = 0; i < BRICK_ROWS; i++) {
        for (let j = 0; j < BRICK_COLS; j++) {
            const brick = bricks[i][j];
            if (brick.active) {
                ctx.fillStyle = '#ff5630';
                ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            }
        }
    }
}

// Start the game when the page loads
window.onload = init; 