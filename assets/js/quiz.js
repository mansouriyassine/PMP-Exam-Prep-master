import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

const Quiz = ({ questions, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const history = useHistory();

  const handleAnswerClick = (answer) => {
    if (!isAnswered) {
      const newSelectedAnswers = [...selectedAnswers, answer];
      setSelectedAnswers(newSelectedAnswers);
      setIsAnswered(true);
    }
  };

  const handleNextClick = () => {
    setIsAnswered(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      onComplete(selectedAnswers);
      history.push('/results', { selectedAnswers, questions });
    }
  };

  return (
    <div>
      <h2>Question {currentQuestionIndex + 1}</h2>
      <p>{questions[currentQuestionIndex].question}</p>
      <div>
        {questions[currentQuestionIndex].choices.map((choice, index) => (
          <button
            key={index}
            onClick={() => handleAnswerClick(choice)}
            style={{
              backgroundColor: isAnswered && selectedAnswers[currentQuestionIndex] === choice ? 'gray' : '',
              pointerEvents: isAnswered ? 'none' : 'auto',
            }}
          >
            {choice}
          </button>
        ))}
      </div>
      {isAnswered && (
        <button onClick={handleNextClick}>Next</button>
      )}
    </div>
  );
};

export default Quiz;
