// Quiz state
let questions = [];
let currentQuestionIndex = 0;
let selectedAnswers = [];
let timer;
let timeLeft = 600; // 10 minutes in seconds

// DOM elements
const quizContainer = document.getElementById('quiz-container');
const questionProgress = document.getElementById('question-progress');
const timerElement = document.getElementById('timer');
const progressBar = document.getElementById('progress-bar');
const questionElement = document.getElementById('question');
const choicesElement = document.getElementById('choices');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

// Get the group number from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const groupNumber = urlParams.get('group') || '1'; // Default to group 1 if not specified

// Fetch questions from JSON file
async function fetchQuestions() {
    try {
        const response = await fetch(`questions/group${groupNumber}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        questions = await response.json();
        renderQuestion();
        startTimer();
    } catch (error) {
        console.error("Could not fetch questions:", error);
        questionElement.textContent = "Error loading questions. Please try again later.";
    }
}

function renderQuestion() {
    if (questions.length === 0) return;

    const question = questions[currentQuestionIndex];
    questionProgress.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
    questionElement.textContent = question.question;
    choicesElement.innerHTML = '';
    question.choices.forEach((choice, index) => {
        const button = document.createElement('button');
        button.textContent = choice;
        button.classList.add('w-full', 'p-4', 'text-left', 'border', 'rounded', 'mb-2', 'hover:bg-gray-100');
        if (selectedAnswers[currentQuestionIndex] === choice) {
            button.classList.add('bg-blue-100');
        }
        button.addEventListener('click', () => selectAnswer(choice));
        choicesElement.appendChild(button);
    });
    updateNavButtons();
    updateProgressBar();
}

function selectAnswer(answer) {
    selectedAnswers[currentQuestionIndex] = answer;
    renderQuestion();
}

function updateNavButtons() {
    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.textContent = currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next';
}

function updateProgressBar() {
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    progressBar.style.width = `${progress}%`;
}

function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
    } else {
        finishQuiz();
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion();
    }
}

function finishQuiz() {
    clearInterval(timer);
    // Calculate score and redirect to results page
    const score = calculateScore();
    window.location.href = `results.html?score=${score}&group=${groupNumber}`;
}

function calculateScore() {
    let correctAnswers = 0;
    questions.forEach((question, index) => {
        if (selectedAnswers[index] === question.correctAnswer) {
            correctAnswers++;
        }
    });
    return (correctAnswers / questions.length) * 100;
}

function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    if (timeLeft === 0) {
        finishQuiz();
    } else {
        timeLeft--;
    }
}

function startTimer() {
    timer = setInterval(updateTimer, 1000);
}

// Event listeners
nextBtn.addEventListener('click', nextQuestion);
prevBtn.addEventListener('click', previousQuestion);

// Initialize quiz
fetchQuestions();