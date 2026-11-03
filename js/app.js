
document.addEventListener("DOMContentLoaded", function () {

    console.log("HindiSpeak website loaded successfully.");

});

const HINDISPEAK_STORAGE_KEYS = [
    "hindiSpeakCompletedLessons",
    "hindiSpeakFavourites",
    "hindiSpeakGrammarProgress",
    "hindiSpeakQuizProgress",
    "hindiSpeakConversationProgress"
];

function clearHindiSpeakStorage() {

    // Ask for password
    const password = prompt(
        "Enter password to clear HindiSpeak storage:"
    );

    // Cancel button
    if (password === null) {
        return;
    }

    // Check password
    if (password !== "Paithiyam@2026") {

        alert("Incorrect password!");

        return;
    }

    // Confirm deletion
    const confirmDelete = confirm(
        "Are you sure you want to clear all HindiSpeak progress and favourites?"
    );

    if (!confirmDelete) {
        return;
    }

    // Remove HindiSpeak storage
    HINDISPEAK_STORAGE_KEYS.forEach(function(key) {

        localStorage.removeItem(key);

    });

    alert("HindiSpeak storage cleared successfully!");

    // Reload page
    location.reload();
}