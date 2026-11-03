
const DATA_URL = "../data/lessons/beginner.json";
const STORAGE_KEY = "hindiSpeakCompletedLessons";

let courseData = null;
let lessons = [];
let currentLessonIndex = 0;

// Read completed lesson IDs from LocalStorage
function getCompletedLessons() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

// Save completed lesson IDs
function saveCompletedLessons(completed) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
}

// Escape text before placing JSON content into HTML
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// Load the JSON file
async function loadLessons() {
    const content = document.getElementById("lessonContent");

    try {
        const response = await fetch(DATA_URL);

        if (!response.ok) {
            throw new Error("Could not load the lesson JSON file.");
        }

        courseData = await response.json();
        lessons = courseData.lessons || [];

        if (lessons.length === 0) {
            throw new Error("No lessons were found in the JSON file.");
        }

        document.getElementById("courseTitle").textContent =
            courseData.course.title;

        document.getElementById("courseInfo").textContent =
            `${courseData.course.level} • ${lessons.length} lessons`;

        renderLessonList();
        showLesson(0);

    } catch (error) {
        content.innerHTML = `
            <div class="alert alert-danger">
                ${escapeHTML(error.message)}
                <p class="mb-0 mt-2">
                    Check the JSON file location and run the project
                    using Live Server.
                </p>
            </div>
        `;
    }
}

// Display all lesson titles in the sidebar
function renderLessonList() {
    const list = document.getElementById("lessonList");
    const completed = getCompletedLessons();

    list.innerHTML = lessons.map((lesson, index) => `
        <button class="lesson-list-item
            ${index === currentLessonIndex ? "active" : ""}"
            onclick="showLesson(${index})">

            <span>${index + 1}. ${escapeHTML(lesson.title)}</span>

            <span class="lesson-status">
                ${completed.includes(lesson.id) ? "✓" : ""}
            </span>
        </button>
    `).join("");

    updateProgress();
}

// Display one selected lesson
function showLesson(index) {
    if (index < 0 || index >= lessons.length) return;

    currentLessonIndex = index;

    const lesson = lessons[index];
    const content = document.getElementById("lessonContent");

    content.innerHTML = `
        <div class="lesson-header">
            <span class="badge bg-primary">
                Lesson ${index + 1}
            </span>

            <span class="badge bg-secondary">
                ${escapeHTML(lesson.difficulty)}
            </span>

            <span class="text-muted">
                ${escapeHTML(lesson.estimatedMinutes)} minutes
            </span>

            <h2 class="mt-3 text-dark bolder">${escapeHTML(lesson.title)}</h2>
            <p>${escapeHTML(lesson.description)}</p>
        </div>

        ${renderObjectives(lesson.objectives)}
        ${renderExplanation(lesson.explanation)}
        ${renderVocabulary(lesson.vocabulary)}
        ${renderSentences(lesson.sentences)}
        ${renderDialogue(lesson.dialogue)}
        ${renderMistakes(lesson.commonMistakes)}
        ${renderExercises(lesson.exercises, lesson.id)}
        ${renderSummary(lesson.summary)}
        ${renderSpeakingChallenge(lesson.speakingChallenge)}
    `;

    renderLessonList();
    updateNavigationButtons();

    window.scrollTo({ top: 0, behavior: "smooth" });
}

// Objectives
function renderObjectives(objectives = []) {
    return `
        <div class="lesson-section">
            <h4>What You Will Learn</h4>
            <ul>
                ${objectives.map(item =>
                    `<li>${escapeHTML(item)}</li>`
                ).join("")}
            </ul>
        </div>
    `;
}

// Explanation
function renderExplanation(explanation) {
    return `
        <div class="lesson-section">
            <h4>Lesson Explanation</h4>
            <p class="lesson-explanation">
                ${escapeHTML(explanation).replace(/\n/g, "<br>")}
            </p>
        </div>
    `;
}

// Vocabulary
function renderVocabulary(vocabulary = []) {
    return `
        <div class="lesson-section">
            <h4>Vocabulary</h4>

            <div class="row g-3">
                ${vocabulary.map((word, index) => `
                    <div class="col-md-6">
                        <div class="vocabulary-card">

                            <div class="d-flex justify-content-between">
                                <h5>${escapeHTML(word.hindi)}</h5>

                                <button class="btn btn-sm btn-outline-primary"
                                    onclick="speakHindi(${index}, 'vocabulary')">
                                    🔊 Listen
                                </button>
                            </div>

                            <p class="roman-text">
                                ${escapeHTML(word.roman)}
                            </p>

                            <p>${escapeHTML(word.meaning)}</p>

                            <hr>

                            <p class="mb-1">
                                <strong>Example:</strong>
                                ${escapeHTML(word.exampleHindi)}
                            </p>

                            <p class="roman-text mb-1">
                                ${escapeHTML(word.exampleRoman)}
                            </p>

                            <small class="text-muted">
                                ${escapeHTML(word.exampleMeaning)}
                            </small>

                        </div>
                    </div>
                `).join("")}
            </div>
        </div>
    `;
}

