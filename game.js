window.onload = () => {

    // ---- canvas ----
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // ---- кнопки ----
    const startBtn = document.getElementById('startBtn');
    const video = document.getElementById('introVideo');

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
    let isRotatedAfterVideo = false;

    function applyRotatedGameView() {
        isRotatedAfterVideo = true;

        canvas.width = window.innerHeight;
        canvas.height = window.innerWidth;

        canvas.style.position = "absolute";
        canvas.style.top = "50%";
        canvas.style.left = "50%";
        canvas.style.transform = "translate(-50%, -50%) rotate(90deg)";
        canvas.style.transformOrigin = "center center";
        canvas.style.width = window.innerHeight + "px";
        canvas.style.height = window.innerWidth + "px";
        canvas.style.display = "block";
    }

    window.addEventListener("resize", () => {
        if (isRotatedAfterVideo) {
            canvas.width = window.innerHeight;
            canvas.height = window.innerWidth;
            canvas.style.width = window.innerHeight + "px";
            canvas.style.height = window.innerWidth + "px";
        } else {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
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
                                fadeAudio(music66, 0.08, 1.0); // тихо
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
                fadeAudio(music66, 0.65, 1.2, true); // голосніше на 2 сцені
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
                fadeAudio(music66, 0, 1.0);
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
    startBtn.onclick = async () => {
        if (gameStarted) return;
        gameStarted = true;

        stopAllAudios();

        startBtn.style.display = 'none';
        video.style.display = 'block';
        video.currentTime = 0;

        try {
            await audioContext.resume();
            await video.play();
            unlockAudios();
        } catch (err) {
            console.log("video play error:", err);
        }
    };

    video.onended = () => {
        video.style.display = 'none';
        applyRotatedGameView();
        startScene('blackText');
    };

    // ---- клік для фіналу ----
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

    // ---- текст ----
    function drawText(text, align = 'center', vertical = 'center') {
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = align;

        const maxWidth = canvas.width - 100;
        const lines = wrapText(ctx, text, maxWidth);
        const lineHeight = 40;

        let x = align === 'left' ? 50 : canvas.width / 2;

        let startY = vertical === 'top'
            ? 50
            : vertical === 'bottom'
                ? canvas.height - (lines.length * lineHeight)
                : canvas.height / 2 - (lines.length * lineHeight) / 2;

        lines.forEach((line, i) => {
            ctx.fillText(line, x, startY + i * lineHeight);
        });
    }

    // ---- render ----
    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (currentScene === 'blackText') {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            drawText(displayedText, 'left', 'top');
        }

        if (currentScene === 'photo') {
    let current = scenes.photo[photoIndex];
    updateSlideshow(current);

    let img = images[current.imgs[currentImgIndex]];

    ctx.imageSmoothingEnabled = false;

    // тільки для 3-ї фотки
    if (photoIndex === 2) {
        const scale = Math.min(
            canvas.width / img.width,
            canvas.height / img.height
        );

        const newWidth = img.width * scale;
        const newHeight = img.height * scale;

        const x = (canvas.width - newWidth) / 2;
        const y = (canvas.height - newHeight) / 2;

        ctx.drawImage(img, x, y, newWidth, newHeight);
    } else {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }

    // текст поверх фото
    if (displayedText) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.11)';
        ctx.fillRect(20, canvas.height - 170, canvas.width - 40, 120);

        ctx.fillStyle = 'white';
        ctx.font = '28px Arial';
        ctx.textAlign = 'left';

        const maxWidth = canvas.width - 80;
        const lines = wrapText(ctx, displayedText, maxWidth);
        const lineHeight = 34;

        lines.forEach((line, i) => {
            ctx.fillText(line, 40, canvas.height - 100 + i * lineHeight);
        });
    }
}

        if (currentScene === 'finale') {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            drawText(displayedText, 'center', 'center');

            if (showContinue && !typing) {
                ctx.fillStyle = 'yellow';
                ctx.font = '26px Arial';
                ctx.textAlign = 'center';
                ctx.fillText("Continue", canvas.width / 2, canvas.height - 80);
            }

            if (showTheEnd) {
                ctx.fillStyle = 'yellow';
                ctx.font = '40px Arial';
                ctx.textAlign = 'center';
                ctx.fillText("The End", canvas.width / 2, canvas.height - 80);
            }
        }

        if (fadeAlpha > 0) {
            ctx.fillStyle = "rgba(0,0,0," + fadeAlpha + ")";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        requestAnimationFrame(gameLoop);
    }

    gameLoop();
};