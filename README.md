
# QuickNotes System Design

## Description

QuickNotes System Design is a capstone project demonstrating how a browser-based application communicates with an API and how a backend service can be designed to support one million registered users.

The front-end client uses JSONPlaceholder to practise GET, POST, and DELETE requests. The project also documents a proposed REST API, relational database, and scalable system architecture.

## Project Files

- `index.html` — webpage structure and note creation form.
- `api.js` — API requests, validation, note rendering, and error handling.
- `style.css` — page styling and status message styles.
- `docs/api-design.md` — proposed REST endpoints, JSON examples, and error responses.
- `docs/data-model.md` — database entities, relationships, SQL statements, queries, and indexes.
- `docs/architecture.md` — system requirements, capacity estimates, architecture diagram, request flows, and trade-offs.

## How to Run the API Client

1. Clone or download this repository.
2. Open the project folder in Visual Studio Code.
3. Start a local development server. You can use the Live Server extension or run `python -m http.server 8000` in the project folder.
4. Open `http://localhost:8000` in your browser if using Python's server.
5. Click **Load notes** to retrieve up to 10 practice posts.
6. Enter a title and optional body to create a note.
7. Click a note's Delete button to remove it from the current displayed list.

An internet connection is required to contact JSONPlaceholder.

## Design Documents

- [API Design](docs/api-design.md)
- [Data Model](docs/data-model.md)
- [Architecture](docs/architecture.md)

## What I Learned

1. How to use JavaScript `fetch`, `async`, and `await` to communicate with an API.
2. How GET, POST, and DELETE requests work and how HTTP response status codes indicate success or failure.
3. Why form validation and loading, success, error, and empty states improve the user experience.
4. Why `textContent` is safer than inserting untrusted text as HTML.
5. How primary keys, foreign keys, indexes, and JOINs support relational database design.
6. How load balancers, caches, read replicas, and queues help a service scale.
7. Why architecture decisions involve trade-offs between performance, consistency, cost, and reliability.

## Important Limitations

JSONPlaceholder is a practice API. It simulates POST and DELETE operations but does not permanently save the changes.

Newly created notes and deleted-note changes are reflected in the current browser session's in-memory list. This project does not implement a production backend, authentication, or persistent database.

The design documents describe a proposed production system; they do not mean that the infrastructure has already been deployed.
