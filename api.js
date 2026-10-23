
const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadButton = document.getElementById("load-btn");
const statusElement = document.getElementById("status");
const notesList = document.getElementById("notes-list");
const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const submitButton = document.getElementById("submit-btn");

let notes = [];

function setStatus(message, type = "info") {
  statusElement.textContent = message;
  statusElement.className = `status ${type}`;
}

// Reusable function for all API requests.
async function request(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  if (response.status === 204) {
    return { status: response.status, data: null };
  }

  const data = await response.json();

  return {
    status: response.status,
    data: data
  };
}

// Display notes using textContent to avoid inserting unsafe HTML.
function renderNotes() {
  notesList.replaceChildren();

  if (notes.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "empty-state";
    emptyItem.textContent = "No notes found. Create a note to get started.";
    notesList.appendChild(emptyItem);
    return;
  }

  notes.forEach((note) => {
    const item = document.createElement("li");
    item.className = "note";

    const heading = document.createElement("h3");
    heading.textContent = note.title || "(Untitled note)";

    const body = document.createElement("p");
    body.textContent = note.body || "No body provided.";

    const id = document.createElement("small");
    id.textContent = `Note ID: ${note.id}`;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", () => {
      deleteNote(note.id, deleteButton);
    });

    item.append(heading, body, id, deleteButton);
    notesList.appendChild(item);
  });
}

// GET: Load up to 10 notes.
async function loadNotes() {
  loadButton.disabled = true;
  setStatus("Loading notes...", "loading");

  try {
    const result = await request(`${API_URL}?_limit=10`);
    notes = result.data;

    renderNotes();

    if (notes.length === 0) {
      setStatus("No notes were returned by the server.", "success");
    } else {
      setStatus(
        `Loaded ${notes.length} notes from the server.`,
        "success"
      );
    }
  } catch (error) {
    console.error("Error loading notes:", error);
    setStatus(
      "Sorry, notes could not be loaded. Please try again.",
      "error"
    );
  } finally {
    loadButton.disabled = false;
  }
}

// POST: Create a new note.
async function createNote(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title) {
    setStatus("A title is required.", "error");
    titleInput.focus();
    return;
  }

  if (title.length > 100) {
    setStatus("The title must not exceed 100 characters.", "error");
    titleInput.focus();
    return;
  }

  submitButton.disabled = true;
  setStatus("Creating note...", "loading");

  try {
    const result = await request(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8"
      },
      body: JSON.stringify({
        title: title,
        body: body,
        userId: 1
      })
    });

    const createdNote = result.data;

    // JSONPlaceholder simulates POST; it does not permanently store new posts.
    // Keep the returned note in this page's in-memory list for the demo.
    notes.unshift(createdNote);

    renderNotes();

    setStatus(
      `Note created (status ${result.status}, id ${createdNote.id}).`,
      "success"
    );

    noteForm.reset();
  } catch (error) {
    console.error("Error creating note:", error);
    setStatus(
      "Sorry, the note could not be created. Please try again.",
      "error"
    );
  } finally {
    submitButton.disabled = false;
  }
}

// DELETE: Remove a note from the displayed list after server success.
async function deleteNote(id, button) {
  const originalText = button.textContent;

  button.disabled = true;
  button.textContent = "Deleting...";
  setStatus(`Deleting note ${id}...`, "loading");

  try {
    const result = await request(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    // JSONPlaceholder simulates deletion; it does not persist changes.
    // This removes the note from the current page's in-memory list only.
    notes = notes.filter((note) => String(note.id) !== String(id));

    renderNotes();

    setStatus(`Note ${id} deleted (status ${result.status}).`, "success");
  } catch (error) {
    console.error("Error deleting note:", error);

    setStatus(
      `Note ${id} could not be deleted. Please try again.`,
      "error"
    );

    button.textContent = originalText;
  } finally {
    button.disabled = false;
  }
}

loadButton.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", createNote);
