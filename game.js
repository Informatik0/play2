const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const coinsDisplay = document.getElementById('coins');
const inventoryDisplay = document.getElementById('inventory');
const shopDisplay = document.getElementById('shop');

let dino = { x: 50, y: 200, width: 20, height: 20, dy: 0, gravity: 0.5, jumpStrength: 10 };
let pipes = [];
let coins = [];
let score = 0;
let coinCount = 0;
let highScore = 0;
let isGameOver = false;
let spawnRate = 1500;
let lastPipeTime = 0;
let lastCoinTime = 0;
let gameStarted = false;
let invincibilityTimer = 0;
let canPassThroughPipes = false;

let inventory = {
    extraLife: 0
};

function resetGame() {
    dino.y = 200;
    dino.dy = 0;
    score = 0;
    pipes = [];
    coins = [];
    isGameOver = false;
    spawnRate = 1500;
    lastPipeTime = 0;
    lastCoinTime = 0;
    updateDisplays();
    shopDisplay.style.display = 'none'; // Shop ausblenden beim Neustart
    requestAnimationFrame(gameLoop);
}

function drawBackground() {
    ctx.fillStyle = '#87CEEB'; // Himmelblau
    ctx.fillRect(0, 0, canvas.width, canvas.height / 2);
    ctx.fillStyle = '#4CAF50'; // Grasgrün
    ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(100, 50, 20, 0, Math.PI * 2);
    ctx.arc(120, 50, 30, 0, Math.PI * 2);
    ctx.arc(80, 50, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(300, 80, 20, 0, Math.PI * 2);
    ctx.arc(320, 80, 30, 0, Math.PI * 2);
    ctx.arc(280, 80, 30, 0, Math.PI * 2);
    ctx.fill();
}

function spawnPipe() {
    const x = canvas.width;

    // Zufällige Höhe für das obere Rohr
    const pipeHeight = Math.random() * (canvas.height / 2) + 50;

    // Zufälliger Abstand zwischen den Rohren (zwischen 110 und 130)
    const gapHeight = Math.random() * (150 - 130) + 130;

    // Berechne die Höhe des unteren Rohrs anhand des Abstandes
    const bottomPipeHeight = canvas.height - (pipeHeight + gapHeight);

    pipes.push({
        x,
        top: pipeHeight,
        bottom: bottomPipeHeight,
        width: 20
    });
}

function spawnCoin() {
    const x = canvas.width;
    const pipeIndex = pipes.length - 1;
    if (pipeIndex >= 0) {
        const lastPipe = pipes[pipeIndex];
        const y = Math.random() * (lastPipe.top + lastPipe.bottom - 40) + lastPipe.bottom + 10;
        coins.push({ x, y, width: 20, height: 20 });
    }
}

function drawDino() {
    ctx.fillStyle = 'darkblue'; // Dunkelblaue Farbe für den Dino
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
}

function drawPipes() {
    ctx.fillStyle = '#8B4513'; // Baumstammfarbe (braun)
    for (let pipe of pipes) {
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.top); // Oberer Teil des Baums
        ctx.fillRect(pipe.x, canvas.height - pipe.bottom, pipe.width, pipe.bottom); // Unterer Teil des Baums
        ctx.fillStyle = 'green'; // Blattfarbe (grün)
        ctx.beginPath();
        ctx.arc(pipe.x + pipe.width / 2, pipe.top - 20, 30, 0, Math.PI * 2); // Blätter oben
        ctx.fill();
        ctx.fillStyle = '#8B4513'; // Zurück zur Baumstammfarbe
    }
}

function drawCoins() {
    ctx.fillStyle = 'gold';
    for (let coin of coins) {
        ctx.fillRect(coin.x, coin.y, coin.width, coin.height);
    }
}

