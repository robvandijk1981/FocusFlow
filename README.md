> [!NOTE]
> This is the backend server for the FocusFlow application. For frontend integration instructions, please see [`frontend-integration/INTEGRATION_GUIDE.md`](./frontend-integration/INTEGRATION_GUIDE.md).

# FocusFlow API Server

This repository contains the complete backend API server for the **FocusFlow** task management application. It provides a robust, scalable, and production-ready solution for managing projects, goals, and tasks with support for multi-device synchronization.

The server is built with Node.js, Express, and Prisma, offering a modern and type-safe codebase.

## Features

- **RESTful API**: A complete set of endpoints for managing your data.
- **Persistent Storage**: Uses PostgreSQL for production and SQLite for easy development setup.
- **Type-Safe**: Built with TypeScript and Prisma for a reliable and maintainable codebase.
- **Offline-First Sync**: Includes a sync endpoint to support offline-first clients and conflict resolution.
- **Soft Deletes**: Data is never permanently deleted, allowing for recovery.
- **Containerized**: Comes with a `Dockerfile` and `docker-compose.yml` for easy deployment.
- **Comprehensive Documentation**: Includes API documentation, examples, and deployment guides.
- **Future-Ready**: The codebase is structured to easily add authentication and other features.

## Tech Stack

- **Backend**: [Node.js](https://nodejs.org/) with [Express](https://expressjs.com/) and [TypeScript](https://www.typescriptlang.org/)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (production) / [SQLite](https://www.sqlite.org/) (development)
- **Validation**: [Zod](https://zod.dev/)
- **Containerization**: [Docker](https://www.docker.com/)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/download/) (v18 or higher)
- [pnpm](https://pnpm.io/installation)
- [Docker](https://docs.docker.com/get-docker/) (for containerized deployment)

### Local Development (SQLite)

This is the quickest way to get the server running locally.

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd focusflow-backend
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Set up the database:**

    This will create an initial migration and seed the database with sample data.

    ```bash
    # Create the database schema
    pnpm prisma migrate dev --name init

    # Seed the database with sample data
    pnpm prisma:seed
    ```

4.  **Start the development server:**

    ```bash
    pnpm dev
    ```

The server will be running at `http://localhost:3001`.

### Local Development (Docker with PostgreSQL)

This method uses Docker to run the server and a PostgreSQL database, simulating a production environment.

1.  **Start the services:**

    ```bash
    docker-compose up -d --build
    ```

2.  **Check the logs:**

    ```bash
    docker-compose logs -f api
    ```

The server will be available at `http://localhost:3001`, and the PostgreSQL database will be at `localhost:5432`.

3.  **To stop the services:**

    ```bash
    docker-compose down
    ```

## API Endpoints

A summary of the available API endpoints. For full details, see the [API Documentation](./docs/API_DOCUMENTATION.md).

| Method | Endpoint              | Description                                      |
| :----- | :-------------------- | :----------------------------------------------- |
| `GET`  | `/api/health`         | Health check                                     |
| `POST` | `/api/sync`           | Sync local state with server                     |
| `GET`  | `/api/projects`       | List all projects with goals and tasks           |
| `POST` | `/api/projects`       | Create a new project                             |
| `PUT`  | `/api/projects/:id`   | Update a project                                 |
| `DELETE`| `/api/projects/:id`   | Delete a project                                 |
| `GET`  | `/api/goals`          | List all goals (filter by `projectId`)           |
| `POST` | `/api/goals`          | Create a new goal                                |
| `PUT`  | `/api/goals/:id`      | Update a goal                                    |
| `DELETE`| `/api/goals/:id`      | Delete a goal                                    |
| `GET`  | `/api/tasks`          | List all tasks (with filters)                    |
| `GET`  | `/api/tasks/today`    | Get all tasks marked for Today's Focus           |
| `POST` | `/api/tasks`          | Create a new task                                |
| `PUT`  | `/api/tasks/:id`      | Update a task                                    |
| `DELETE`| `/api/tasks/:id`      | Delete a task                                    |

## Deployment

This server is designed to be deployed on any platform that supports Node.js or Docker containers, such as Railway, Render, Heroku, or AWS.

### Using Docker

1.  **Build the Docker image:**

    ```bash
    docker build -t your-username/focusflow-backend .
    ```

2.  **Push to a container registry:**

    ```bash
    docker push your-username/focusflow-backend
    ```

3.  **Configure Environment Variables:**

    On your hosting platform, set the following environment variables:

    -   `NODE_ENV=production`
    -   `PORT=...` (your platform will likely set this automatically)
    -   `DATABASE_URL=...` (URL for your managed PostgreSQL database)
    -   `CORS_ORIGINS=https://your-frontend-domain.com`

4.  **Deploy the container** from the image you pushed.

### Using Node.js

1.  **Build the project:**

    ```bash
    pnpm build
    ```

2.  **Deploy the following files/folders:**

    -   `dist/`
    -   `node_modules/`
    -   `package.json`
    -   `prisma/`

3.  **Configure Environment Variables** as described above.

4.  **Run database migrations** on your production database:

    ```bash
    pnpm prisma migrate deploy
    ```

5.  **Start the server:**

    ```bash
    pnpm start
    ```

## Project Structure

```
focusflow-backend/
├── prisma/               # Prisma schema, migrations, and seed script
├── src/
│   ├── controllers/      # Request handlers for each route
│   ├── middleware/       # Express middleware (CORS, logger)
│   ├── routes/           # API route definitions
│   └── utils/            # Shared utilities (Prisma client, validation, errors)
├── frontend-integration/ # Code and guide for frontend integration
├── docs/                 # API documentation and examples
├── tests/                # (Future) Test files
├── .env.example          # Environment variable template
├── Dockerfile            # For building production Docker images
├── docker-compose.yml    # For local development with PostgreSQL
├── package.json          # Project dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
