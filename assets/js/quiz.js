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
        questions = await response.json();
        renderQuestion();
    } catch (error) {
        console.error("Could not fetch questions:", error);
        questionElement.textContent = "Error loading questions. Please try again later.";
    }
}

function renderQuestion() {
    if (questions.length === 0) return;

    const question = questions[currentQuestionIndex];
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
    
    // Store results in localStorage (as we can't use React Router for navigation)
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