function getUrlParameter(name) {
  name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
  let regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  let results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function displayResults() {
  const score = parseInt(getUrlParameter('score'));
  const total = parseInt(getUrlParameter('total'));
  const timeTaken = parseInt(getUrlParameter('time'));
  const userAnswers = JSON.parse(getUrlParameter('answers'));
  const group = getUrlParameter('group');

  const resultsSummary = document.getElementById('results-summary');
  resultsSummary.innerHTML = `
      <p class="text-xl mb-2">Your score: ${score} out of ${total}</p>
      <p class="text-lg mb-4">Time taken: ${Math.floor(timeTaken / 60)}:${(timeTaken % 60).toString().padStart(2, '0')}</p>
  `;

  fetchQuestions(group).then(questions => {
      const questionReview = document.getElementById('question-review');
      questionReview.innerHTML = ''; // Clear previous content
      if (questions.length === 0) {
          questionReview.innerHTML = '<p>No questions available to display.</p>';
          return;
      }

      questions.forEach((question, index) => {
          const userAnswer = userAnswers[index];
          const isCorrect = parseInt(userAnswer) === question.answer; // Ensure comparing integers
          const reviewHtml = `
              <div class="mb-6 p-4 border rounded ${isCorrect ? 'bg-green-100' : 'bg-red-100'}">
                  <p class="font-bold mb-2">${index + 1}. ${question.question}</p>
                  <ul class="list-disc pl-5">
                      ${Object.keys(question).filter(key => key.startsWith('choice')).map((key, i) => `
                          <li class="${i + 1 === question.answer ? 'text-green-700 font-bold' : ''} ${i + 1 === parseInt(userAnswer) && !isCorrect ? 'text-red-700 line-through' : ''}">
                              ${question[key]}
                              ${i + 1 === question.answer ? ' (Correct Answer)' : ''}
                              ${i + 1 === parseInt(userAnswer) && !isCorrect ? ' (Your Answer)' : ''}
                          </li>
                      `).join('')}
                  </ul>
                  ${!isCorrect ? `<p class="mt-2 text-red-700">Your answer was incorrect. The correct answer is: ${question['choice' + question.answer]}</p>` : ''}
              </div>
          `;
          questionReview.innerHTML += reviewHtml;
      });
  });
}

function fetchQuestions(group) {
  return fetch(`questions/group${group}.json`)
      .then(response => {
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
      })
      .catch(error => {
          console.error('Error fetching questions:', error);
          document.getElementById('question-review').innerHTML = `<p>Error loading questions: ${error.message}. Please try again.</p>`;
          return [];
      });
}

function retakeQuiz() {
  const group = getUrlParameter('group') || '1';
  sessionStorage.removeItem('quizQuestions');
  window.location.href = `quiz.html?group=${group}`;
}

function chooseAnotherGroup() {
  sessionStorage.removeItem('quizQuestions');
  window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
  displayResults();
  document.getElementById('retake-btn').addEventListener('click', retakeQuiz);
  document.getElementById('choose-group-btn').addEventListener('click', chooseAnotherGroup);
});