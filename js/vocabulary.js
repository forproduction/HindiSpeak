
let vocabularyList = [];

let showOnlyFavourites = false;
let selectedSource = "all";

let favouriteWords = JSON.parse(
    localStorage.getItem("hindiSpeakFavourites") || "[]"
);


// Load both vocabulary sources
// async function loadVocabulary() {


//     try {

//         const [lessonResponse, thematicResponse] = await Promise.all([

//             fetch("../data/lessons/beginner.json"),

//             fetch("../data/vocabulary/vocabulary-1.json")

//         ]);

//         if (!lessonResponse.ok || !thematicResponse.ok) {
//             throw new Error("Unable to load vocabulary files");
//         }

//         const lessonData = await lessonResponse.json();

//         const thematicData = await thematicResponse.json();

//         console.log("Lessons:", lessonData.lessons);
//         console.log("Thematic categories:", thematicData.categories);

//         console.log(
//             "Lesson count:", lessonData.lessons.length
//         );

//         console.log(
//             "Thematic category count:", thematicData.categories.length
//         );


//         // Extract vocabulary from lessons
//         lessonData.lessons.forEach(lesson => {

//             lesson.vocabulary.forEach((word, index) => {

//                 vocabularyList.push({

//                     ...word,

//                     key: "lesson-" + lesson.id + "-" + index,

//                     category: lesson.title,

//                     source: "lesson"

//                 });

//             });

//         });


//         // Extract vocabulary from thematic collection
//         thematicData.categories.forEach(category => {

//             category.vocabulary.forEach((word, index) => {

//                 vocabularyList.push({

//                     ...word,

//                     key: "theme-" + category.id + "-" + index,

//                     category: category.title,

//                     description: category.description,

//                     source: "thematic"

//                 });

//             });

//         });

//         console.log("Total vocabulary:", vocabularyList.length);

//         console.log(
//             "Lesson vocabulary:",
//             vocabularyList.filter(word => word.source === "lesson").length
//         );

//         console.log(
//             "Thematic vocabulary:",
//             vocabularyList.filter(word => word.source === "thematic").length
//         );


//         loadCategories();

//         displayVocabulary();

//     }
//     catch (error) {

//         console.error(error);

//         document.getElementById("vocabularyContainer")
//             .textContent = "Unable to load vocabulary. Please check your JSON files.";

//     }

// }


// async function loadVocabulary() {

//     vocabularyList = [];

//     // 1. Load lesson vocabulary independently
//     try {

//         const lessonResponse = await fetch("../data/lessons/beginner.json");

//         if (!lessonResponse.ok) {
//             throw new Error("beginner.json not found");
//         }

//         const lessonData = await lessonResponse.json();

//         lessonData.lessons.forEach(lesson => {

//             lesson.vocabulary.forEach((word, index) => {

//                 vocabularyList.push({
//                     ...word,
//                     key: "lesson-" + lesson.id + "-" + index,
//                     category: lesson.title,
//                     source: "lesson"
//                 });

//             });

//         });

//         console.log("Lesson vocabulary loaded successfully");

//     }
//     catch (error) {

//         console.error("Lesson file error:", error);

//     }


//     // 2. Load thematic vocabulary independently
//     try {

//         const thematicResponse = await fetch("../data/vocabulary/vocabulary-1.json");

//         if (!thematicResponse.ok) {
//             throw new Error("vocabulary-1.json not found");
//         }

//         const thematicData = await thematicResponse.json();

//         thematicData.categories.forEach(category => {

//             category.vocabulary.forEach((word, index) => {

//                 vocabularyList.push({
//                     ...word,
//                     key: "theme-" + category.id + "-" + index,
//                     category: category.title,
//                     description: category.description,
//                     source: "thematic"
//                 });

//             });

//         });

//         console.log("Thematic vocabulary loaded successfully");

//     }
//     catch (error) {

//         console.error("Thematic file error:", error);

//     }


//     // 3. Display everything that loaded successfully

//     console.log("Total words:", vocabularyList.length);

//     console.log(
//         "Lesson words:",
//         vocabularyList.filter(w => w.source === "lesson").length
//     );

//     console.log(
//         "Thematic words:",
//         vocabularyList.filter(w => w.source === "thematic").length
//     );

//     loadCategories();

//     displayVocabulary();

// }

async function loadVocabulary() {
    vocabularyList = [];

    // Load lesson vocabulary
    try {
        const response = await fetch("../data/lessons/beginner.json");
        if (!response.ok) throw new Error("Lesson JSON not found");

        const data = await response.json();

        data.lessons.forEach(lesson => {
            lesson.vocabulary.forEach((word, index) => {
                vocabularyList.push({
                    ...word,
                    key: `lesson-${lesson.id}-${index}`,
                    category: lesson.title
                });
            });
        });
    } catch (error) {
        console.error("Lesson vocabulary error:", error);
    }

    // Load thematic vocabulary
    try {
        const response = await fetch("../data/vocabulary/vocabulary-1.json");
        if (!response.ok) throw new Error("Thematic JSON not found");

        const data = await response.json();

        data.categories.forEach(category => {
            category.vocabulary.forEach((word, index) => {
                vocabularyList.push({
                    ...word,
                    key: `theme-${category.id}-${index}`,
                    category: category.title
                });
            });
        });
    } catch (error) {
        console.error("Thematic vocabulary error:", error);
    }

    console.log("Total vocabulary loaded:", vocabularyList.length);

    loadCategories();
    displayVocabulary();
}



