//https://opentdb.com/api.php

(function() {
    let QUESTIONS = [];
    let currentQuestionIdx = 0;
    const MAXQUESTIONS = 5;
    const TIMER = 30;
    let selections = [];
    let score = 0;
    let timer = TIMER;
    const API_URL = `https://opentdb.com/api.php?amount=${MAXQUESTIONS}&type=multiple`;

    const nextButton = document.querySelector("#next-button");
    const newGameButton = document.querySelector("#new-game");

    fetch(API_URL).then(response => response.json()).then(data => { 
        QUESTIONS = data.results;
        loadQuestion();
    })
    .catch(error => {
        console.error('There has been a problem with the fetch operation:', error);
        const noAnswerElement = document.querySelector('#no-answer');
        noAnswerElement.setAttribute("style", "");
        noAnswerElement.innerHTML = "Please verify your internet connection and try again!";
    });

    let x = setInterval(function() {
        timer -= 1;
        if (timer < 0) {
            timer = TIMER;
            selections.push("");
            currentQuestionIdx += 1;
            loadQuestion(currentQuestionIdx);
        }
        var minutes = Math.floor(timer/60);
        var seconds = timer % 60;
        
        var minutesText = minutes >= 10 ? `${minutes}` : `0${minutes}`;
        var secondsText = seconds >= 10 ? `${seconds}` : `0${seconds}`;
    
        document.querySelector('.countdown').innerHTML = minutesText + ":" + secondsText;
    }, 1000);

    const nextClick = () => {
        const selectedAnswer = document.querySelector(`input[name="answer-question-${currentQuestionIdx}"]:checked`);
        const noAnswerElement = document.querySelector('#no-answer');
        if(!selectedAnswer) {
            noAnswerElement.setAttribute("style", "");
            return;
        }
        noAnswerElement.setAttribute("style", "display:none;");
        selections.push(selectedAnswer.value);
        currentQuestionIdx += 1;
        loadQuestion(currentQuestionIdx);
    }

    const loadQuestion = (idx = 0) => {
        if (MAXQUESTIONS == currentQuestionIdx + 1) {
            nextButton.innerHTML = "Submit";
        }

        if(MAXQUESTIONS == currentQuestionIdx) {
            handleLastQuestion();
            return;
        }
        timer = TIMER;
        const questionElement = document.querySelector("#question");
        const questionNumberElement = document.querySelector("#question-number");
        questionElement.innerHTML = QUESTIONS[idx].question;
        questionNumberElement.innerHTML = `${currentQuestionIdx +1} / ${MAXQUESTIONS}`;

        let answersToSelect = QUESTIONS[idx].incorrect_answers.concat([QUESTIONS[idx].correct_answer]);
        answersToSelect = answersToSelect.sort((_a, _b) => 0.5 - Math.random());

        const answerContainer = document.querySelector("#answer-container");
        answerContainer.innerHTML = "";

        answersToSelect.forEach(answer => createAnswerElement(answerContainer, answer));        
    }

    const handleLastQuestion = () => {
        clearInterval(x);
        const mainframeElement = document.querySelector("#mainframe");
        mainframeElement.setAttribute("style", "display: none;");

        const resultsElement = document.querySelector(".results");
        resultsElement.setAttribute("style", "");
        
        const resultContentElement = document.querySelector(".result-content");
        resultContentElement.innerHTML = "";
        loadResults(resultContentElement);
    }
    
    const createAnswerElement = (answerContainer, answer, additionalClass='', disableInput = false) => {
        const answerSpanElement = document.createElement("span");
        const answerInput = document.createElement("input");
        const answerLabel = document.createElement("label");

        answerSpanElement.setAttribute("class", "checkmark");

        answerLabel.setAttribute("for", answer);
        answerLabel.setAttribute("class", `answer-select ${additionalClass}`);
        answerLabel.innerHTML = answer;

        answerInput.setAttribute("type", "radio");
        answerInput.setAttribute("id", answer);
        answerInput.setAttribute("value", answer);
        answerInput.setAttribute("name", `answer-question-${currentQuestionIdx}`);
        answerInput.addEventListener('change', () => verifyIfAnswerIsChecked());
        if(disableInput) answerInput.setAttribute("disabled", "");

        answerLabel.append(answerInput);
        answerLabel.append(answerSpanElement);

        answerContainer.append(answerLabel);
    }

    const verifyIfAnswerIsChecked = () => {
        const selectedAnswer = document.querySelector(`input[name="answer-question-${currentQuestionIdx}"]:checked`);
        const noAnswerElement = document.querySelector('#no-answer');
        if(selectedAnswer) {
            noAnswerElement.setAttribute("style", "display:none;");
        }
        
    }

    nextButton.addEventListener('click', () => nextClick());
    newGameButton.addEventListener('click', () => window.location.reload());

    const loadResults = (container) => {
        for(let idx = 0;idx < QUESTIONS.length; idx++) {
            createResultElement(container, idx);
        }
        const scoreElement = document.querySelector(".score");
        scoreElement.innerHTML = `You have scored ${score} out of ${MAXQUESTIONS}!`;
    }

    const createResultElement = (container, idx) => {
        const resultElement = document.createElement("div");
        const resultQuestionElement = document.createElement("p");

        resultQuestionElement.innerHTML = `${idx+1}) ${QUESTIONS[idx].question}`;

        resultElement.setAttribute("class", `question-${idx}`);
        resultElement.append(resultQuestionElement);

        let answers = QUESTIONS[idx].incorrect_answers.concat([QUESTIONS[idx].correct_answer]);
        answers = answers.sort((_a, _b) => 0.5 - Math.random());

        answers.forEach(answer => {
            let additionalClass = '';
            if(selections[idx] == answer) additionalClass = 'wrong';
            if(answer == QUESTIONS[idx].correct_answer) additionalClass = 'right';
            
            createAnswerElement(resultElement, answer, additionalClass, true);
        });

        container.append(resultElement);

        if(QUESTIONS[idx].correct_answer == selections[idx]) score += 1;
    }

})();