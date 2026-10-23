
# QuickNotes REST API Design

## 1. Overview

The production QuickNotes service will expose a REST API under `/api/v1`. It will use JSON for requests and responses, HTTPS for communication, and bearer tokens for authentication.

JSONPlaceholder is only used to practise front-end API requests. The endpoints below describe the real backend that would be built for QuickNotes.

## 2. REST Endpoints

| Method | Path | Description | Success status |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Register a new user | 201 Created |
| POST | `/api/v1/auth/login` | Authenticate a user | 200 OK |
| GET | `/api/v1/notes` | List the authenticated user's notes | 200 OK |
| POST | `/api/v1/notes` | Create a note | 201 Created |
| GET | `/api/v1/notes/{noteId}` | Retrieve one note | 200 OK |
| PATCH | `/api/v1/notes/{noteId}` | Update selected note fields | 200 OK |
| DELETE | `/api/v1/notes/{noteId}` | Delete a note | 204 No Content |
| GET | `/api/v1/tags` | List the user's tags | 200 OK |
| PUT | `/api/v1/notes/{noteId}/tags/{tagId}` | Attach a tag to a note | 204 No Content |

## 3. Create a Note

### Request

`POST /api/v1/notes`

Headers:

- `Authorization: Bearer <access_token>`
- `Content-Type: application/json`

Request JSON:

```json
{
  "title": "Meeting notes",
  "body": "Follow up with the project team.",
  "tagIds": [2, 5]
}
```

The title is required and must contain between 1 and 100 characters after trimming. The body is optional.

### Successful response

Status: `201 Created`

```json
{
  "id": 481,
  "userId": 73,
  "title": "Meeting notes",
  "body": "Follow up with the project team.",
  "createdAt": "2026-10-23T12:00:00Z",
  "updatedAt": "2026-10-23T12:00:00Z",
  "tags": [
    {"id": 2, "name": "work"},
    {"id": 5, "name": "follow-up"}
  ]
}
```

The server generates the note ID and timestamps. The server determines the user ID from the authenticated token rather than trusting a client-supplied user ID.

## 4. List Notes

### Request

`GET /api/v1/notes?page=1&limit=20&q=meeting`

Headers:

- `Authorization: Bearer <access_token>`

### Successful response

Status: `200 OK`

```json
{
  "data": [
    {
      "id": 481,
      "userId": 73,
      "title": "Meeting notes",
      "body": "Follow up with the project team.",
      "createdAt": "2026-10-23T12:00:00Z",
      "updatedAt": "2026-10-23T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

If the user has no notes, the API returns `200 OK` with `"data": []`.

## 5. Error Status Codes

| Status | Meaning | Example |
|---|---|---|
| 400 Bad Request | Invalid request data | Missing title |
| 401 Unauthorized | Authentication is missing or invalid | Expired token |
| 403 Forbidden | User is not permitted to perform the action | Insufficient permissions |
| 404 Not Found | Resource does not exist or is not accessible | Unknown note ID |
| 409 Conflict | Request conflicts with existing data | Duplicate tag name |
| 422 Unprocessable Content | Input fails semantic validation | Invalid field combination |
| 429 Too Many Requests | Rate limit exceeded | Too many requests |
| 500 Internal Server Error | Unexpected server error | Database or application failure |

### Example error response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The title must contain between 1 and 100 characters.",
    "details": [
      {
        "field": "title",
        "issue": "Title is required"
      }
    ],
    "requestId": "req_01JQK8ABC"
  }
}
```

## 6. API Design Principles

- Use HTTPS for all communication.
- Use consistent JSON response formats.
- Authenticate private endpoints with bearer tokens.
- Ensure users can access only their own notes and tags.
- Validate input on the server.
- Use parameterised database queries.
- Paginate note listings and cap the maximum page size.
- Use `204 No Content` after a successful deletion.
- Log unexpected failures without exposing sensitive information.