// Load category dropdown
function loadCategories() {

    const categoryFilter =
        document.getElementById("categoryFilter");

    categoryFilter.innerHTML =
        '<option value="all">All Categories</option>';

    const categories = [
        ...new Set(vocabularyList.map(word => word.category))
    ];

    categories.forEach(category => {

        const option = document.createElement("option");

        option.value = category;

        option.textContent = category;

        categoryFilter.appendChild(option);

    });

}


// Display vocabulary
function displayVocabulary() {

    const container =
        document.getElementById("vocabularyContainer");

    const searchText = document
        .getElementById("searchInput")
        .value.toLowerCase()
        .trim();

    const selectedCategory =
        document.getElementById("categoryFilter").value;


    const filteredWords = vocabularyList.filter(word => {

        const matchesSearch =

            (word.hindi || "").toLowerCase().includes(searchText) ||

            (word.roman || "").toLowerCase().includes(searchText) ||

            (word.meaning || "").toLowerCase().includes(searchText);


        const matchesCategory =

            selectedCategory === "all" ||

            word.category === selectedCategory;


        const matchesFavourite =

            !showOnlyFavourites ||

            favouriteWords.includes(word.key);


        const matchesSource =

            selectedSource === "all" ||

            word.source === selectedSource;


        return matchesSearch &&
            matchesCategory &&
            matchesFavourite &&
            matchesSource;

    });


    document.getElementById("wordCount").textContent =
        filteredWords.length + " words";


    container.innerHTML = "";


    if (filteredWords.length === 0) {

        container.innerHTML = `
            <div class="col-12 text-center text-muted py-5">
                No vocabulary found.
            </div>
        `;

        return;

    }


    filteredWords.forEach(word => {

        const card = document.createElement("div");

        card.className = "col-md-6 col-lg-4 mb-4";

        const favourite = favouriteWords.includes(word.key);


        card.innerHTML = `

            <div class="card vocabulary-builder-card h-100 shadow-sm">

                <div class="card-body">

                    <div class="d-flex justify-content-between mb-3">

                        <span class="badge bg-success">
                            ${escapeHTML(word.category)}
                        </span>

                        <button class="btn btn-sm ${favourite ? "btn-danger" : "btn-outline-danger"
            } favourite-btn"
                        data-key="${escapeHTML(word.key)}">

                            ${favourite ? "♥" : "♡"}

                        </button>

                    </div>


                    <h3 class="text-success">
                        ${escapeHTML(word.hindi)}
                    </h3>

                    <p class="text-primary mb-1">
                        ${escapeHTML(word.roman)}
                    </p>

                    <h6 class="mb-3">
                        ${escapeHTML(word.meaning)}
                    </h6>

                    <hr>

                    <p class="text-muted mb-1">
                        Example:
                    </p>

                    <p class="fw-semibold">
                        ${escapeHTML(word.exampleHindi)}
                    </p>

                    <p class="text-primary small">
                        ${escapeHTML(word.exampleRoman)}
                    </p>

                    <p class="text-muted small">
                        ${escapeHTML(word.exampleMeaning)}
                    </p>

                    ${word.memoryTip
                ? `
                            <div class="alert alert-light border small">
                                <strong>Memory Tip:</strong>
                                ${escapeHTML(word.memoryTip)}
                            </div>
                        `
                : ""
            }

                    <button class="btn btn-outline-success btn-sm speak-btn"
                            data-key="${escapeHTML(word.key)}">

                        🔊 Listen

                    </button>

                </div>

            </div>

        `;

        container.appendChild(card);

    });

}


// Toggle favourite
function toggleFavourite(key) {

    if (favouriteWords.includes(key)) {

        favouriteWords = favouriteWords.filter(
            item => item !== key
        );

    }
    else {

        favouriteWords.push(key);

    }

    localStorage.setItem(
        "hindiSpeakFavourites",
        JSON.stringify(favouriteWords)
    );

    displayVocabulary();

}


// Speak Hindi word
function speakHindi(key) {

    const word = vocabularyList.find(
        item => item.key === key
    );

    if (!word) return;

    if (!("speechSynthesis" in window)) {

        alert("Speech output is not supported.");

        return;

    }

    const speech = new SpeechSynthesisUtterance(word.hindi);

    speech.lang = "hi-IN";

    speech.rate = 0.85;

    window.speechSynthesis.cancel();

    window.speechSynthesis.speak(speech);

}


// Escape HTML
function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, character => {

        const entities = {

            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"

        };

        return entities[character];

    });

}


// Search
document.getElementById("searchInput")
    .addEventListener("input", displayVocabulary);


// Category filter
document.getElementById("categoryFilter")
    .addEventListener("change", displayVocabulary);


// Favourite filter
document.getElementById("favouriteFilter")
    .addEventListener("click", function () {

        showOnlyFavourites = !showOnlyFavourites;

        this.textContent = showOnlyFavourites
            ? "👀 Show All Words"
            : "♥ Show Favourites";

        displayVocabulary();

    });


// Handle card buttons
document.getElementById("vocabularyContainer")
    .addEventListener("click", function (event) {

        const favouriteButton =
            event.target.closest(".favourite-btn");

        const speakButton =
            event.target.closest(".speak-btn");


        if (favouriteButton) {

            toggleFavourite(favouriteButton.dataset.key);

        }

        if (speakButton) {

            speakHindi(speakButton.dataset.key);

        }

    });

// document.getElementById("sourceFilter")
//     .addEventListener("change", function () {

//         selectedSource = this.value;

//         displayVocabulary();

//     });

// Start
loadVocabulary();
