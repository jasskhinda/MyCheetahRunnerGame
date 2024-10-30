// Get the canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let gameSpeed = 3;
let gravity = 1.2;
let score = 0;
let isGameOver = false;
let lives = 5; // Starting with 5 lives

// Load cheetah image
const cheetahImg = new Image();
cheetahImg.src = 'cheetah.gif'; // Using 'cheetah.gif'

// Player (cheetah) object
const cheetah = {
    x: 50,
    y: canvas.height - 70,
    width: 50,
    height: 50,
    vy: 0,
    jumpStrength: -18,
    isJumping: false
};

// Obstacle array
const obstacles = [];

// Obstacle delay
let obstacleDelay = 2000; // 2 seconds delay before obstacles appear
let gameStartTime = Date.now();

// Handle user input
document.addEventListener('keydown', (e) => {
    if (!isGameOver) {
        if ((e.code === 'Space' || e.code === 'ArrowUp') && !cheetah.isJumping) {
            cheetah.vy = cheetah.jumpStrength;
            cheetah.isJumping = true;
        }
    } else {
        if (e.code === 'Enter') {
            restartGame();
        }
    }
});

// Handle mouse click for the extra life
canvas.addEventListener('click', (e) => {
    if (offerExtraLife) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Set font to match the one used in draw()
        ctx.font = '20px Arial';

        // Calculate text position and size
        const text = 'Click here';
        const textWidth = ctx.measureText(text).width;
        const textX = (canvas.width / 2) - (textWidth / 2);
        const textY = canvas.height / 2 + 60; // Same as in draw()
        const textHeight = 20; // Approximate height of the text

        // Check if click is within the "Click here" text bounds
        if (
            mouseX >= textX &&
            mouseX <= textX + textWidth &&
            mouseY >= textY - textHeight &&
            mouseY <= textY
        ) {
            lives += 1; // Grant one extra life
            offerExtraLife = false; // Hide the offer
        }
    }
});

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Variables for extra life offer
let offerExtraLife = false;
let lastExtraLifeScore = 0; // Tracks the last score at which an extra life was offered

function update() {
    if (isGameOver) return;

    // Update cheetah position
    cheetah.y += cheetah.vy;
    cheetah.vy += gravity;

    // Ground collision
    if (cheetah.y + cheetah.height >= canvas.height) {
        cheetah.y = canvas.height - cheetah.height;
        cheetah.isJumping = false;
    }

    // Update obstacles
    obstacles.forEach((obstacle, index) => {
        obstacle.x -= gameSpeed;

        // Remove off-screen obstacles
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(index, 1);
            score++;
        }

        // Check for collision
        if (detectCollision(cheetah, obstacle)) {
            obstacles.splice(index, 1); // Remove the obstacle
            lives--;
            if (lives <= 0) {
                isGameOver = true;
            }
        }
    });

    // Add new obstacles after delay
    if (Date.now() - gameStartTime > obstacleDelay && Math.random() < 0.01) {
        const obstacleHeight = 30;
        obstacles.push({
            x: canvas.width,
            y: canvas.height - obstacleHeight,
            width: 15,
            height: obstacleHeight
        });
    }

    // Offer extra life every time score increases by 3
    if (score >= lastExtraLifeScore + 3 && !offerExtraLife) {
        offerExtraLife = true;
        lastExtraLifeScore = score;
    }
}

function draw() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw cheetah
    if (!isGameOver) {
        ctx.drawImage(cheetahImg, cheetah.x, cheetah.y, cheetah.width, cheetah.height);
    }

    // Draw obstacles
    ctx.fillStyle = '#000';
    obstacles.forEach((obstacle) => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Draw score and lives
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Lives: ${lives}`, 100, 30);

    // If offer extra life, display the message
    if (offerExtraLife) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(50, canvas.height / 2 - 70, canvas.width - 100, 140);

        ctx.fillStyle = '#000';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`You scored ${lastExtraLifeScore}!`, canvas.width / 2, canvas.height / 2 - 10);
        ctx.fillText('We have a reward for you:', canvas.width / 2, canvas.height / 2 + 20);
        ctx.font = '20px Arial';
        ctx.fillStyle = 'blue';
        ctx.fillText('Click here', canvas.width / 2, canvas.height / 2 + 60);
        ctx.textAlign = 'left'; // Reset text alignment
    }

    // If game over, display message
    if (isGameOver) {
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Game over text
        ctx.fillStyle = '#fff';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 20);

        ctx.font = '20px Arial';
        ctx.fillText(`Your score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText('Press Enter to Restart', canvas.width / 2, canvas.height / 2 + 60);

        ctx.textAlign = 'left'; // Reset text alignment
    }
}

// Collision detection
function detectCollision(cheetah, obstacle) {
    return (
        cheetah.x < obstacle.x + obstacle.width &&
        cheetah.x + cheetah.width > obstacle.x &&
        cheetah.y < obstacle.y + obstacle.height &&
        cheetah.y + cheetah.height > obstacle.y
    );
}

// Restart game
function restartGame() {
    // Reset game variables
    gameSpeed = 3;
    gravity = 1.2;
    score = 0;
    isGameOver = false;
    lives = 5; // Reset to 5 lives
    obstacles.length = 0; // Clear obstacles array
    cheetah.x = 50;
    cheetah.y = canvas.height - 70;
    cheetah.vy = 0;
    cheetah.isJumping = false;
    gameStartTime = Date.now();
    offerExtraLife = false;
    lastExtraLifeScore = 0; // Reset the extra life score tracker
}

// Start the game
cheetahImg.onload = () => {
    gameLoop();
};

// If the image fails to load, use a placeholder
cheetahImg.onerror = () => {
    // Draw a placeholder cheetah as a rectangle
    cheetah.draw = function() {
        ctx.fillStyle = '#FFA500';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    };
    gameLoop();
};
