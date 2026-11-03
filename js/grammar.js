
// ==========================================
// HINDISPEAK - GRAMMAR PRACTICE
// ==========================================

let grammarData = [];
let currentTopic = null;
let currentQuestionIndex = 0;
let currentScore = 0;
let selectedAnswer = "";
let answerChecked = false;

const STORAGE_KEY = "hindiSpeakGrammarProgress";


// ==========================================
// 1. LOAD GRAMMAR JSON
// ==========================================

document.addEventListener("DOMContentLoaded", loadGrammar);

// async function loadGrammar() {

//     try {

//         const response = await fetch("../data/grammar/basics.json");

//         if (!response.ok) {
//             throw new Error("Unable to load grammar data");
//         }

//         const data = await response.json();

//         grammarData = data.topics;

//         displayTopics();
//         updateProgress();

//     } catch (error) {

//         console.error(error);

//         document.getElementById("topicContainer").innerHTML =
//             `<div class="alert alert-danger">
//                 Unable to load grammar lessons.
//                 Please check the JSON file path.
//             </div>`;
//     }
// }


// ==========================================
// 2. GET SAVED PROGRESS
// ==========================================

async function loadGrammar() {

    const container = document.getElementById("topicContainer");

    try {

        console.log("Fetching:", "../data/grammar/grammar-level-1.json");

        const response = await fetch("../data/grammar/grammar-level-1.json");

        console.log("HTTP Status:", response.status);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        console.log("Complete JSON:", data);

        if (!Array.isArray(data.topics)) {
            throw new Error("JSON must contain a topics array.");
        }

        grammarData = data.topics;

        console.log("Topics loaded:", grammarData.length);

        displayTopics();
        updateProgress();

    }
    catch (error) {

        console.error("Grammar Error:", error);

        container.innerHTML = `
            <div class="alert alert-danger">
                ${error.message}
            </div>
        `;
    }
}
function getProgress() {

    return JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "{}"
    );

}


// ==========================================
// 3. DISPLAY TOPIC CARDS
// ==========================================

function displayTopics() {

    const container = document.getElementById("topicContainer");

    const progress = getProgress();

    container.innerHTML = "";

    grammarData.forEach(topic => {

        const completed = progress[topic.id];

        const card = document.createElement("div");

        card.className = "col-md-6 col-lg-4";

        card.innerHTML = `
            <div class="topic-card"
                 onclick="openTopic('${topic.id}')">

                <div class="topic-icon">
                    <i data-lucide="${topic.icon}"></i>
                </div>

                <h5>${topic.title}</h5>

                <p>${topic.description}</p>

                <div class="d-flex justify-content-between">
                    <span class="topic-status">
                        ${completed ? "✓ Completed" : "Start Learning"}
                    </span>

                    <small class="text-secondary">
                        ${topic.level}
                    </small>
                </div>

            </div>
        `;
        // Crucial: Tell Lucide to convert the new <i> tag into an actual SVG icon
        lucide.createIcons();

        container.appendChild(card);

    });

}


// ==========================================
// 4. OPEN SELECTED TOPIC
// ==========================================

function openTopic(topicId) {

    currentTopic = grammarData.find(
        topic => topic.id === topicId
    );

    if (!currentTopic) return;

    document.getElementById("grammarDashboard")
        .classList.add("d-none");

    document.getElementById("practiceSection")
        .classList.add("d-none");

    document.getElementById("resultSection")
        .classList.add("d-none");

    document.getElementById("lessonSection")
        .classList.remove("d-none");

    renderLesson();

}


// ==========================================
// 5. RENDER LESSON
// ==========================================

