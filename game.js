window.onload = () => {
    let textAlpha = 1;

    // ---- canvas ----
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // ---- кнопки ----
    const startBtn = document.getElementById('startBtn');
    const video = document.getElementById('introVideo');
    const overlayText = document.getElementById('overlayText');

    // ---- аудіо ----
    const music1 = new Audio("assets/music1.mp3");
    const music2 = new Audio("assets/music2.mp3");
    const music3 = new Audio("assets/music3.mp3");
    const music4 = new Audio("assets/music4.mp3");
    const music55 = new Audio("assets/music55.mp3");
    const music5 = new Audio("assets/music5.mp3");
    const music6 = new Audio("assets/music6.mp3");
    const music66 = new Audio("assets/music66.mp3");
    const music7 = new Audio("assets/music7.mp3");

    const allAudios = [music1, music2, music3, music4, music55, music5, music6, music66, music7];

    allAudios.forEach(audio => {
        audio.preload = "auto";
        audio.loop = false;
        audio.volume = 1;
        audio.pause();
        audio.currentTime = 0;
        audio.muted = false;
        audio._fadeTimeout = null;
    });

    music55.loop = false;
    music66.loop = true;

    // ---- Web Audio API ----
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContextClass();
    const gainMap = new Map();

    function setupAudio(audio) {
        const source = audioContext.createMediaElementSource(audio);
        const gainNode = audioContext.createGain();

        source.connect(gainNode);
        gainNode.connect(audioContext.destination);

        gainNode.gain.value = 0;
        gainMap.set(audio, gainNode);
    }

    allAudios.forEach(setupAudio);

    function drawText(text, align = 'center', vertical = 'center') {
        const { w, h } = getSceneSize();

        ctx.fillStyle = 'white';
        ctx.font = '30px sans-serif';
        ctx.textAlign = align;
        ctx.textBaseline = 'top';

        const maxWidth = w - 100;
        const lines = wrapText(ctx, text, maxWidth);
        const lineHeight = 40;

        let x = align === 'left' ? 50 : w / 2;

        let startY;
        if (vertical === 'top') {
            startY = 50;
        } else if (vertical === 'bottom') {
            startY = h - (lines.length * lineHeight) - 50;
        } else {
            startY = h / 2 - (lines.length * lineHeight) / 2;
        }

        lines.forEach((line, i) => {
            ctx.fillText(line.trim(), x, startY + i * lineHeight);
        });
    }

    function fadeAudio(audio, target = 1, duration = 1, restart = false) {
        const gainNode = gainMap.get(audio);
        if (!gainNode) return;

        audio.muted = false;

        if (restart) {
            audio.currentTime = 0;
        }

        if (audio.paused && target > 0) {
            audio.play().catch(() => {});
        }

        const now = audioContext.currentTime;
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        gainNode.gain.linearRampToValueAtTime(target, now + duration);

        clearTimeout(audio._fadeTimeout);

        if (target === 0) {
            audio._fadeTimeout = setTimeout(() => {
                audio.pause();
            }, duration * 1000 + 80);
        }
    }

    function wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = "";

        words.forEach(word => {
            const testLine = currentLine + word + " ";
            const width = ctx.measureText(testLine).width;

            if (width > maxWidth && currentLine !== "") {
                lines.push(currentLine);
                currentLine = word + " ";
            } else {
                currentLine = testLine;
            }
        });

        lines.push(currentLine);
        return lines;
    }
    function setAudioLevel(audio, value = 0) {
        const gainNode = gainMap.get(audio);
        if (!gainNode) return;

        const now = audioContext.currentTime;
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(value, now);
    }

    function unlockAudios() {
        allAudios.forEach(audio => {
            audio.muted = true;
            audio.currentTime = 0;

            audio.play()
                .then(() => {
                    audio.pause();
                    audio.currentTime = 0;
                    audio.muted = false;
                    setAudioLevel(audio, 0);
                })
                .catch(() => {
                    audio.muted = false;
                    setAudioLevel(audio, 0);
                });
        });
    }
    function getSceneSize() {
        return {
            w: isRotatedAfterVideo ? canvas.height : canvas.width,
            h: isRotatedAfterVideo ? canvas.width : canvas.height
        };
    }

    function stopAllAudios() {
        allAudios.forEach(audio => {
            clearTimeout(audio._fadeTimeout);
            audio.pause();
            audio.currentTime = 0;
            audio.muted = false;
            setAudioLevel(audio, 0);
        });
    }

    // ---- fade екран ----
    let fadeAlpha = 0;
    let fading = false;

    function fadeToBlack(callback, speed = 0.02) {
        fading = true;
        const i = setInterval(() => {
            fadeAlpha += speed;

            if (fadeAlpha >= 1) {
                fadeAlpha = 1;
                clearInterval(i);
                if (callback) callback();
            }
        }, 30);
    }

    function fadeFromBlack(speed = 0.02) {
        const i = setInterval(() => {
            fadeAlpha -= speed;
            if (fadeAlpha <= 0) {
                fadeAlpha = 0;
                clearInterval(i);
                fading = false;
            }
        }, 30);
    }

    // ---- rotate after video ----
    // ---- rotate after video ----
    let isRotatedAfterVideo = false;

    function applyRotatedGameView() {
        isRotatedAfterVideo = true;

        // лишаємо нормальний внутрішній розмір канваса
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        canvas.style.position = "fixed";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.width = "100vw";
        canvas.style.height = "100vh";
        canvas.style.display = "block";
        canvas.style.transformOrigin = "center center";

        // тільки візуальний поворот
        
    }

    window.addEventListener("resize", () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;


        canvas.style.transform = "none";
    });

    // ---- стани ----
    let currentScene = 'menu';
    let sceneIndex = 0;

    let photoIndex = 0;
    let displayedText = "";
    let typing = false;

    let showContinue = false;
    let showTheEnd = false;

    let gameStarted = false;

    // ---- slideshow ----
    let currentImgIndex = 0;
    let imgTimer = 0;

    // ---- сцени ----
    const scenes = {
        menu: ["Натисни Start ❤️"],

        blackText: [
            "Khushi: ughh, again?! Why I have to go through this?...",
            "Khushi: Hmm and why does this keep happening with me...",
            "Khushi: Just... everything feels the same!",
            "Khushi: hmm...  I'll just... go on the rooftop again...",
            "Khushi: I wish.. everything would be fine(TT)"
        ],

        photo: [
            {
                imgs: ["photo1", "photo15"],
                texts: [
                    { text: "Khushi: hmm... i feel so sleepy...", pause: 5000 },
                    { text: "But wait.. i want to turn something on first so i won't feel so alone at least(TT)", pause: 10500 },
                    {
                        text: "hmm... i wish he was here (｡-.-｡)...zzz *Falls Asleep*",
                        pause: 10500,
                        action: () => {
                            fadeAudio(music55, 1.0, 1.2);   // голосно
                            fadeAudio(music5, 0.9, 1.2);    // голосніше

                        setTimeout(() => {
                            fadeAudio(music66, 0.08, 1.0, true);
                        }, 1000);
                        }
                    }
                ]
            },
            { imgs: ["photo2"], texts: [""] },
            { imgs: ["photo3"], texts: [""] },
            { imgs: ["photo4"], texts: [""] }
        ],

        finale: [
            "Khushi - you are the best what happened with me",
            "And i really can't imagine my life without you now",
            "Everything feels like eternity...",
            "Happy Birthday my soulmate ❤️"
        ]
    };

    // ---- картинки ----
    const images = {
        photo1: new Image(),
        photo2: new Image(),
        photo3: new Image(),
        photo4: new Image(),
        photo15: new Image(),
        photo55: new Image()
    };

    images.photo1.src = "assets/photo1.png";
    images.photo2.src = "assets/photo2.png";
    images.photo3.src = "assets/photo3.png";
    images.photo4.src = "assets/photo4.png";
    images.photo15.src = "assets/photo15.png";
    images.photo55.src = "assets/photo55.png";

    // ---- typing ----
    function typeText(text, speed = 40) {
        displayedText = "";

        if (!text || text.length === 0) {
            typing = false;
            return;
        }

        typing = true;
        let i = 0;
        const interval = setInterval(() => {
            displayedText += text[i];
            i++;

            if (i >= text.length) {
                clearInterval(interval);
                typing = false;
            }
        }, speed);
    }

    // ---- тексти для photo-сцени ----
    function playPhotoTexts(photoObj, index = 0) {
        if (!photoObj.texts || index >= photoObj.texts.length) return;

        const item = photoObj.texts[index];

        let text;
        let pause;

        if (typeof item === "string") {
            text = item;
            pause = 3000;
        } else {
            text = item.text;
            pause = item.pause ?? 3000;
        }

        if (item.action) {
            item.action();
        }

        displayedText = "";
        typeText(text);

        const wait = setInterval(() => {
            if (!typing) {
                clearInterval(wait);

                setTimeout(() => {
                    playPhotoTexts(photoObj, index + 1);
                }, pause);
            }
        }, 100);
    }

    // ---- slideshow ----
    function updateSlideshow(current) {
        if (!current.imgs || current.imgs.length <= 1) return;

        imgTimer++;
        if (imgTimer > 60) {
            imgTimer = 0;
            currentImgIndex = (currentImgIndex + 1) % current.imgs.length;
        }
    }

    // ---- BLACK SCENE ----
    function playBlackScene() {
        fadeAudio(music1, 0.6, true);

        let i = 0;

        function nextLine() {
            if (i >= scenes.blackText.length) return;

            typeText(scenes.blackText[i]);

            const wait = setInterval(() => {
                if (!typing) {
                    clearInterval(wait);

                    setTimeout(() => {
                        if (i === 3) {
                            fadeAudio(music2, 0.3, true);
                            fadeAudio(music1, 0, 1.0);
                        }

                        if (i === 4) {
                            setTimeout(() => {
                                fadeAudio(music1, 0, 0.8);
                                music2.pause();
                                music2.currentTime = 0;

                                fadeAudio(music3, 0.8, true);
                                let fade = setInterval(() => {
                                    textAlpha -= 0.05;
                                    if (textAlpha <= 0) {
                                        textAlpha = 0;
                                        clearInterval(fade);
                                    }
                                }, 30);
                                setTimeout(() => {
                                    music1.pause();
                                    music1.currentTime = 0;

                                    music2.pause();
                                    music2.currentTime = 0;

                                    fadeAudio(music4, 1, true);

                                    setTimeout(() => {
                                        fadeToBlack(() => {
                                            startScene('photo');
                                            fadeFromBlack();
                                        });
                                    }, 2000); // піджени під music4
                                }, 2000); // піджени під music3
                            }, 3000);
                            return;
                        }

                        i++;
                        nextLine();
                    }, 3000);
                }
            }, 100);
        }

        nextLine();
    }

    // ---- PHOTO SCENE ----
    function startPhotoScene() {
        photoIndex = 0;
        currentImgIndex = 0;
        imgTimer = 0;
        displayedText = "";

        setAudioLevel(music5, 0);
        setAudioLevel(music55, 0);
        setAudioLevel(music6, 0);
        setAudioLevel(music3, 0);
        setAudioLevel(music66, 0);
        setAudioLevel(music7, 0);

        playPhotoTexts(scenes.photo[0]);

        fadeAudio(music5, 0.6, true);

        setTimeout(() => {
            fadeToBlack(() => {
                photoIndex = 1;
                currentImgIndex = 0;
                imgTimer = 0;
                displayedText = "";

                fadeAudio(music5, 0, 1.0);
                fadeAudio(music66, 0.65, 1.2, false); // голосніше на 2 сцені
                fadeFromBlack(0.008);
            }, 0.008);
        }, 29000);

        setTimeout(() => {
            fadeToBlack(() => {
                photoIndex = 2;
                currentImgIndex = 0;
                imgTimer = 0;
                displayedText = "";

                fadeAudio(music7, 1, true);
                fadeAudio(music66, 0.08, 1.2); // знову тихо

                fadeFromBlack(0.008);
            }, 0.008);
        }, 29000 + 25000);

        setTimeout(() => {
            fadeToBlack(() => {
                photoIndex = 3;
                currentImgIndex = 0;
                imgTimer = 0;
                displayedText = "";
                fadeFromBlack();
            });
        }, 29000 + 25000 + 20000);

        setTimeout(() => {
            fadeToBlack(() => {
                fadeAudio(music55, 0, 1.0);
                fadeAudio(music66, 0.08, 1.0, false);
                startScene('finale');
                fadeFromBlack();
            });
        }, 29000 + 25000 + 20000 + 8000);
    }

    // ---- старт сцени ----
    function startScene(sceneName) {
        currentScene = sceneName;

        if (sceneName === 'blackText') {
            playBlackScene();
        }

        if (sceneName === 'photo') {
            startPhotoScene();
        }

        if (sceneName === 'finale') {
            showContinue = false;
            showTheEnd = false;

            setTimeout(() => {
                sceneIndex = 0;
                typeText(scenes.finale[0]);
                showContinue = true;
            }, 3000);
        }
    }

    // ---- кнопки ----
