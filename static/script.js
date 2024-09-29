document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const videoUrlInput = document.getElementById('video-url');
    const quizContainer = document.getElementById('quiz-container');
    const questionsContainer = document.getElementById('questions-container');
    const submitQuizBtn = document.getElementById('submit-quiz');
    const resultsContainer = document.getElementById('results-container');
    const scoreDisplay = document.getElementById('score-display');

    let quizData = [];

    generateBtn.addEventListener('click', async () => {
        const videoUrl = videoUrlInput.value.trim();
        if (!videoUrl) {
            alert('Please enter a valid YouTube URL');
            return;
        }

        try {
            const response = await fetch('/generate_quiz', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ video_url: videoUrl }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate quiz');
            }

            quizData = await response.json();
            renderQuiz(quizData);
            quizContainer.classList.remove('hidden');
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while generating the quiz. Please try again.');
        }
    });

    function renderQuiz(questions) {
        questionsContainer.innerHTML = '';
        questions.forEach((question, index) => {
            const questionCard = document.createElement('div');
            questionCard.classList.add('question-card');

            const questionText = document.createElement('p');
            questionText.classList.add('question-text');
            questionText.textContent = `${index + 1}. ${question[0]}`;

            const options = document.createElement('div');
            options.classList.add('options');

            const shuffledOptions = shuffleArray([...question.slice(1)]);

            shuffledOptions.forEach((option, optionIndex) => {
                const label = document.createElement('label');
                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = `question-${index}`;
                radio.value = option;
                radio.id = `q${index}-option${optionIndex}`;

                label.appendChild(radio);
                label.appendChild(document.createTextNode(` ${option}`));
                options.appendChild(label);
            });

            questionCard.appendChild(questionText);
            questionCard.appendChild(options);
            questionsContainer.appendChild(questionCard);
        });
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    submitQuizBtn.addEventListener('click', () => {
        let score = 0;
        quizData.forEach((question, index) => {
            const selectedOption = document.querySelector(`input[name="question-${index}"]:checked`);
            if (selectedOption && selectedOption.value === question[1]) {
                score++;
            }
        });

        scoreDisplay.textContent = `Your score: ${score} out of ${quizData.length}`;
        resultsContainer.classList.remove('hidden');
    });
});
