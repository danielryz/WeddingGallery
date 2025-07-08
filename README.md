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
| `JWT_SECRET` | Secret key used to sign JWT tokens | *(none)* |
| `JWT_EXPIRATION_MS` | Token validity in milliseconds | `3600000` |
| `SPRING_SECURITY_LOG_LEVEL` | Security logging level | `DEBUG` |
| `LOCAL_STORAGE_PATH` | Directory for images when using the `local` profile | `photos` |
| `GCS_BUCKET` | Google Cloud Storage bucket name for the `gcs` profile | *(none)* |

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