function renderLesson() {

    const lesson = currentTopic.lesson;

    let html = `
        <div class="lesson-card">

            <span class="badge bg-primary">
                ${currentTopic.level}
            </span>

            <h2 class="mt-3">${currentTopic.title}</h2>

            <p class="mt-3">${lesson.introduction}</p>

        </div>
    `;


    // Display lesson points

    lesson.points.forEach(point => {

        html += `
            <div class="lesson-card">

                <h4>${point.title}</h4>

                <p>${point.description}</p>
        `;

        point.examples.forEach(example => {

            html += `
                <div class="lesson-example">

                    <div class="hindi-text">
                        ${example.hindi}
                    </div>

                    <div class="roman-text">
                        ${example.roman}
                    </div>

                    <div class="english-text">
                        ${example.english}
                    </div>

                </div>
            `;

        });

        html += `</div>`;

    });


    // Display vocabulary / grammar table

    if (lesson.table && lesson.table.length > 0) {

        html += `
            <div class="lesson-card">

                <h4>Quick Reference</h4>

                <div class="table-responsive">

                    <table class="table table-bordered mt-3">

                        <thead>
                            <tr>
                                <th>English</th>
                                <th>Hindi</th>
                                <th>Roman Hindi</th>
                            </tr>
                        </thead>

                        <tbody>
        `;

        lesson.table.forEach(row => {

            html += `
                <tr>
                    <td>${row.english}</td>
                    <td>${row.hindi}</td>
                    <td>${row.roman}</td>
                </tr>
            `;

        });

        html += `
                        </tbody>

                    </table>

                </div>

            </div>
        `;

    }

    document.getElementById("lessonContent").innerHTML = html;

}


// ==========================================
// 6. START PRACTICE
// ==========================================

function startPractice() {

    currentQuestionIndex = 0;
    currentScore = 0;
    selectedAnswer = "";
    answerChecked = false;

    document.getElementById("lessonSection")
        .classList.add("d-none");

    document.getElementById("resultSection")
        .classList.add("d-none");

    document.getElementById("practiceSection")
        .classList.remove("d-none");

    displayQuestion();

}


// ==========================================
// 7. DISPLAY QUESTION
// ==========================================

function displayQuestion() {

    const question = currentTopic.questions[currentQuestionIndex];

    const total = currentTopic.questions.length;

    selectedAnswer = "";
    answerChecked = false;

    document.getElementById("questionNumber").textContent =
        `Question ${currentQuestionIndex + 1} of ${total}`;

    document.getElementById("questionScore").textContent =
        `Score: ${currentScore}`;

    document.getElementById("questionProgress").style.width =
        `${(currentQuestionIndex / total) * 100}%`;

    document.getElementById("questionText").textContent =
        question.question;

    document.getElementById("questionType").textContent =
        question.type === "mcq" ? "MULTIPLE CHOICE" : "FILL IN THE BLANK";

    document.getElementById("feedback").innerHTML = "";

    document.getElementById("checkButton").classList.remove("d-none");

    document.getElementById("nextButton").classList.add("d-none");


    const container = document.getElementById("answerContainer");

    container.innerHTML = "";


    // MCQ QUESTION

    if (question.type === "mcq") {

        question.options.forEach(option => {

            const button = document.createElement("button");

            button.type = "button";
            button.className = "answer-option";
            button.textContent = option;

            button.onclick = () => selectOption(option, button);

            container.appendChild(button);

        });

    }


    // FILL IN THE BLANK QUESTION

    else if (question.type === "fill") {

        container.innerHTML = `
            <input type="text"
                   id="fillAnswer"
                   class="answer-input"
                   placeholder="Type your answer in Roman Hindi..."
                   autocomplete="off">
        `;

        document.getElementById("fillAnswer")
            .addEventListener("input", function () {

                selectedAnswer = this.value.trim();

            });

    }

}


// ==========================================
// 8. SELECT MCQ OPTION
// ==========================================

function selectOption(option, button) {

    if (answerChecked) return;

    selectedAnswer = option;

    document.querySelectorAll(".answer-option")
        .forEach(btn => btn.classList.remove("selected"));

    button.classList.add("selected");

}


// ==========================================
// 9. CHECK ANSWER
// ==========================================

