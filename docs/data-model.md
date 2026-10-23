
# QuickNotes Data Model

## 1. Entities and Relationships

### Users
Stores account information for registered users.

Columns:
- `id`: BIGINT, primary key.
- `email`: VARCHAR(320), unique and required.
- `password_hash`: TEXT, required.
- `display_name`: VARCHAR(100), required.
- `created_at`: TIMESTAMPTZ, required.

### Notes
Stores the notes created by users.

Columns:
- `id`: BIGINT, primary key.
- `user_id`: BIGINT, foreign key referencing users.
- `title`: VARCHAR(100), required.
- `body`: TEXT, optional content stored as an empty string when absent.
- `created_at`: TIMESTAMPTZ.
- `updated_at`: TIMESTAMPTZ.

### Tags
Stores labels that users can apply to notes.

Columns:
- `id`: BIGINT, primary key.
- `user_id`: BIGINT, foreign key referencing users.
- `name`: VARCHAR(50), required.
- `created_at`: TIMESTAMPTZ.

### Note_Tags
Connects notes with tags.

Columns:
- `note_id`: BIGINT, foreign key referencing notes.
- `tag_id`: BIGINT, foreign key referencing tags.
- `created_at`: TIMESTAMPTZ.
- Composite primary key: (`note_id`, `tag_id`).

## 2. Relationships

- One user can have many notes: one-to-many.
- One user can create many tags: one-to-many.
- One note can have many tags, and one tag can belong to many notes: many-to-many.
- The `note_tags` table implements the many-to-many relationship.
- Foreign keys maintain referential integrity.
- Cascading deletes remove dependent records when a user, note, or tag is deleted.

## 3. CREATE TABLE Statements

The following schema uses PostgreSQL.

```sql
CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(320) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL
        CHECK (char_length(trim(title)) BETWEEN 1 AND 100),
    body TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tags (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL
        CHECK (char_length(trim(name)) BETWEEN 1 AND 50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, name)
);

CREATE TABLE note_tags (
    note_id BIGINT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (note_id, tag_id)
);
```

## 4. Example SQL Queries

### Query 1: List a user's latest notes

```sql
SELECT id, title, body, created_at, updated_at
FROM notes
WHERE user_id = $1
ORDER BY updated_at DESC
LIMIT 20 OFFSET 0;
```

### Query 2: Find one note belonging to a user

```sql
SELECT id, title, body
FROM notes
WHERE id = $1 AND user_id = $2;
```

### Query 3: JOIN notes and tags

```sql
SELECT
    n.id AS note_id,
    n.title,
    t.id AS tag_id,
    t.name AS tag_name
FROM notes AS n
JOIN note_tags AS nt ON nt.note_id = n.id
JOIN tags AS t ON t.id = nt.tag_id
WHERE n.user_id = $1
ORDER BY n.id, t.name;
```

### Query 4: Count notes for each user

```sql
SELECT u.id, u.email, COUNT(n.id) AS note_count
FROM users AS u
LEFT JOIN notes AS n ON n.user_id = u.id
GROUP BY u.id, u.email
ORDER BY note_count DESC;
```

## 5. Indexes

```sql
CREATE INDEX idx_notes_user_updated
ON notes (user_id, updated_at DESC);

CREATE INDEX idx_note_tags_tag
ON note_tags (tag_id);
```

The `idx_notes_user_updated` index speeds up queries that retrieve a user's notes ordered by the most recently updated. The `idx_note_tags_tag` index helps find notes associated with a particular tag.

The primary key of `note_tags` already indexes `note_id` and `tag_id` in that order. The additional index helps queries that begin with `tag_id`.

## 6. SQL vs NoSQL Decision

PostgreSQL is the recommended choice because QuickNotes has structured entities and clear relationships between users, notes, and tags. Foreign keys and transactions help preserve data consistency. SQL also supports joins, filtering, and reporting. With appropriate indexes, caching, connection pooling, and read replicas, PostgreSQL is a reasonable starting point for one million registered users. The design should be reviewed against real usage and performance measurements as the service grows.
