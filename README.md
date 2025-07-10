# Wedding Gallery

This project is a Spring Boot application for managing wedding photos with JWT-based authentication.

## Prerequisites

- **PostgreSQL** database server.
- **Flyway** for database migrations (runs automatically on application startup).
- Java 21+ and Maven are handled via the Maven wrapper.

## Database setup

1. Install PostgreSQL and create a database and user:
   ```bash
   sudo -u postgres psql -c "CREATE DATABASE weddinggallery;"
   sudo -u postgres psql -c "CREATE USER wedding_user WITH PASSWORD 'kamisania';"
   sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE weddinggallery TO wedding_user;"
   ```
2. Verify the connection details in `weddinggallery/src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/weddinggallery
   spring.datasource.username=wedding_user
   spring.datasource.password=kamisania
   spring.flyway.enabled=true
   ```
   Flyway will run the SQL scripts from `src/main/resources/db/migration` on startup.

## Configuration via environment variables

The application reads its settings from the following environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_URL` | JDBC URL for the PostgreSQL database | `jdbc:postgresql://localhost:5432/weddinggallery` |
| `DB_USERNAME` | Database username | `wedding_user` |
| `DB_PASSWORD` | Database password | `kamisania` |
| `HIBERNATE_DDL_AUTO` | Value for `spring.jpa.hibernate.ddl-auto` | `update` |
| `JPA_SHOW_SQL` | Enable SQL logging | `true` |
| `HIBERNATE_FORMAT_SQL` | Pretty print SQL | `true` |
| `JPA_OPEN_IN_VIEW` | Open session in view | `false` |
| `FLYWAY_ENABLED` | Enable Flyway migrations | `true` |
| `FLYWAY_LOCATIONS` | Location of migration scripts | `classpath:db/migration` |
| `FLYWAY_BASELINE_ON_MIGRATE` | Allow baseline on migrate | `true` |
| `FLYWAY_BASELINE_VERSION` | Baseline version | `0` |
| `SPRING_PROFILES_ACTIVE` | Active Spring profiles | `local` |
| `JWT_SECRET` | Secret key used to sign JWT tokens (must be at least 32 characters for HMAC-SHA algorithms) | `43389e49495b043d50528eb5f7b208a597f0f3c44e7fc4add06196fc09e7a9b8` |
| `JWT_EXPIRATION_MS` | Token validity in milliseconds | `3600000` |
| `SPRING_SECURITY_LOG_LEVEL` | Security logging level | `DEBUG` |
| `LOCAL_STORAGE_PATH` | Directory for images when using the `local` profile | `photos` |
| `GCS_BUCKET` | Google Cloud Storage bucket name for the `gcs` profile | *(none)* |

The `JWT_SECRET` value should be a cryptographically secure string with at least 32 characters (256 bits) when using HMAC-SHA signing. You can generate a suitable secret with:

```bash
openssl rand -hex 32
```

The `SPRING_PROFILES_ACTIVE` variable controls which profile is active. Use `local` for filesystem storage or `gcs` to store images in Google Cloud Storage.
For more complex setups you can define additional profiles such as `dev` or `prod` and place the configuration in `src/main/resources/application-<profile>.properties`.

For convenience a `.env.dev` file is provided with sample values for local development. You can source this file or copy it to `.env` to quickly configure the application when running locally.

## Building and running

From the `weddinggallery` directory run:

```bash
./mvnw clean package       # build the jar
./mvnw spring-boot:run      # start the application
```

To execute the tests:

```bash
./mvnw test
```

## Authentication API

The application exposes a single authentication endpoint.

### POST `/api/auth/login`

Request body:
```json
{
  "username": "your username",
  "password": "your password",
  "name": "optional device name"
}
```
Optional header `X-client-Id` can be used to reuse an existing device identifier.

On success the response contains the device identifier and a JWT token:
```json
{
  "clientId": "<uuid>",
  "token": "<jwt>",
  "deviceName": "<name>"
}
```
Include this token in the `Authorization: Bearer <token>` header when calling secured endpoints.

All subsequent user endpoints require this token and the `X-Client-Id` header with the returned device identifier.

## Storage configuration

The application stores uploaded files either on the local filesystem or in
Google Cloud Storage (GCS). The default profile uses local storage. To switch to
GCS provide the `gcs` Spring profile:

```bash
SPRING_PROFILES_ACTIVE=gcs ./mvnw spring-boot:run
```

