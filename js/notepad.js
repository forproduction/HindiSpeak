// Dedicated LocalStorage Key
const NOTEPAD_STORAGE_KEY = "hindispeak_notepad_notes";

// Inject Notepad HTML automatically on page load
document.addEventListener("DOMContentLoaded", () => {
    // Prevent duplicate injection if script runs twice
    if (document.getElementById("notepadToggleBtn")) return;

    const notepadHTML = `
        <button class="hindispeak-notepad-toggle" id="notepadToggleBtn" title="Open Study Notepad" onclick="toggleNotepad()">
            <i class="bi bi-journal-text"></i>
        </button>

        <div class="hindispeak-notepad-drawer shadow-lg" id="notepadDrawer">
            <div class="notepad-header">
                <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-pencil-square text-warning"></i>
                    <span class="fw-bold small">Study Notepad</span>
                </div>
                <button type="button" class="btn-close btn-close-white shadow-none" onclick="toggleNotepad()"></button>
            </div>
            <div class="notepad-body bg-light">
                <p class="text-muted small mb-2">Write down quick words or notes. Auto-saves locally!</p>
                <textarea id="hindiSpeakNotepadInput" class="form-control rounded-3 shadow-none mb-3" placeholder="Write your notes here..."></textarea>
                <div class="d-flex justify-content-between align-items-center">
                    <button class="btn btn-outline-danger btn-sm rounded-pill px-3 py-1" onclick="clearNotepadStorage()">
                        <i class="bi bi-trash3 me-1"></i> Clear Note
                    </button>
                    <button class="btn btn-primary btn-sm rounded-pill px-4 py-1 fw-bold" onclick="downloadNotepadFile()">
                        <i class="bi bi-download me-1"></i> Save File
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", notepadHTML);

    // Load saved note from localStorage
    const inputField = document.getElementById("hindiSpeakNotepadInput");
    const savedNote = localStorage.getItem(NOTEPAD_STORAGE_KEY);
    if (savedNote) {
        inputField.value = savedNote;
    }

    // Auto-save on typing
    inputField.addEventListener("input", (e) => {
        localStorage.setItem(NOTEPAD_STORAGE_KEY, e.target.value);
    });
});

// Helper Functions
function toggleNotepad() {
    const drawer = document.getElementById("notepadDrawer");
    if (drawer) drawer.classList.toggle("active");
}

function clearNotepadStorage() {
    if (confirm("Are you sure you want to clear your notepad?")) {
        const inputField = document.getElementById("hindiSpeakNotepadInput");
        if (inputField) inputField.value = "";
        localStorage.removeItem(NOTEPAD_STORAGE_KEY);
    }
}

function downloadNotepadFile() {
    const inputField = document.getElementById("hindiSpeakNotepadInput");
    const textContent = inputField ? inputField.value : "";
    if (!textContent.trim()) {
        alert("Your notepad is empty!");
        return;
    }
    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "HindiSpeak_My_Notes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}