// ---- старт після відео ----
let videoFinished = false;
let videoFallbackTimeout = null;

function startAfterVideo() {
    if (videoFinished) return;
    videoFinished = true;

    clearTimeout(videoFallbackTimeout);

    video.pause();
    video.style.display = 'none';

    setTimeout(() => {
        applyRotatedGameView();
        startScene('blackText');
    }, 120);
}

// ---- кнопки ----
startBtn.onclick = async () => {
    if (gameStarted) return;
    gameStarted = true;
    videoFinished = false;

    stopAllAudios();

    startBtn.style.display = 'none';
    video.style.display = 'block';
    video.currentTime = 0;

    try {
        await audioContext.resume();
        unlockAudios();

        await video.play();

        // fallback для Android, якщо ended не спрацює
        const durationMs = (!isNaN(video.duration) && video.duration > 0)
            ? video.duration * 1000
            : 8000; // запасний варіант, якщо duration ще не відомий

        videoFallbackTimeout = setTimeout(() => {
            startAfterVideo();
        }, durationMs + 500);

    } catch (err) {
        console.log("video play error:", err);

        // якщо відео не запустилось — все одно йдемо далі
        startAfterVideo();
    }
};

// Android-safe
video.addEventListener("ended", startAfterVideo);

// ще один запасний варіант
video.addEventListener("pause", () => {
    if (!video.ended && gameStarted && !videoFinished && video.currentTime > 0) {
        const nearEnd = video.duration && (video.duration - video.currentTime < 0.25);
        if (nearEnd) {
            startAfterVideo();
        }
    }
});

    // ---- клік для фіналу ----
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    if (isRotatedAfterVideo) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(Math.PI / 2);
        ctx.translate(-canvas.height / 2, -canvas.width / 2);
    }

    const { w, h } = getSceneSize();

    if (currentScene === 'blackText') {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, w, h);

        ctx.globalAlpha = textAlpha;
        drawText(displayedText, 'center', 'center');
        ctx.globalAlpha = 1;
    }

    if (currentScene === 'photo') {
        let current = scenes.photo[photoIndex];
        updateSlideshow(current);

        let img = images[current.imgs[currentImgIndex]];

        ctx.imageSmoothingEnabled = false;

        if (img && img.complete) {
            // нормальне вписування фото без кривого розтягування
            const scale = Math.min(w / img.width, h / img.height);
            const newWidth = img.width * scale;
            const newHeight = img.height * scale;

            const x = (w - newWidth) / 2;
            const y = (h - newHeight) / 2;

            ctx.drawImage(img, x, y, newWidth, newHeight);
        }

        // текст поверх фото
        if (displayedText) {
            

            ctx.fillStyle = 'white';
            ctx.font = '28px sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';

            const maxWidth = w - 80;
            const lines = wrapText(ctx, displayedText, maxWidth);
            const lineHeight = 34;

            lines.forEach((line, i) => {
                ctx.fillText(line.trim(), 40, h - 140 + i * lineHeight);
            });
        }
    }

    if (currentScene === 'finale') {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, w, h);

    drawText(displayedText, 'center', 'center');

    if (showContinue && !typing) {
        ctx.fillStyle = 'yellow';
        ctx.font = '26px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText("Continue", w / 2, h - 80);
    }

    if (showTheEnd) {
        ctx.fillStyle = 'yellow';
        ctx.font = '40px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText("The End", w / 2, h - 80);
    }
}

    function handleFinalTap() {
    if (currentScene === 'finale' && !typing) {
            if (showTheEnd) return;

            if (showContinue) {
                sceneIndex++;

                if (sceneIndex < scenes.finale.length) {
                    typeText(scenes.finale[sceneIndex]);
                } else {
                    showContinue = false;
                    showTheEnd = true;
                }
            }
        }
    }

    canvas.addEventListener("click", handleFinalTap);
    canvas.addEventListener("touchstart", (e) => {
        e.preventDefault();
        handleFinalTap();
    }, { passive: false });

    if (fadeAlpha > 0) {
        ctx.fillStyle = "rgba(0,0,0," + fadeAlpha + ")";
        ctx.fillRect(0, 0, w, h);
    }

    ctx.restore();

    requestAnimationFrame(gameLoop);
}

    gameLoop();
};