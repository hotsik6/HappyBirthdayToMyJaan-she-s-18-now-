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
        audio.volume = 0;
        audio.pause();
        audio.currentTime = 0;
    });
    // ---- loop ----
    music55.loop = false;
    music66.loop = true;

    function unlockAudios() {
        allAudios.forEach(audio => {
            audio.muted = true;
            audio.volume = 0;
            audio.currentTime = 0;

            audio.play()
                .then(() => {
                    audio.pause();
                    audio.currentTime = 0;
                    audio.muted = false;
                    audio.volume = 0;
                })
                .catch(() => {
                    audio.muted = false;
                    audio.volume = 0;
                });
        });
    }

    function stopAllAudios() {
        allAudios.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
            audio.volume = 0;
            audio.muted = false;
        });
    }
    // ---- fade звук ----
    function fadeIn(audio, target = 1, speed = 0.01) {
        audio.muted = false;
        audio.play().catch(() => {});

        const i = setInterval(() => {
            if (audio.volume < target) {
                audio.volume += speed;
            } else {
                audio.volume = target;
                clearInterval(i);
            }
        }, 50);
    }

    function fadeOut(audio, speed = 0.01) {
        const i = setInterval(() => {
            if (audio.volume > 0) {
                audio.volume -= speed;
            } else {
                audio.volume = 0;
                audio.pause();
                clearInterval(i);
            }
        }, 50);
    }

    function fadeToVolume(audio, target = 1, speed = 0.01) {
        audio.muted = false;
        audio.play().catch(() => {});

        const i = setInterval(() => {
            if (Math.abs(audio.volume - target) <= speed) {
                audio.volume = target;
                clearInterval(i);
                return;
            }

            if (audio.volume < target) {
                audio.volume += speed;
            } else {
                audio.volume -= speed;
            }
        }, 50);
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

        // міняємо логічні розміри місцями
        canvas.width = window.innerHeight;
        canvas.height = window.innerWidth;

        // ставимо canvas по центру і повертаємо
        canvas.style.position = "absolute";
        canvas.style.top = "50%";
        canvas.style.left = "50%";
        canvas.style.transform = "translate(-50%, -50%) rotate(90deg)";
        canvas.style.transformOrigin = "center center";

        // фізичний розмір після повороту
        canvas.style.width = window.innerHeight + "px";
        canvas.style.height = window.innerWidth + "px";

        // на всяк випадок
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
                            fadeIn(music55, 1);
                            fadeIn(music5, 0.75);

                            setTimeout(() => {
                                fadeIn(music66, 0.18);
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
        fadeIn(music1, 0.6);

        let i = 0;

        function nextLine() {
            if (i >= scenes.blackText.length) return;

            typeText(scenes.blackText[i]);

            const wait = setInterval(() => {
                if (!typing) {
                    clearInterval(wait);

                    setTimeout(() => {
                        if (i === 3) {
                            fadeIn(music2, 0.3);
                            fadeOut(music1);
                        }

                        if (i === 4) {
                            setTimeout(() => {
                                fadeOut(music1);
                                music2.pause();
                                music2.currentTime = 0;

                                fadeIn(music3, 0.8);

                                    // ⏱ чекаємо поки music3 "типу закінчилась"
                                    setTimeout(() => {

                                        music1.pause();
                                        music1.currentTime = 0;

                                        music2.pause();
                                        music2.currentTime = 0;

                                        fadeIn(music4, 1);

                                        // ⏱ чекаємо music4
                                        setTimeout(() => {
                                            fadeToBlack(() => {
                                                startScene('photo');
                                                fadeFromBlack();
                                            });
                                        }, 2000); // ← піджени під довжину music4 2000

                                    }, 2000); // ← піджени під довжину music3 2000
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

        music5.volume = 0;
        music55.volume = 0;
        music6.volume = 0;
        music3.volume = 0;
        music66.volume = 0;
        music7.volume = 0;

        playPhotoTexts(scenes.photo[0]);

        fadeIn(music5, 0.6);

        setTimeout(() => {
            fadeToBlack(() => {
                photoIndex = 1;
                currentImgIndex = 0;
                imgTimer = 0;
                displayedText = "";

                fadeOut(music5);
                fadeToVolume(music66, 0.55, 0.01);

                fadeFromBlack(0.008);
            }, 0.008);
        }, 29000);

        setTimeout(() => {
            fadeToBlack(() => {
                photoIndex = 2;
                currentImgIndex = 0;
                imgTimer = 0;
                displayedText = "";

                fadeIn(music7, 1);
                fadeToVolume(music66, 0.18, 0.01);

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
                fadeOut(music55);
                fadeOut(music66);
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
    canvas.addEventListener("click", () => {
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
    });

    // ---- текст ----
    function drawText(text, align = 'center', vertical = 'center') {
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = align;

        let x = align === 'left' ? 50 : canvas.width / 2;

        let y = vertical === 'top'
            ? 50
            : vertical === 'bottom'
                ? canvas.height - 80
                : canvas.height / 2;

        ctx.fillText(text, x, y);
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
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            if (displayedText) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.11)';
                ctx.fillRect(20, canvas.height - 170, canvas.width - 40, 120);

                ctx.fillStyle = 'white';
                ctx.font = '28px Arial';
                ctx.textAlign = 'left';
                ctx.fillText(displayedText, 40, canvas.height - 100);
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