// Sentences
function renderSentences(sentences = []) {
    return `
        <div class="lesson-section">
            <h4>Useful Sentences</h4>

            ${sentences.map((sentence, index) => `
                <div class="sentence-card">
                    <div class="d-flex justify-content-between">
                        <strong>${escapeHTML(sentence.hindi)}</strong>

                        <button class="btn btn-sm btn-outline-primary"
                            onclick="speakHindi(${index}, 'sentence')">
                            🔊
                        </button>
                    </div>

                    <p class="roman-text mb-1">
                        ${escapeHTML(sentence.roman)}
                    </p>

                    <small class="text-muted">
                        ${escapeHTML(sentence.meaning)}
                    </small>
                </div>
            `).join("")}
        </div>
    `;
}

// Dialogue
function renderDialogue(dialogue = []) {
    return `
        <div class="lesson-section">
            <h4>Real-life Conversation</h4>

            ${dialogue.map(line => `
                <div class="dialogue-card">
                    <strong>${escapeHTML(line.speaker)}</strong>

                    <p class="hindi-text mb-1">
                        ${escapeHTML(line.hindi)}
                    </p>

                    <p class="roman-text mb-1">
                        ${escapeHTML(line.roman)}
                    </p>

                    <small class="text-muted">
                        ${escapeHTML(line.meaning)}
                    </small>
                </div>
            `).join("")}
        </div>
    `;
}

// Common mistakes
function renderMistakes(mistakes = []) {
    return `
        <div class="lesson-section">
            <h4>Common Mistakes</h4>

            ${mistakes.map(mistake => `
                <div class="mistake-card">
                    <p class="text-danger mb-1">
                        <strong>Incorrect:</strong>
                        ${escapeHTML(mistake.incorrectRoman)}
                    </p>

                    <p class="text-success mb-1">
                        <strong>Correct:</strong>
                        ${escapeHTML(mistake.correctRoman)}
                    </p>

                    <p class="mb-1">
                        ${escapeHTML(mistake.correctHindi)}
                    </p>

                    <small>${escapeHTML(mistake.explanation)}</small>
                </div>
            `).join("")}
        </div>
    `;
}

// Exercises
function renderExercises(exercises = [], lessonId) {
    return `
        <div class="lesson-section">
            <h4>Practice Exercises</h4>

            ${exercises.map((exercise, index) => `
                <div class="exercise-card" id="exercise-${index}">

                    <p>
                        <strong>Question ${index + 1}:</strong>
                        ${escapeHTML(exercise.question)}
                    </p>

                    <div class="exercise-options">
                        ${exercise.options.map((option, optionIndex) => `
                            <label class="quiz-option">
                                <input type="radio"
                                    name="lesson-${lessonId}-question-${index}"
                                    value="${escapeHTML(option)}">

                                ${escapeHTML(option)}
                            </label>
                        `).join("")}
                    </div>

                    <button class="btn btn-sm btn-primary mt-2"
                        onclick="checkAnswer(${index}, ${lessonId})">
                        Check Answer
                    </button>

                    <div class="answer-feedback mt-2"
                         id="feedback-${index}">
                    </div>

                </div>
            `).join("")}
        </div>
    `;
}

// Check one exercise answer
function checkAnswer(index, lessonId) {
    const lesson = lessons.find(item => item.id === lessonId);
    const exercise = lesson.exercises[index];

    const selected = document.querySelector(
        `input[name="lesson-${lessonId}-question-${index}"]:checked`
    );

    const feedback = document.getElementById(`feedback-${index}`);

    if (!selected) {
        feedback.innerHTML = `
            <p class="text-warning">Please select an answer first.</p>
        `;
        return;
    }

    const isCorrect = selected.value === exercise.correctAnswer;

    feedback.innerHTML = `
        <p class="${isCorrect ? "text-success" : "text-danger"}">
            <strong>
                ${isCorrect ? "Correct answer!" : "Incorrect answer."}
            </strong>
        </p>

        <p>
            <strong>Correct answer:</strong>
            ${escapeHTML(exercise.correctAnswer)}
        </p>

        <small>${escapeHTML(exercise.explanation)}</small>
    `;
}

