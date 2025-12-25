# Docker Configuration Guide

This guide explains how to run the SPAGHETTI backend using Docker.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

## Quick Start

### 1. Environment Setup

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:

```env
ANTHROPIC_API_KEY=your_actual_api_key_here
PORT=3000
NODE_ENV=production
```

### 2. Using Docker Compose (Recommended)

Build and start the backend:

```bash
docker-compose up -d
```

Or use the npm script:

```bash
cd backend
npm run docker:prod
```

View logs:

```bash
docker-compose logs -f backend
# or
npm run docker:logs
```

Stop the service:

```bash
docker-compose down
# or
npm run docker:stop
```

### 3. Using Docker Directly

Build the image:

```bash
cd backend
docker build -t spaghetti-backend .
# or
npm run docker:build
```

Run the container:

```bash
docker run -p 3000:3000 \
  -e ANTHROPIC_API_KEY=your_api_key \
  -v spaghetti-data:/app/data \
  spaghetti-backend
# or
npm run docker:run
```

## Available NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run docker:build` | Build the Docker image |
| `npm run docker:run` | Run the container directly |
| `npm run docker:dev` | Start with docker-compose (with rebuild) |
| `npm run docker:prod` | Start in production mode (detached) |
| `npm run docker:stop` | Stop and remove containers |
| `npm run docker:logs` | View container logs |

## Configuration

### Environment Variables

- `NODE_ENV`: Set to `production` for production builds
- `PORT`: Server port (default: 3000)
- `ANTHROPIC_API_KEY`: Your Anthropic API key (required)

### Volume Mounts

The docker-compose configuration creates persistent volumes for:

- `/app/data`: SQLite database storage
- `/app/uploads`: User-uploaded files

### Resource Limits

Default resource limits (can be adjusted in docker-compose.yml):

- CPU: 0.5-1.0 cores
- Memory: 256MB-512MB

## Health Checks

The container includes a built-in health check that polls `/health` endpoint every 30 seconds.

Check health status:

```bash
docker ps
# or
docker inspect spaghetti-backend | grep Health -A 5
```

## Multi-Stage Build

The Dockerfile uses a multi-stage build process:

1. **Builder Stage**: Installs dependencies, compiles TypeScript
2. **Production Stage**: Copies only necessary files, runs as non-root user

Benefits:
- Smaller final image size
- Improved security (non-root user)
- Faster builds with layer caching

## Production Deployment

### Security Best Practices

1. Always use secrets management for API keys (not .env files)
2. Run containers with read-only root filesystem when possible
3. Use Docker secrets or Kubernetes secrets for sensitive data
4. Regularly update base images for security patches

### Example with Docker Secrets

```bash
# Create a secret
echo "your_api_key" | docker secret create anthropic_key -

# Update docker-compose.yml to use secrets
# Then run:
docker stack deploy -c docker-compose.yml spaghetti
```

### Monitoring

Access application logs:

```bash
docker-compose logs -f backend
```

Check resource usage:

```bash
docker stats spaghetti-backend
```

## Troubleshooting

### Container won't start

Check logs:
```bash
docker-compose logs backend
```

### Port already in use

Change the port mapping in docker-compose.yml:
```yaml
ports:
  - "3001:3000"  # Use port 3001 on host
```

### Permission issues

The container runs as user `nodejs` (UID 1001). Ensure volume permissions are correct:

```bash
sudo chown -R 1001:1001 ./data
```

### Build fails

Clear Docker cache and rebuild:
```bash
docker-compose build --no-cache
```

## Development vs Production

### Development

```bash
npm run docker:dev
```

- Auto-rebuilds on changes
- Verbose logging
- Source maps enabled

### Production

```bash
npm run docker:prod
```

- Optimized build
- Minimal logging
- Runs in detached mode
- Resource limits enforced

## Network Configuration

The backend is accessible on:

- Host: `http://localhost:3000`
- Container network: `spaghetti-network`

To connect other services, add them to the same network in docker-compose.yml.

## Cleanup

Remove containers, volumes, and images:

```bash
# Stop and remove containers
docker-compose down

# Remove volumes
docker-compose down -v

# Remove images
docker rmi spaghetti-backend:latest
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
