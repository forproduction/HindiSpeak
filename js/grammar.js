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

        if (container) {
            container.innerHTML = `
                <div class="alert alert-danger">
                    ${error.message}
                </div>
            `;
        }
    }
}


// ==========================================
// 2. GET SAVED PROGRESS
// ==========================================

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
    if (!container) return;

    const progress = getProgress();

    container.innerHTML = "";

    grammarData.forEach(topic => {

        const completed = progress[topic.id];

        // Map topic icons to robust Bootstrap Icons so they never fail to show
        let iconClass = "bi-journal-text";
        if (topic.id === "sentence-structure") iconClass = "bi-diagram-3";
        if (topic.id === "pronouns") iconClass = "bi-person-badge";
        if (topic.id === "verbs") iconClass = "bi-lightning-charge";

        const card = document.createElement("div");
        card.className = "col-md-6 col-lg-4";

        card.innerHTML = `
        <div class="module-card h-100 p-4 rounded-4 bg-white shadow-sm border transition-all position-relative overflow-hidden d-flex flex-column justify-content-between">
            
            <div class="d-flex align-items-center justify-content-between mb-3">
                <div class="card-icon-wrapper text-primary bg-primary-subtle rounded-3 d-inline-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
                    <i class="bi ${iconClass} fs-4"></i>
                </div>
                <span class="badge ${completed ? 'bg-success-subtle text-success' : 'bg-light text-secondary'} rounded-pill px-3 py-1.5 fw-semibold border">
                    ${completed ? "✓ Completed" : topic.level}
                </span>
            </div>

            <div>
                <h4 class="fw-bold mb-2 text-dark fs-5">${topic.title}</h4>
                <p class="text-secondary mb-4 small lh-base">${topic.description}</p>
            </div>

            <a href="javascript:void(0)"
               onclick="openTopic('${topic.id}')"
               class="module-link fw-bold text-decoration-none d-inline-flex align-items-center gap-2 mt-auto text-primary stretched-link">
                <span>${completed ? "Review Lesson" : "Start Learning"}</span>
                <i class="bi bi-arrow-right"></i>
            </a>
        </div>
    `;

        container.appendChild(card);
    });

    // Re-initialize Lucide icons safely if available
    if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
    }
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
        ?.classList.add("d-none");

    document.getElementById("practiceSection")
        ?.classList.add("d-none");

    document.getElementById("resultSection")
        ?.classList.add("d-none");

    document.getElementById("lessonSection")
        ?.classList.remove("d-none");

    renderLesson();

}


// ==========================================
// 5. RENDER LESSON (Fixed to eliminate giant gaps)
// ==========================================

