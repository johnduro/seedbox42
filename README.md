# Seedbox42

A dockerized seedbox application featuring an Angular frontend and a Node.js backend.

## Deployment

This guide assumes you have Docker and Docker Compose installed on your machine.

### Installation

1.  **Create Environment File**
    Create the `.env` file from the example.
    ```bash
    cp .env.example .env
    ```
	Edit the newly created `.env` file with the correct values.

2.  **Set Environment Variables**
    Export your current user ID and group ID to ensure file permissions are correct for the mounted volumes.
    ```bash
    export UID=$(id -u)
    export GID=$(id -g)
    ```

3.  **Prepare Environment Configuration**
    Copy the environment configuration file for production.
    ```bash
    cp angular/teurpitorrent/src/environments/environment.ts angular/teurpitorrent/src/environments/environment.prod.ts
    ```
    You can edit `angular/teurpitorrent/src/environments/environment.prod.ts` if specific changes are needed.

4.  **Build the Containers**
    Build the Docker images with your user permissions.
    ```bash
    docker compose -f compose-prod.yaml build --build-arg UID=${UID} --build-arg GID=${GID}
    ```

5.  **Generate Configuration**
    Run the configuration generator. You might need to run this twice if the database takes time to initialize.
    ```bash
    docker compose -f compose-prod.yaml run --rm -it seedbox node ttManager.js --generate-conf
    ```
    
    Follow the interactive prompts with these recommended values:
    *   **Port**: `3000`
    *   **Secret**: (Enter a strong secret for password encoding)
    *   **Mongo Database Address**: `mongodb` (deprecated)
    *   **Database Name**: `seedapp` (deprecated)
    *   **Transmission Client Address**: `transmission`
    *   **Transmission Port**: `9091`
    *   **Transmission RPC URL**: `/transmission/rpc`
    *   **Download Directory**: `/downloads` (Leave blank to use default, or specify `/downloads`) (deprecated)

6.  **Create a User**
    Create an initial user to access the application.
    ```bash
    docker compose -f compose-prod.yaml run --rm -it seedbox node ttManager.js --create-user
    ```

7.  **Start the Application**
    Start the services in detached mode.
    ```bash
    docker compose -f compose-prod.yaml up -d
    ```

### Update

To update the application when it is already running:

1.  **Stop the containers**
    ```bash
    docker compose -f compose-prod.yaml stop
    ```

2.  **Pull the latest changes**
    ```bash
    git pull
    ```

3.  **Rebuild the containers**
    Ensure your `UID` and `GID` variables are set (or export them again).
    ```bash
    export UID=$(id -u)
    export GID=$(id -g)
    docker compose -f compose-prod.yaml build --build-arg UID=${UID} --build-arg GID=${GID}
    ```

4.  **Start the application**
    ```bash
    docker compose -f compose-prod.yaml up -d
    ```

## Management

### User Management

**Create a new user:**
```bash
docker compose -f compose-prod.yaml run --rm -it seedbox node ttManager.js --create-user
```

**Modify an existing user:**
```bash
docker compose -f compose-prod.yaml run --rm -it seedbox node ttManager.js --modify-user
```

### Configuration

**Regenerate configuration:**
```bash
docker compose -f compose-prod.yaml run --rm -it seedbox node ttManager.js --generate-conf
```

## Development

To work on the application (Angular frontend or Node.js backend) without rebuilding everything constantly, use the development docker compose file.

### Start Development Environment

```bash
docker compose up
```

This will start the services with source code mounted into the containers:

*   **Frontend (Angular)**: Accessible at `http://localhost:4200`.
    *   The source code in `angular/teurpitorrent` is mounted.
    *   Changes to the code will trigger a live reload.
*   **Backend (Node.js)**: Accessible at `http://localhost:3000`.
    *   The source code in `src` is mounted.
*   **Database (MongoDB)**: Accessible on port `27017`.
*   **Transmission**: Accessible on port `9091`.

### Working on Angular

The Angular application is served using `ng serve` inside the container. You can edit files in `angular/teurpitorrent/src` and the browser will automatically reload to reflect your changes.
