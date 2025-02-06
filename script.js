/******************** Global Variables ********************/
// A word bank that includes classic words plus One Piece–themed words
const WORD_BANK = "the quick brown fox jumps over the lazy dog practice makes perfect coding challenge never stop learning one piece wano arc adventure samurai pirate nakama".split(" ");
let testDuration = 60; // seconds
let timerInterval;
let timeLeft = testDuration;
let currentTestWords = [];
let currentWordIndex = 0;
let correctCharCount = 0;
let totalCharCount = 0;
let isTestRunning = false;
let selectedWordCount = 10;

/******************** DOM Elements ********************/
const welcomeScreen = document.getElementById("welcomeScreen");
const startButton = document.getElementById("startButton");
const gameScreen = document.getElementById("gameScreen");
const themeToggle = document.getElementById("themeToggle");
const timerDisplay = document.getElementById("timer");
const wpmDisplay = document.getElementById("wpm");
const accuracyDisplay = document.getElementById("accuracy");
const wordsDisplay = document.getElementById("wordsDisplay");
const textInput = document.getElementById("textInput");
const progressChartCtx = document.getElementById("progressChart").getContext("2d");
const carAnimation = document.getElementById("carAnimation");
const correctSound = document.getElementById("correctSound");
const errorSound = document.getElementById("errorSound");
const completeSound = document.getElementById("completeSound");
const resultsModal = document.getElementById("resultsModal");
const finalWPM = document.getElementById("finalWPM");
const finalAccuracy = document.getElementById("finalAccuracy");
const finalWords = document.getElementById("finalWords");
const restartButton = document.getElementById("restartButton");
const customCursor = document.getElementById("customCursor");

/******************** Chart.js Setup ********************/
// Create a Chart.js progress graph. It will update as the test progresses.
let progressChart = new Chart(progressChartCtx, {
    type: 'bar',
    data: {
        labels: ['Progress'],
        datasets: [{
            label: 'Words Completed (%)',
            data: [0],
            backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim(),
            borderColor: '#000',
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                ticks: { stepSize: 10 }
            }
        },
        plugins: {
            legend: { display: false }
        }
    }
});

/******************** Utility Functions ********************/
function getRandomWords(count) {
    let words = [];
    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * WORD_BANK.length);
        words.push(WORD_BANK[randomIndex]);
    }
    return words;
}

function loadTest() {
    // Reset stats
    timeLeft = testDuration;
    currentWordIndex = 0;
    correctCharCount = 0;
    totalCharCount = 0;
    isTestRunning = false;
    textInput.value = "";
    timerDisplay.innerText = `Time: ${timeLeft}s`;
    wpmDisplay.innerText = "WPM: 0";
    accuracyDisplay.innerText = "Accuracy: 100%";
    updateProgressChart(0);
    // Generate new words based on selected word count
    currentTestWords = getRandomWords(selectedWordCount);
    wordsDisplay.innerHTML = "";
    currentTestWords.forEach((word, index) => {
        const span = document.createElement("span");
        span.innerText = word + " ";
        span.id = "word-" + index;
        wordsDisplay.appendChild(span);
    });
    highlightCurrentWord();
}

function highlightCurrentWord() {
    currentTestWords.forEach((_, i) => {
        const span = document.getElementById("word-" + i);
        span.classList.remove("current");
    });
    const currentSpan = document.getElementById("word-" + currentWordIndex);
    if (currentSpan) currentSpan.classList.add("current");
}

function startTimer() {
    if (isTestRunning) return;
    isTestRunning = true;
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = `Time: ${timeLeft}s`;
        if (timeLeft <= 0) {
            endTest();
        }
    }, 1000);
}

function endTest() {
    clearInterval(timerInterval);
    textInput.disabled = true;
    completeSound.currentTime = 0;
    completeSound.play();
    launchCarAnimation();
    launchConfetti();
    // Show results modal after a short delay
    setTimeout(showResults, 1500);
}

function showResults() {
    let elapsed = testDuration - timeLeft;
    let wpm = elapsed > 0 ? Math.round((correctCharCount / 5) / (elapsed / 60)) : 0;
    let accuracy = totalCharCount > 0 ? Math.round((correctCharCount / totalCharCount) * 100) : 100;
    finalWPM.innerText = `WPM: ${wpm}`;
    finalAccuracy.innerText = `Accuracy: ${accuracy}%`;
    finalWords.innerText = `Words Completed: ${currentWordIndex}`;
    resultsModal.style.display = "flex";
}

function updateStats() {
    let elapsed = testDuration - timeLeft;
    let wpm = elapsed > 0 ? Math.round((correctCharCount / 5) / (elapsed / 60)) : 0;
    wpmDisplay.innerText = `WPM: ${wpm}`;
    let accuracy = totalCharCount > 0 ? Math.round((correctCharCount / totalCharCount) * 100) : 100;
    accuracyDisplay.innerText = `Accuracy: ${accuracy}%`;
    let progressPercent = Math.min((currentWordIndex / currentTestWords.length) * 100, 100);
    updateProgressChart(progressPercent);
}

function updateProgressChart(percent) {
    progressChart.data.datasets[0].data[0] = percent;
    progressChart.update();
}

function launchCarAnimation() {
    carAnimation.style.display = "block";
    carAnimation.style.animation = "none";
    void carAnimation.offsetWidth; // reflow to restart animation
    carAnimation.style.animation = "carDrive 2s ease-in-out";
    setTimeout(() => { carAnimation.style.display = "none"; }, 2000);
}

function launchConfetti() {
    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement("div");
        confetti.classList.add("confetti");
        confetti.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
        confetti.style.left = Math.random() * window.innerWidth + "px";
        confetti.style.top = "-20px";
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 2000);
    }
}

/******************** Event Listeners ********************/
// Start button: Read selected word count, hide welcome screen and load test
startButton.addEventListener("click", () => {
    const wordCountRadios = document.getElementsByName("wordCount");
    wordCountRadios.forEach(radio => {
        if (radio.checked) {
            selectedWordCount = parseInt(radio.value);
        }
    });
    welcomeScreen.style.display = "none";
    gameScreen.style.display = "flex";
    textInput.disabled = false;
    loadTest();
    textInput.focus();
});

// Restart test from results modal
restartButton.addEventListener("click", () => {
    resultsModal.style.display = "none";
    textInput.disabled = false;
    loadTest();
    textInput.focus();
});

// Theme toggle button
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light");
});

// Typing input event: Check input word against current word
textInput.addEventListener("input", () => {
    if (!isTestRunning && textInput.value.length === 1) {
        startTimer();
    }
    let inputText = textInput.value.trim();
    let currentWord = currentTestWords[currentWordIndex];
    totalCharCount++;
    if (inputText === currentWord) {
        correctCharCount += currentWord.length;
        textInput.value = "";
        currentWordIndex++;
        highlightCurrentWord();
        // Optionally play correct sound:
        // correctSound.currentTime = 0;
        // correctSound.play();
        if (currentWordIndex >= currentTestWords.length) {
            endTest();
        }
    } else if (!currentWord.startsWith(inputText)) {
        errorSound.currentTime = 0;
        errorSound.play();
    }
    updateStats();
});

/******************** Custom Cursor Animation ********************/
document.addEventListener("mousemove", (e) => {
    customCursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
});

/******************** Initialization ********************/
// Start with welcome screen visible. The test loads upon clicking Start.
loadTest();