function renderLesson() {

    if (!currentTopic) return;
    const lesson = currentTopic.lesson;

    let html = `
        <div class="mb-4">
            <span class="badge bg-primary mb-2">
                ${currentTopic.level}
            </span>
            <h2 class="fw-bold text-dark mb-3">${currentTopic.title}</h2>
            <p class="text-secondary lh-base mb-4">${lesson.introduction}</p>
            <hr class="text-muted opacity-25 my-4">
        </div>
    `;

    // Display lesson points in a compact, unified layout
    lesson.points.forEach((point, index) => {

        html += `
            <div class="mb-4 ${index > 0 ? 'pt-4 border-top border-light-subtle' : ''}">
                <h4 class="fw-bold text-dark fs-5 mb-2">${point.title}</h4>
                <p class="text-secondary mb-3">${point.description}</p>
                <div class="d-flex flex-column gap-2">
        `;

        point.examples.forEach(example => {

            html += `
                <div class="p-3 rounded-3 bg-light border border-opacity-50">
                    <div class="hindi-text fw-bold text-dark fs-6">${example.hindi}</div>
                    <div class="roman-text text-primary small fw-medium">${example.roman}</div>
                    <div class="english-text text-muted small fst-italic">Meaning: "${example.english}"</div>
                </div>
            `;

        });

        html += `
                </div>
            </div>
        `;

    });


    // Display vocabulary / grammar table

    if (lesson.table && lesson.table.length > 0) {

        html += `
            <div class="mt-4 pt-4 border-top border-light-subtle">
                <h4 class="fw-bold text-dark fs-5 mb-3">Quick Reference</h4>
                <div class="table-responsive">
                    <table class="table table-bordered table-hover align-middle mb-0">
                        <thead class="table-light">
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
                    <td class="fw-medium">${row.english}</td>
                    <td class="fw-bold text-dark">${row.hindi}</td>
                    <td class="text-primary">${row.roman}</td>
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

    const lessonContentEl = document.getElementById("lessonContent");
    if (lessonContentEl) {
        lessonContentEl.innerHTML = html;
    }

}

// ==========================================
// 5. RENDER LESSON (UI Text Size Increased & Spacing Optimized)
// ==========================================

// function renderLesson() {

//     if (!currentTopic) return;
//     const lesson = currentTopic.lesson;

//     let html = `
//         <div class="mb-4">
//             <span class="badge bg-primary mb-2 fs-6 px-3 py-2">
//                 ${currentTopic.level}
//             </span>
//             <h2 class="fw-extrabold text-dark display-6 mb-3">${currentTopic.title}</h2>
//             <p class="text-secondary fs-5 lh-base mb-4">${lesson.introduction}</p>
//             <hr class="text-muted opacity-25 my-4">
//         </div>
//     `;

//     // Display lesson points with larger, readable typography
//     lesson.points.forEach((point, index) => {

//         html += `
//             <div class="mb-4 ${index > 0 ? 'pt-4 border-top border-light-subtle' : ''}">
//                 <h4 class="fw-bold text-dark fs-4 mb-2">${point.title}</h4>
//                 <p class="text-secondary fs-6 mb-3 lh-base">${point.description}</p>
//                 <div class="d-flex flex-column gap-3 ">
//         `;

//         point.examples.forEach(example => {

//             html += `
//                 <div class="p-3.5 rounded-3 bg-light border border-opacity-50">
//                     <div class="hindi-text fw-bold text-dark fs-5 mb-1">${example.hindi}</div>
//                     <div class="roman-text text-primary fs-6 fw-semibold mb-1">${example.roman}</div>
//                     <div class="english-text text-muted fs-6 fst-italic">Meaning: "${example.english}"</div>
//                 </div>
//             `;

//         });

//         html += `
//                 </div>
//             </div>
//         `;

//     });


//     // Display vocabulary / grammar table with larger text

//     if (lesson.table && lesson.table.length > 0) {

//         html += `
//             <div class="mt-4 pt-4 border-top border-light-subtle">
//                 <h4 class="fw-bold text-dark fs-4 mb-3">Quick Reference</h4>
//                 <div class="table-responsive">
//                     <table class="table table-bordered table-hover align-middle mb-0 fs-6">
//                         <thead class="table-light">
//                             <tr>
//                                 <th class="py-3">English</th>
//                                 <th class="py-3">Hindi</th>
//                                 <th class="py-3">Roman Hindi</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//         `;

//         lesson.table.forEach(row => {

//             html += `
//                 <tr>
//                     <td class="fw-medium py-3">${row.english}</td>
//                     <td class="fw-bold text-dark py-3 fs-5">${row.hindi}</td>
//                     <td class="text-primary fw-semibold py-3">${row.roman}</td>
//                 </tr>
//             `;

//         });

//         html += `
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         `;

//     }

//     const lessonContentEl = document.getElementById("lessonContent");
//     if (lessonContentEl) {
//         lessonContentEl.innerHTML = html;
//     }

// }


// ==========================================
// 6. START PRACTICE
// ==========================================

function startPractice() {

    if (!currentTopic) return;

    currentQuestionIndex = 0;
    currentScore = 0;
    selectedAnswer = "";
    answerChecked = false;

    document.getElementById("lessonSection")
        ?.classList.add("d-none");

    document.getElementById("resultSection")
        ?.classList.add("d-none");

    document.getElementById("practiceSection")
        ?.classList.remove("d-none");

    displayQuestion();

}


// ==========================================
// 7. DISPLAY QUESTION
// ==========================================

function displayQuestion() {

    if (!currentTopic) return;
    const question = currentTopic.questions[currentQuestionIndex];
    const total = currentTopic.questions.length;

    selectedAnswer = "";
    answerChecked = false;

    const qNumEl = document.getElementById("questionNumber");
    if (qNumEl) qNumEl.textContent = `Question ${currentQuestionIndex + 1} of ${total}`;

    const qScoreEl = document.getElementById("questionScore");
    if (qScoreEl) qScoreEl.textContent = `Score: ${currentScore}`;

    const qProgEl = document.getElementById("questionProgress");
    if (qProgEl) qProgEl.style.width = `${(currentQuestionIndex / total) * 100}%`;

    const qTextEl = document.getElementById("questionText");
    if (qTextEl) qTextEl.textContent = question.question;

    const qTypeEl = document.getElementById("questionType");
    if (qTypeEl) qTypeEl.textContent = question.type === "mcq" ? "MULTIPLE CHOICE" : "FILL IN THE BLANK";

    const feedbackEl = document.getElementById("feedback");
    if (feedbackEl) feedbackEl.innerHTML = "";

    document.getElementById("checkButton")?.classList.remove("d-none");
    document.getElementById("nextButton")?.classList.add("d-none");

    const container = document.getElementById("answerContainer");
    if (!container) return;

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

        const fillInput = document.getElementById("fillAnswer");
        if (fillInput) {
            fillInput.addEventListener("input", function () {
                selectedAnswer = this.value.trim();
            });
        }

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

    // If it's a fill-in-the-blank question, grab value directly from input to ensure accuracy
    const fillInput = document.getElementById("fillAnswer");
    if (fillInput) {
        selectedAnswer = fillInput.value.trim();
    }

    if (!selectedAnswer || !selectedAnswer.trim()) {
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

    if (feedback) {
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
    }


    const qScoreEl = document.getElementById("questionScore");
    if (qScoreEl) qScoreEl.textContent = `Score: ${currentScore}`;

    document.getElementById("checkButton")?.classList.add("d-none");
    const nextBtn = document.getElementById("nextButton");
    if (nextBtn) {
        nextBtn.classList.remove("d-none");
        if (currentQuestionIndex === currentTopic.questions.length - 1) {
            nextBtn.textContent = "View Results →";
        }
    }

}


// ==========================================
// 10. NEXT QUESTION
// ==========================================

function nextQuestion() {

    if (!currentTopic) return;

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

    if (!currentTopic) return;
    const total = currentTopic.questions.length;

    document.getElementById("practiceSection")
        ?.classList.add("d-none");

    document.getElementById("resultSection")
        ?.classList.remove("d-none");

    const finalScoreEl = document.getElementById("finalScore");
    if (finalScoreEl) finalScoreEl.textContent = `${currentScore}/${total}`;

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

    const resultMsgEl = document.getElementById("resultMessage");
    if (resultMsgEl) resultMsgEl.textContent = message;


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

    const progressTextEl = document.getElementById("progressText");
    if (progressTextEl) progressTextEl.textContent = `${percentage}%`;

    const progressBarEl = document.getElementById("progressBar");
    if (progressBarEl) progressBarEl.style.width = `${percentage}%`;

}


// ==========================================
// 13. NAVIGATION
// ==========================================

function showDashboard() {

    document.getElementById("lessonSection")
        ?.classList.add("d-none");

    document.getElementById("practiceSection")
        ?.classList.add("d-none");

    document.getElementById("resultSection")
        ?.classList.add("d-none");

    document.getElementById("grammarDashboard")
        ?.classList.remove("d-none");

    displayTopics();
    updateProgress();

}


function showLesson() {

    document.getElementById("practiceSection")
        ?.classList.add("d-none");

    document.getElementById("lessonSection")
        ?.classList.remove("d-none");

}