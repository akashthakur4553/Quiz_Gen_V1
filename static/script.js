document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const videoUrlInput = document.getElementById('video-url');
    const quizContainer = document.getElementById('quiz-container');
    const questionsContainer = document.getElementById('questions-container');
    const submitQuizBtn = document.getElementById('submit-quiz');
    const resultsContainer = document.getElementById('results-container');
    const scoreDisplay = document.getElementById('score-display');
    const loadingIndicator = document.getElementById('loading-indicator');

    let quizData = [];

    generateBtn.addEventListener('click', async () => {
        const videoUrl = videoUrlInput.value.trim();
        if (!videoUrl) {
            showAlert('Please enter a valid YouTube URL', 'error');
            return;
        }

        try {
            showLoading(true);
            const response = await fetch('/generate_quiz', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ video_url: videoUrl }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate quiz');
            }

            quizData = await response.json();
            if (quizData.length === 0) {
                throw new Error('No questions were generated. The video might be too short or lack sufficient content.');
            }

            renderQuiz(quizData);
            quizContainer.classList.remove('hidden');
            showAlert('Quiz generated successfully!', 'success');
        } catch (error) {
            console.error('Error:', error);
            showAlert(`An error occurred while generating the quiz: ${error.message}`, 'error');
        } finally {
            showLoading(false);
        }
    });

    function renderQuiz(questions) {
        questionsContainer.innerHTML = '';
        questions.forEach((question, index) => {
            const questionCard = document.createElement('div');
            questionCard.classList.add('question-card', 'mb-4', 'p-4', 'bg-white', 'rounded', 'shadow');

            const questionText = document.createElement('p');
            questionText.classList.add('question-text', 'font-bold', 'mb-2');
            questionText.textContent = `${index + 1}. ${question[0]}`;

            const options = document.createElement('div');
            options.classList.add('options');

            const shuffledOptions = shuffleArray([...question.slice(1)]);

            shuffledOptions.forEach((option, optionIndex) => {
                const label = document.createElement('label');
                label.classList.add('block', 'mb-2');
                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = `question-${index}`;
                radio.value = option;
                radio.id = `q${index}-option${optionIndex}`;
                radio.classList.add('mr-2');

                label.appendChild(radio);
                label.appendChild(document.createTextNode(option));
                options.appendChild(label);
            });

            questionCard.appendChild(questionText);
            questionCard.appendChild(options);
            questionsContainer.appendChild(questionCard);
        });

        submitQuizBtn.classList.remove('hidden');
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
        let unansweredQuestions = 0;

        quizData.forEach((question, index) => {
            const selectedOption = document.querySelector(`input[name="question-${index}"]:checked`);
            const questionCard = document.querySelectorAll('.question-card')[index];
            
            if (selectedOption) {
                if (selectedOption.value === question[1]) {
                    score++;
                    questionCard.classList.add('bg-green-100');
                } else {
                    questionCard.classList.add('bg-red-100');
                }
            } else {
                unansweredQuestions++;
                questionCard.classList.add('bg-yellow-100');
            }

            // Disable radio buttons after submission
            document.querySelectorAll(`input[name="question-${index}"]`).forEach(radio => {
                radio.disabled = true;
            });
        });

        const totalQuestions = quizData.length;
        const answeredQuestions = totalQuestions - unansweredQuestions;

        let resultMessage = `Your score: ${score} out of ${totalQuestions}<br>`;
        resultMessage += `Questions answered: ${answeredQuestions} out of ${totalQuestions}<br>`;
        if (unansweredQuestions > 0) {
            resultMessage += `Unanswered questions: ${unansweredQuestions}`;
        }

        scoreDisplay.innerHTML = resultMessage;
        resultsContainer.classList.remove('hidden');
        submitQuizBtn.classList.add('hidden');

        // Scroll to results
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    });

    function showAlert(message, type) {
        const alertElement = document.createElement('div');
        alertElement.textContent = message;
        alertElement.classList.add('p-4', 'rounded', 'mb-4', 'text-center');
        
        if (type === 'error') {
            alertElement.classList.add('bg-red-100', 'text-red-700');
        } else if (type === 'success') {
            alertElement.classList.add('bg-green-100', 'text-green-700');
        }

        // Insert the alert at the top of the page
        document.body.insertBefore(alertElement, document.body.firstChild);

        // Remove the alert after 5 seconds
        setTimeout(() => {
            alertElement.remove();
        }, 5000);
    }

    function showLoading(isLoading) {
        if (isLoading) {
            loadingIndicator.classList.remove('hidden');
            generateBtn.disabled = true;
            generateBtn.textContent = 'Generating...';
        } else {
            loadingIndicator.classList.add('hidden');
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate Quiz';
        }
    }
});