// Summary
function renderSummary(summary = []) {
    return `
        <div class="lesson-section">
            <h4>Lesson Summary</h4>

            <ul>
                ${summary.map(item =>
                    `<li>${escapeHTML(item)}</li>`
                ).join("")}
            </ul>
        </div>
    `;
}

// Speaking challenge
function renderSpeakingChallenge(challenge) {
    return `
        <div class="lesson-section speaking-challenge">
            <h4>Speaking Challenge 🎤</h4>
            <p>${escapeHTML(challenge)}</p>
        </div>
    `;
}

// Speak Hindi text using browser speech synthesis
function speakText(text) {
    if (!("speechSynthesis" in window)) {
        alert("Speech output is not supported in this browser.");
        return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "hi-IN";
    speech.rate = 0.85;

    window.speechSynthesis.speak(speech);
}

// Speak vocabulary or sentence
function speakHindi(index, type) {
    const lesson = lessons[currentLessonIndex];

    let text = "";

    if (type === "vocabulary") {
        text = lesson.vocabulary[index].hindi;
    } else {
        text = lesson.sentences[index].hindi;
    }

    speakText(text);
}

// Mark current lesson completed
function markLessonCompleted() {
    const lesson = lessons[currentLessonIndex];
    const completed = getCompletedLessons();

    if (!completed.includes(lesson.id)) {
        completed.push(lesson.id);
        saveCompletedLessons(completed);
    }

    renderLessonList();

    
}

// Update progress bar
function updateProgress() {
    if (lessons.length === 0) return;

    const completed = getCompletedLessons();
    const count = lessons.filter(lesson =>
        completed.includes(lesson.id)
    ).length;

    const percentage = Math.round((count / lessons.length) * 100);

    document.getElementById("progressBar").style.width =
        percentage + "%";

    document.getElementById("progressText").textContent =
        `${percentage}% completed (${count}/${lessons.length})`;
}

// Previous and Next buttons
function updateNavigationButtons() {
    document.getElementById("previousBtn").disabled =
        currentLessonIndex === 0;

    document.getElementById("nextBtn").disabled =
        currentLessonIndex === lessons.length - 1;

    const completed = getCompletedLessons();
    const currentLesson = lessons[currentLessonIndex];

    document.getElementById("completeBtn").textContent =
        completed.includes(currentLesson.id)
            ? "Completed ✓"
            : "Mark as Completed";
}

document.getElementById("previousBtn").addEventListener("click", () => {
    showLesson(currentLessonIndex - 1);
});

document.getElementById("nextBtn").addEventListener("click", () => {
    showLesson(currentLessonIndex + 1);
});

// document.getElementById("completeBtn").addEventListener("click", () => {
//     markLessonCompleted();
// });

// Select the button by its ID
const completeButton = document.getElementById('completeBtn');

// Add a click event listener
// completeButton.addEventListener('click', function() {
//     alert("Did you really complete the course? Listen, God is watching you, so don't try to fool Him. 🧐🫵");
// });

// completeButton.addEventListener('click', function() {
//     Swal.fire({
//         title: '<b>Did you really complete the course?</b>',
//         html: "Listen, <b>God is watching you</b>, so don't try to fool Him. 🧐🫵",
//         icon: 'warning',
//         confirmButtonText: 'Got it'
//     });
// });

document.getElementById('completeBtn').addEventListener('click', function() {
    Swal.fire({
        title: '<b>Did you really complete the course?</b>',
        html: "Listen, <b>God is watching you</b>, so don't try to fool Him. 🧐🫵",
        icon: 'warning',
        showCancelButton: true,              // This enables the second button
        confirmButtonText: 'Yes, Complete',   // Text for the primary button
        confirmButtonColor: '#28a745',        // Green color for completion
        cancelButtonText: 'Reject',           // Text for the second button
        cancelButtonColor: '#d33'             // Red color for rejection
    }).then((result) => {
        if (result.isConfirmed) {
            // Code to run when they click "Yes, Complete"
            Swal.fire('Completed!', 'Your progress has been saved.', 'success');
            document.getElementById("completeBtn").textContent = "Completed ✓";
            markLessonCompleted();
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            // Code to run when they click "Reject"
            Swal.fire('Rejected', 'Action cancelled by user.', 'error');
            // document.getElementById("completeBtn").textContent = "Complete";
        }
    });
});

loadLessons();