function drawInvincibility() {
    if (invincibilityTimer > 0) {
        ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function updatePipes() {
    for (let i = pipes.length - 1; i >= 0; i--) {
        const pipe = pipes[i];
        pipe.x -= 5;

        if (pipe.x + pipe.width < 0) {
            pipes.splice(i, 1);
            score++;
        }

        if (dino.x < pipe.x + pipe.width &&
            dino.x + dino.width > pipe.x &&
            (dino.y < pipe.top || dino.y + dino.height > canvas.height - pipe.bottom)) {
            if (inventory.extraLife > 0) {
                inventory.extraLife--;
                triggerInvincibility();
            } else if (!canPassThroughPipes) {
                isGameOver = true;
            }
        }
    }
}

function updateCoins() {
    for (let i = coins.length - 1; i >= 0; i--) {
        const coin = coins[i];
        coin.x -= 5;

        if (coin.x + coin.width < 0) {
            coins.splice(i, 1);
        }

        if (dino.x < coin.x + coin.width &&
            dino.x + dino.width > coin.x &&
            dino.y < coin.y + coin.height &&
            dino.y + dino.height > coin.y) {
            coins.splice(i, 1);
            coinCount++;
            updateDisplays();
        }
    }
}

function updateDino() {
    dino.dy += dino.gravity;
    dino.y += dino.dy;

    if (dino.y >= canvas.height - dino.height) {
        dino.y = canvas.height - dino.height;
        dino.dy = 0;
        if (inventory.extraLife <= 0) {
            isGameOver = true;
        } else {
            triggerInvincibility();
        }
    }

    if (dino.y < 0) {
        dino.y = 0;
    }
}

function triggerInvincibility() {
    invincibilityTimer = 3 * 1000;
    canPassThroughPipes = true;
    dino.y = canvas.height / 2;
    ctx.fillStyle = 'blue';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setTimeout(() => {
        canPassThroughPipes = false;
        invincibilityTimer = 0;
    }, 3000);
}

function updateDisplays() {
    scoreDisplay.innerText = `Punkte: ${score}`;
    coinsDisplay.innerText = `Münzen: ${coinCount}`;
    inventoryDisplay.innerText = `Inventar: Zweites Leben: ${inventory.extraLife}`;
}

function drawGameOver() {
    ctx.fillStyle = '#ff0000'; // Roter Hintergrund für Game Over
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '40px Arial';
    ctx.fillText('Game Over!', canvas.width / 2 - 100, canvas.height / 2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText(`Dein Score: ${score}`, canvas.width / 2 - 80, canvas.height / 2 + 10);
    ctx.fillText(`Highscore: ${highScore}`, canvas.width / 2 - 80, canvas.height / 2 + 40);
    
    ctx.font = '16px Arial';
    ctx.fillText('Drücke R zum Neustarten', canvas.width / 2 - 100, canvas.height - 30);

    shopDisplay.style.display = 'block'; // Zeige den Shop an
}

function drawStartScreen() {
    ctx.fillStyle = '#a0d6a0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.font = '40px Arial';
    ctx.fillText('    Spiel', canvas.width / 2 - 100, canvas.height / 2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText('Drücke Leertaste zum Starten', canvas.width / 2 - 130, canvas.height / 2 + 10);
}

function buyPowerUp(powerUp) {
    if (powerUp === 'extraLife' && coinCount >= 3) {
        inventory.extraLife++;
        coinCount -= 3;
    }
    updateDisplays();
}

function gameLoop(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBackground();
    drawInvincibility();

    if (isGameOver) {
        drawGameOver();
        return;
    }

    if (score > highScore) {
        highScore = score;
    }

    if (timestamp - lastPipeTime > spawnRate) {
        spawnPipe();
        lastPipeTime = timestamp;
        if (spawnRate > 500) {
            spawnRate -= 50;
        }
    }

    if (timestamp - lastCoinTime > 1000 && pipes.length > 0) {
        spawnCoin();
        lastCoinTime = timestamp;
    }

    drawDino();
    drawPipes();
    updatePipes();
    drawCoins();
    updateCoins();
    updateDino();
    updateDisplays();

    requestAnimationFrame(gameLoop);
}

function closeShop() {
    shopDisplay.style.display = 'none';
}

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !isGameOver) {
        dino.dy = -dino.jumpStrength;
    }
    if (event.code === 'KeyR' && isGameOver) {
        resetGame();
    }
    if (event.code === 'Space' && !gameStarted) {
        gameStarted = true;
        resetGame();
    }
});

// Zeige den Startbildschirm
drawStartScreen();


function resetGame() {
    dino.y = 200;
    dino.dy = 0;
    score = 0;
    pipes = [];
    coins = [];
    isGameOver = false;
    spawnRate = 1500;
    lastPipeTime = 0;
    lastCoinTime = 0;
    updateDisplays();
    shopDisplay.style.display = 'none'; // Shop ausblenden beim Neustart
    requestAnimationFrame(gameLoop);
}

function drawGameOver() {
    ctx.fillStyle = '#ff0000'; // Roter Hintergrund für Game Over
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '40px Arial';
    ctx.fillText('Game Over!', canvas.width / 2 - 100, canvas.height / 2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText(`Dein Score: ${score}`, canvas.width / 2 - 80, canvas.height / 2 + 10);
    ctx.fillText(`Highscore: ${highScore}`, canvas.width / 2 - 80, canvas.height / 2 + 40);
    
    // Kleinerer Text für Neustart-Anweisung, unten in der Mitte
    ctx.font = '16px Arial';
    ctx.fillText('Drücke R zum Neustarten', canvas.width / 2 - 100, canvas.height - 30);

    shopDisplay.style.display = 'block'; // Zeige den Shop an
}

// Funktion zum Starten des Spiels und für Touch-Events
function handleTouchStart(event) {
    // Wenn das Spiel nicht gestartet ist, starte es
    if (!gameStarted) {
        gameStarted = true;
        resetGame();
    }
    
    // Wenn das Spiel vorbei ist, starte es neu
    if (isGameOver) {
        resetGame();
    }
    
    // Wenn das Spiel läuft, lasse den Dino springen
    if (!isGameOver) {
        dino.dy = -dino.jumpStrength;
    }
}

// Event Listener für Touch-Start auf dem Canvas
canvas.addEventListener('touchstart', handleTouchStart);

// Zusätzlich für das Draggen oder Swipen (optional) für mobiles Gameplay
let touchStartY = 0;  // Wir speichern den Start-Y-Wert des Touches
let isTouching = false;

canvas.addEventListener('touchstart', (event) => {
    if (event.touches.length == 1) {
        isTouching = true;
        touchStartY = event.touches[0].clientY; // Y-Position des Touches merken
    }
});

canvas.addEventListener('touchmove', (event) => {
    if (isTouching && event.touches.length == 1) {
        let touchMoveY = event.touches[0].clientY;
        if (touchMoveY < touchStartY) {  // Wenn nach oben gewischt wird, springt der Dino
            dino.dy = -dino.jumpStrength;
        }
    }
});

canvas.addEventListener('touchend', () => {
    isTouching = false;
});
