window.onload = () => {

// ---- canvas ----
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ---- кнопки ----
const startBtn = document.getElementById('startBtn');
const video = document.getElementById('introVideo');
const nextBtn = document.getElementById('nextBtn');

// ---- стани ----
let currentScene = 'menu';
let sceneIndex = 0;

let photoIndex = 0;
let photoTextIndex = 0;

let displayedText = "";
let typing = false;

// ---- сцени ----
const scenes = {

    menu: [
        "Натисни Start ❤️"
    ],

    blackText: [
        "Khushi: ughh, again i have to go through this...",
        "Khushi: why does this keep happening...",
        "Khushi: everything feels the same...",
        "Khushi: hmm... i feel so sleepy...",
        "Khushi: i'll just close my eyes..."
    ],

    photo: [
        {
            img: "photo1",
            texts: [
                "Ти найкрасивіша 🌙",
                "Серйозно, я не жартую...",
                "Я можу дивитись на тебе вічно 💫"
            ]
        },
        {
            img: "photo2",
            texts: [
                "Я думаю про тебе кожну хвилину 💖",
                "Навіть коли зайнятий...",
                "Ти все одно в моїй голові ❤️"
            ]
        },
        {
            img: "photo3",
            texts: [
                "Твої очі як зорі ✨",
                "Вони реально світяться...",
                "Я в них тону..."
            ]
        },
        {
            img: "photo4",
            texts: [
                "Люблю тебе назавжди ❤️",
                "І це не просто слова",
                "Це факт 💯"
            ]
        }
    ],

    finale: [
        "Ти — найкраще що зі мною сталось ❤️",
        "Я вдячний за кожну секунду з тобою 💫",
        "Happy Birthday my soulmate ❤️"
    ]
};

// ---- картинки ----
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
    }, 40);
}

// ---- старт сцени ----
function startScene(sceneName) {
    currentScene = sceneName;

    if (sceneName === 'photo') {
        photoIndex = 0;
        photoTextIndex = 0;

        typeText(scenes.photo[0].texts[0]);
    } else {
        sceneIndex = 0;
        typeText(scenes[sceneName][0]);
    }
}

// ---- кнопки ----
startBtn.onclick = () => {
    startBtn.style.display = 'none';

    canvas.style.zIndex = "1"; // 🔥 підняли назад

    video.style.display = 'block';
    video.muted = true;
    video.currentTime = 0; // 🔥 з початку
    video.play();
};

video.onended = () => {
    console.log("🏁 video ended");

    // ховаємо відео
    video.style.display = 'none';

    // 🔥 опускаємо canvas (як ти хотів)
    canvas.style.zIndex = "0";

    // ⏸️ пауза 1.5 секунди
    setTimeout(() => {
        nextBtn.style.display = 'inline-block';
        startScene('blackText');
    }, 1500);
};

video.onloadeddata = () => {
    console.log("✅ video loaded");
};

video.onerror = () => {
    console.log("❌ video error");
};

nextBtn.onclick = () => {
    if (typing) return;

    // ---- PHOTO ----
    if (currentScene === 'photo') {

        let currentPhoto = scenes.photo[photoIndex];

        photoTextIndex++;

        // ще є текст в цій фотці
        if (photoTextIndex < currentPhoto.texts.length) {
            typeText(currentPhoto.texts[photoTextIndex]);
            return;
        }

        // наступна фотка
        photoIndex++;
        photoTextIndex = 0;

        if (photoIndex >= scenes.photo.length) {
            startScene('finale');
            return;
        }

        typeText(scenes.photo[photoIndex].texts[0]);
        return;
    }

    // ---- ІНШІ СЦЕНИ ----
    sceneIndex++;
    let scene = scenes[currentScene];

    if (sceneIndex >= scene.length) {

        if (currentScene === 'blackText') {
            startScene('photo');
        }
        else if (currentScene === 'finale') {
            nextBtn.style.display = 'none';
        }

        return;
    }

    typeText(scene[sceneIndex]);
};

// ---- текст ----
function drawText(text, y) {
    ctx.fillStyle = 'white';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';

    const lines = text.split('\n');

    lines.forEach((line, i) => {
        ctx.fillText(line, canvas.width / 2, y + i * 45);
    });
}

// ---- малювання картинки ----
function drawImageSafe(img) {
    if (img && img.complete && img.naturalWidth !== 0) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

// ---- головний цикл ----
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // MENU
    if (currentScene === 'menu') {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawText(scenes.menu[0], canvas.height / 2);
    }

    // BLACK TEXT
    else if (currentScene === 'blackText') {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawText(displayedText, canvas.height / 2);
    }

    // PHOTO
    else if (currentScene === 'photo') {
        let current = scenes.photo[photoIndex];

        drawImageSafe(images[current.img]);
        drawText(displayedText, canvas.height - 80);
    }

    // FINALE
    else if (currentScene === 'finale') {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = '60px Arial';
        drawText(displayedText, canvas.height / 2);
    }

    requestAnimationFrame(gameLoop);
}

// ---- старт ----
gameLoop();

};