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
  "name": "optional device name",
  "clientId": "existing device id or null"
}
```

On success the response contains the device identifier and a JWT token:
```json
{
  "clientId": "<uuid>",
  "token": "<jwt>"
}
```
Include this token in the `Authorization: Bearer <token>` header when calling secured endpoints.

Default users are created by Flyway migrations (e.g. `Ania_Kamil_2025` and `admin`).

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