function checkAnswer() {

    if (answerChecked) return;

    if (!selectedAnswer.trim()) {

        alert("Please enter or select an answer.");

        return;
    }

    const question = currentTopic.questions[currentQuestionIndex];

    const acceptedAnswers = Array.isArray(question.answer)
        ? question.answer
        : [question.answer];

    const normalize = value =>
        String(value).trim().toLowerCase();

    const isCorrect = acceptedAnswers.some(
        answer => normalize(answer) === normalize(selectedAnswer)
    );

    answerChecked = true;

    if (isCorrect) {
        currentScore++;
    }


    // Disable all options after checking

    document.querySelectorAll(".answer-option")
        .forEach(button => {

            button.disabled = true;

            if (
                acceptedAnswers.some(
                    answer => normalize(answer) === normalize(button.textContent)
                )
            ) {
                button.classList.add("correct");
            }

            else if (
                normalize(button.textContent) === normalize(selectedAnswer)
            ) {
                button.classList.add("wrong");
            }

        });


    // Feedback message

    const feedback = document.getElementById("feedback");

    if (isCorrect) {

        feedback.innerHTML = `
            <div class="feedback-correct">
                ✓ Correct Answer!
                <p class="mb-0 mt-2">${question.explanation}</p>
            </div>
        `;

    } else {

        feedback.innerHTML = `
            <div class="feedback-wrong">
                ✗ Incorrect Answer.

                <p class="mb-1 mt-2">
                    Correct answer: <strong>${acceptedAnswers.join(" / ")}</strong>
                </p>

                <p class="mb-0">${question.explanation}</p>
            </div>
        `;

    }


    document.getElementById("questionScore").textContent =
        `Score: ${currentScore}`;

    document.getElementById("checkButton").classList.add("d-none");

    document.getElementById("nextButton").classList.remove("d-none");

    if (currentQuestionIndex === currentTopic.questions.length - 1) {

        document.getElementById("nextButton").textContent =
            "View Results →";

    }

}


// ==========================================
// 10. NEXT QUESTION
// ==========================================

function nextQuestion() {

    currentQuestionIndex++;

    if (currentQuestionIndex < currentTopic.questions.length) {

        displayQuestion();

    } else {

        showResult();

    }

}


// ==========================================
// 11. SHOW FINAL RESULT
// ==========================================

function showResult() {

    const total = currentTopic.questions.length;

    document.getElementById("practiceSection")
        .classList.add("d-none");

    document.getElementById("resultSection")
        .classList.remove("d-none");

    document.getElementById("finalScore").textContent =
        `${currentScore}/${total}`;

    const percentage = Math.round((currentScore / total) * 100);

    let message = "";

    if (percentage === 100) {
        message = "Excellent! You answered every question correctly.";
    } else if (percentage >= 70) {
        message = "Great work! You understand this topic well.";
    } else if (percentage >= 40) {
        message = "Good attempt! Review the lesson and practice again.";
    } else {
        message = "Keep learning! Try revising the lesson once more.";
    }

    document.getElementById("resultMessage").textContent = message;


    // Save progress

    const progress = getProgress();

    const previous = progress[currentTopic.id] || {
        bestScore: 0,
        attempts: 0
    };

    progress[currentTopic.id] = {
        bestScore: Math.max(
            previous.bestScore,
            percentage
        ),
        attempts: previous.attempts + 1,
        completed: true
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));

    updateProgress();

}


// ==========================================
// 12. UPDATE DASHBOARD PROGRESS
// ==========================================

function updateProgress() {

    const progress = getProgress();

    const completed = grammarData.filter(
        topic => progress[topic.id]?.completed
    ).length;

    const total = grammarData.length;

    const percentage = total
        ? Math.round((completed / total) * 100)
        : 0;

    document.getElementById("progressText").textContent =
        `${percentage}%`;

    document.getElementById("progressBar").style.width =
        `${percentage}%`;

}


// ==========================================
// 13. NAVIGATION
// ==========================================

function showDashboard() {

    document.getElementById("lessonSection")
        .classList.add("d-none");

    document.getElementById("practiceSection")
        .classList.add("d-none");

    document.getElementById("resultSection")
        .classList.add("d-none");

    document.getElementById("grammarDashboard")
        .classList.remove("d-none");

    displayTopics();
    updateProgress();

}


function showLesson() {

    document.getElementById("practiceSection")
        .classList.add("d-none");

    document.getElementById("lessonSection")
        .classList.remove("d-none");

}
