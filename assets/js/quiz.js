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
        questions = parseQuestions(data);
        if (questions.length === 0) {
            throw new Error('No valid questions found in the data');
        }
        renderQuestion();
    } catch (error) {
        console.error("Could not fetch or parse questions:", error);
        displayError(`Error: ${error.message}. Please check the console for more details.`);
    }
}

function parseQuestions(data) {
    return data.map(q => ({
        question: q.question,
        choices: [q.choice1, q.choice2, q.choice3, q.choice4],
        correctAnswer: q.answer - 1 // Convert 1-based to 0-based index
    })).filter(q => isValidQuestion(q));
}

function isValidQuestion(q) {
    return q && 
           typeof q.question === 'string' && 
           Array.isArray(q.choices) && 
           q.choices.length === 4 &&
           typeof q.correctAnswer === 'number' &&
           q.correctAnswer >= 0 && 
           q.correctAnswer < 4;
}

function displayError(message) {
    console.error(message);
    questionElement.textContent = message;
    choicesElement.innerHTML = '';
    nextButton.style.display = 'none';
}

function renderQuestion() {
    if (questions.length === 0 || currentQuestionIndex >= questions.length) {
        displayError("No more questions available.");
        return;
    }

    const question = questions[currentQuestionIndex];
    questionElement.textContent = `Question ${currentQuestionIndex + 1}: ${question.question}`;
    choicesElement.innerHTML = '';
    question.choices.forEach((choice, index) => {
        const button = document.createElement('button');
        button.textContent = choice;
        button.classList.add('choice-btn');
        button.addEventListener('click', () => handleAnswerClick(index));
        if (isAnswered && selectedAnswers[currentQuestionIndex] === index) {
            button.style.backgroundColor = 'gray';
        }
        if (isAnswered) {
            button.disabled = true;
        }
        choicesElement.appendChild(button);
    });

    nextButton.style.display = isAnswered ? 'block' : 'none';
}

function handleAnswerClick(answerIndex) {
    if (!isAnswered) {
        selectedAnswers[currentQuestionIndex] = answerIndex;
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
    const score = calculateScore();
    localStorage.setItem('quizResults', JSON.stringify({
        selectedAnswers,
        questions,
        score
    }));
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