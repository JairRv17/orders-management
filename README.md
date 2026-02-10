# Hiberus Technical Test

API REST for product and order management.

## Requirements

- Docker
- Docker Compose

## Installation

```bash
# Start containers
docker-compose up -d

# Install dependencies
docker exec symfony_php composer install

# Run migrations
docker exec symfony_php php bin/console doctrine:migrations:migrate --no-interaction
```

## Access

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080/api |
| API Documentation | http://localhost:8080/api/doc |

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | superadmin@example.com | superadminxd |
| Customer | customer@example.com | customerxd |

## API Documentation

Access the Swagger UI documentation:
```
http://localhost:8080/api/doc
```

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/products` | Create product |
| GET | `/api/products` | List products |
| POST | `/api/orders` | Create order |
| GET | `/api/orders/{id}` | View order |
| POST | `/api/orders/{id}/checkout` | Pay order |

## Unit Tests

```bash
# Run all tests
docker exec symfony_php php bin/phpunit tests/Unit

```

### Expected result:
```
OK (34 tests, 73 assertions)
```

## Project Structure

```
backend/
├── src/
│   ├── Controller/Api/     # REST Controllers
│   ├── Entity/             # Doctrine Entities
│   ├── Repository/         # Repositories
│   └── Application/        # Application Services
└── tests/Unit/             # Unit Tests
```

## Technologies

- PHP 8.3
- Symfony 7.4
- Doctrine ORM
- PHPUnit 12
- Docker

## Frontend

The React frontend runs on port 5173: `http://localhost:5173`

### Technologies:
- React 19
- React Router v7
- TypeScript
- Tailwind CSS v4
- Vite 7
- Axios