The bucket name is configured in `src/main/resources/application-gcs.properties`.
GCS credentials are resolved from the environment by the Google Cloud SDK. Set
the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to the path of a
service account JSON key file with access to the bucket:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
```


## Photo API

Endpoints related to photo management require authentication via JWT.
The `X-Client-Id` header from the login response must also be included.

### GET `/api/photos`
Retrieve all visible photos. Results are paged and sorted by upload time in descending order by default.

### POST `/api/photos`
Upload a single file using `multipart/form-data`.

Fields:
- `file` – the image to upload
- `description` – optional description

### POST `/api/photos/batch`
Upload several files at once. The request must use `multipart/form-data` with:
- `files` – one or more image files
- `descriptions` – optional descriptions matching file order

Supported file extensions: `jpg`, `jpeg`, `png`, `gif`, `bmp`, `webp`, `heic`, `mp4`, `mov`, `avi`, `mkv`, `webm`.

Include the JWT obtained from the login endpoint in the `Authorization: Bearer <token>` header.

Example single upload:
```bash
curl -X POST http://localhost:8080/api/photos \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/photo.jpg" \
  -F "description=Our photo"
```

Batch upload example:
```bash
curl -X POST http://localhost:8080/api/photos/batch \
  -H "Authorization: Bearer <token>" \
  -F "files=@/path/to/photo1.jpg" \
  -F "files=@/path/to/photo2.jpg" \
  -F "descriptions=First photo" \
  -F "descriptions=Second photo"
```

### PUT `/api/photos/{id}/visibility`
Update the visibility flag of a photo. A regular user may change only their own
photos, while an administrator can update any photo.

Request:
```json
{
  "visible": false
}
```

## Comment API

User comment endpoints require the `X-Client-Id` header in addition to the JWT token.

### POST `/api/photos/{photoId}/comments`
Create a comment for a photo.

Request:
```json
{
  "text": "Beautiful photo!"
}
```
Response:
```json
{
  "id": 1,
  "text": "Beautiful photo!",
  "createdAt": "2025-01-01T12:00:00",
  "photoId": 1,
  "deviceId": 1,
  "deviceName": "Phone"
}
```

### DELETE `/api/comments/{id}`
Deletes the comment. Returns **204 No Content** on success.

### DELETE `/api/admin/comments/{id}`
Administrative deletion of any comment. Also returns **204 No Content**.

## Reaction API

Reaction endpoints also require the `X-Client-Id` header along with the JWT token.

### POST `/api/photos/{photoId}/reactions`
Add a reaction to a photo.

Request:
```json
{
  "type": "heart"
}
```
Response:
```json
{
  "id": 1,
  "type": "heart",
  "photoId": 1,
  "deviceId": 1,
  "deviceName": "Phone"
}
```

### DELETE `/api/reactions/{id}`
Deletes the reaction. Returns **204 No Content** on success.

## WebSocket chat

Clients connect to the `/ws` STOMP endpoint. Subscribing to `/topic/chat` will
receive chat messages as they are posted. The following REST endpoints manage
chat messages. Both require the `Authorization` and `X-Client-Id` headers unless
noted otherwise.

### POST `/api/chat/messages`
Send a message that will be broadcast to `/topic/chat`.

Headers:
- `Authorization: Bearer <token>`
- `X-Client-Id: <device uuid>`

Request:
```json
{
  "text": "Hello there"
}
```
Response:
```json
{
  "id": 1,
  "username": "alice",
  "text": "Hello there",
  "createdAt": "2025-01-01T12:00:00",
  "deviceId": 1,
  "deviceName": "Phone"
}
```

### GET `/api/chat/messages`
Return a page of recent chat messages ordered by creation time. Optional query
parameters `page` and `size` control pagination. This endpoint does not require
authentication.

Response:
```json
{
  "content": [
    {
      "id": 1,
      "username": "alice",
      "text": "Hello there",
      "createdAt": "2025-01-01T12:00:00",
      "deviceId": 1,
      "deviceName": "Phone"
    }
  ]
}
```

### POST `/api/chat/messages/{messageId}/reactions`
Add an emoji reaction to a chat message.

Request:
```json
{
  "emoji": "\uD83D\uDE0A"
}
```
Response:
```json
{
  "id": 1,
  "emoji": "\uD83D\uDE0A",
  "messageId": 1,
  "deviceId": 1,
  "deviceName": "Phone"
}
```

### DELETE `/api/chat/reactions/{id}`
Deletes the reaction. Returns **204 No Content** on success.

## Error responses

Errors are returned in JSON format by `GlobalExceptionHandler`:
```json
{
  "timestamp": "2025-01-01T12:34:56.789",
  "message": "Photo not found"
}
```
Access denied results in HTTP 403, invalid input returns HTTP 400 and other errors return HTTP 500.
