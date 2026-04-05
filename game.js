window.onload = () => {

// ---- canvas ----
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ---- кнопки ----
const startBtn = document.getElementById('startBtn');
const nextBtn = document.getElementById('nextBtn');

// ---- стани ----
let gameState = 'menu';
let currentTextIndex = 0;
let photoIndex = 0;
let displayedText = "";
let typing = false;

// ---- тексти ----
const blackTexts = [
    "Khushi: ughh, again i have to go through this...",
    "Khushi: i'll just go there again...",""
    ,
    "Khushi: hmm... i feel so sleepy...\n i'll just close my eyes here and..."
];

const photoTexts = [
    "Ти найкрасивіша 🌙",
    "Я думаю про тебе кожну хвилину 💖",
    "Твої очі як зорі ✨",
    "Люблю тебе назавжди ❤️"
];

// ---- картинки (можуть бути null) ----
const images = {
    photo1: new Image(),
    photo2: new Image(),
    photo3: new Image(),
    photo4: new Image()
};

images.photo1.src = "assets/photo1.png";
images.photo2.src = "assets/photo2.png";
images.photo3.src = "assets/photo3.png";
images.photo4.src = "assets/photo4.png";

// ---- typing ефект ----
function typeText(text) {
    displayedText = "";
    typing = true;

    let i = 0;
    const interval = setInterval(() => {
        displayedText += text[i];
        i++;

        if (i >= text.length) {
            clearInterval(interval);
            typing = false;
        }
    }, 50);
}

// ---- кнопки ----
startBtn.onclick = () => {
    startBtn.style.display = 'none';
    nextBtn.style.display = 'inline-block';

    gameState = 'blackText';
    currentTextIndex = 0;
    typeText(blackTexts[0]);
};

nextBtn.onclick = () => {
    if (typing) return;

    if (gameState === 'blackText') {
        currentTextIndex++;

        if (currentTextIndex >= blackTexts.length) {
            gameState = 'photo';
            photoIndex = 0;
            typeText(photoTexts[0]);
        } else {
            typeText(blackTexts[currentTextIndex]);
        }
    }

    else if (gameState === 'photo') {
        photoIndex++;

        if (photoIndex >= photoTexts.length) {
            gameState = 'finale';
            nextBtn.style.display = 'none';
        } else {
            typeText(photoTexts[photoIndex]);
        }
    }
};

// ---- малювання тексту ----
function drawText(text, y) {
    ctx.fillStyle = 'white';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(text, canvas.width / 2, y);
}

// ---- перевірка чи картинка загрузилась ----
function drawImageSafe(img) {
    if (img.complete && img.naturalWidth !== 0) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    } else {
        // якщо нема картинки — просто чорний фон
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

// ---- головний цикл ----
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'menu') {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawText("Натисни Старт ❤️", canvas.height / 2);
    }

    else if (gameState === 'blackText') {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawText(displayedText, canvas.height / 2);
    }

    else if (gameState === 'photo') {
        drawImageSafe(images[`photo${photoIndex+1}`]);

        drawText(displayedText, canvas.height - 80);
    }

    else if (gameState === 'finale') {
        drawImageSafe(images.photo4);

        ctx.font = '60px Arial';
        drawText("Happy Birthday my soulmate ❤️", canvas.height / 2);
    }

    requestAnimationFrame(gameLoop);
}

// ---- старт ----
gameLoop();

};