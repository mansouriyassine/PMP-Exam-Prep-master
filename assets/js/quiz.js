// Quiz state
let questions = [];
let currentQuestionIndex = 0;
let selectedAnswers = [];
let isAnswered = false;

// DOM elements
const quizContainer = document.getElementById('quiz-container');
const questionElement = document.getElementById('question');
const choicesElement = document.getElementById('choices');
const nextButton = document.getElementById('next-btn');

// Fetch questions from JSON file
async function fetchQuestions() {
    try {
        const groupNumber = new URLSearchParams(window.location.search).get('group') || '1';
        const response = await fetch(`questions/group${groupNumber}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('Invalid or empty question data');
        }
        questions = data;
        renderQuestion();
    } catch (error) {
        console.error("Could not fetch questions:", error);
        displayError("Error loading questions. Please try again later.");
    }
}

function displayError(message) {
    questionElement.textContent = message;
    choicesElement.innerHTML = '';
    nextButton.style.display = 'none';
}

function renderQuestion() {
    if (!Array.isArray(questions) || questions.length === 0) {
        displayError("No questions available.");
        return;
    }

    const question = questions[currentQuestionIndex];
    if (!question || typeof question.question !== 'string' || !Array.isArray(question.choices)) {
        displayError("Invalid question format.");
        return;
    }

    questionElement.textContent = `Question ${currentQuestionIndex + 1}: ${question.question}`;
    choicesElement.innerHTML = '';
    question.choices.forEach((choice, index) => {
        const button = document.createElement('button');
        button.textContent = choice;
        button.classList.add('choice-btn');
        button.addEventListener('click', () => handleAnswerClick(choice));
        if (isAnswered && selectedAnswers[currentQuestionIndex] === choice) {
            button.style.backgroundColor = 'gray';
        }
        if (isAnswered) {
            button.disabled = true;
        }
        choicesElement.appendChild(button);
    });

    nextButton.style.display = isAnswered ? 'block' : 'none';
}

function handleAnswerClick(answer) {
    if (!isAnswered) {
        selectedAnswers[currentQuestionIndex] = answer;
        isAnswered = true;
        renderQuestion();
    }
}

function handleNextClick() {
    isAnswered = false;
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
    } else {
        finishQuiz();
    }
}

function finishQuiz() {
    // Calculate score
    const score = calculateScore();
    
    // Store results in localStorage
    localStorage.setItem('quizResults', JSON.stringify({
        selectedAnswers,
        questions,
        score
    }));

    // Redirect to results page
    window.location.href = 'results.html';
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

// Event listeners
nextButton.addEventListener('click', handleNextClick);

// Initialize quiz
fetchQuestions();