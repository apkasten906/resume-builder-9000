# Resume Builder 9000 - Docker Deployment Guide

This guide explains how to deploy Resume Builder 9000 using Docker containers, optimized for production use without Playwright dependencies.

## Quick Start

### Prerequisites

- Docker 20.10+ and Docker Compose 2.0+
- At least 2GB RAM available for containers
- Ports 3000 and 4000 available on your host

### Production Deployment

1. **Clone and setup environment:**

   ```bash
   git clone <repository-url>
   cd resume-builder-9000
   cp .env.example .env
   ```

2. **Configure environment variables:**
   Edit `.env` file with your production settings (see [Environment Configuration](#environment-configuration))

3. **Start production environment:**

   ```bash
   # Using management script (recommended)
   ./docker-manage.sh build-prod
   ./docker-manage.sh start-prod

   # Or using docker-compose directly
   docker-compose up -d
   ```

4. **Access the application:**
   - Web Frontend: http://localhost:3000
   - API Backend: http://localhost:4000
   - API Health Check: http://localhost:4000/health

## Management Scripts

### Unix/Linux/macOS

```bash
# Build images
./docker-manage.sh build-prod     # Production images
./docker-manage.sh build-dev      # Development images

# Start/stop services
./docker-manage.sh start-prod     # Start production
./docker-manage.sh start-dev      # Start development
./docker-manage.sh stop           # Stop all containers

# Monitoring
./docker-manage.sh status         # Show container status
./docker-manage.sh logs           # Show all logs
./docker-manage.sh logs prod api  # Show API logs (production)

# Maintenance
./docker-manage.sh cleanup        # Remove all containers and images
```

### Windows PowerShell

```powershell
# Build images
.\docker-manage.ps1 -Command build-prod
.\docker-manage.ps1 -Command build-dev

# Start/stop services
.\docker-manage.ps1 -Command start-prod
.\docker-manage.ps1 -Command start-dev
.\docker-manage.ps1 -Command stop

# Monitoring
.\docker-manage.ps1 -Command status
.\docker-manage.ps1 -Command logs -Environment prod -Service api

# Maintenance
.\docker-manage.ps1 -Command cleanup
```

## Architecture Overview

### Multi-Stage Production Build

The production Dockerfile uses an optimized multi-stage build:

1. **Base Dependencies** - Common package files and workspace setup
2. **Production Dependencies** - Only runtime dependencies (no dev tools)
3. **Build Dependencies** - Full dependencies for building
4. **Core Builder** - Builds the shared @rb9k/core package
5. **API Builder** - Builds the Express API service
6. **Web Builder** - Builds the Next.js frontend
7. **API Runtime** - Minimal API production image
8. **Web Runtime** - Minimal Web production image

### Security Features

- **Non-root user execution** - Containers run as unprivileged users
- **Minimal base images** - Alpine Linux for smaller attack surface
- **Secret management** - Environment-based configuration
- **Health checks** - Built-in health monitoring
- **Resource limits** - CPU and memory constraints

## Environment Configuration

### Required Variables

```bash
# Authentication (CHANGE IN PRODUCTION!)
JWT_SECRET=your-super-secure-jwt-secret-key
NEXTAUTH_SECRET=your-super-secure-nextauth-secret

# API Configuration
API_BASE=http://localhost:4000
CORS_ORIGIN=http://localhost:3000

# Web Configuration
WEB_BASE=http://localhost:3000
NEXT_PUBLIC_WEB_BASE=http://localhost:3000
```

### Optional Variables

```bash
# Email service (for notifications)
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Logging
LOG_LEVEL=info  # debug, info, warn, error

# Database
DATABASE_URL=/app/data/resume.db
```

## Development Environment

For development with hot reload and debugging:

```bash
# Start development environment
./docker-manage.sh build-dev
./docker-manage.sh start-dev

# Access services
# Web: http://localhost:3000 (hot reload enabled)
# API: http://localhost:4000 (hot reload enabled)
# API Debugger: localhost:9229 (Node.js debugging)
```

### Development Features

- **Hot reload** - Code changes trigger automatic rebuilds
- **Source mapping** - Proper debugging support
- **Development tools** - Additional debugging utilities
- **Volume mounts** - Source code mounted for live editing

## Persistent Data

### Production Data Volumes

- **API Database**: `./data/api/` - SQLite database storage
- **File Uploads**: `./data/uploads/` - User-uploaded files

### Backup Recommendations

```bash
# Backup database
docker exec rb9k-api cp /app/data/resume.db /tmp/
docker cp rb9k-api:/tmp/resume.db ./backup/

# Backup uploads
docker cp rb9k-api:/app/uploads ./backup/uploads
```

## Monitoring and Health Checks

### Built-in Health Checks

Both services include health check endpoints:

- **API Health**: `GET /health` - Returns service status
- **Web Health**: `GET /api/health` - Returns frontend status

### Container Health Status

```bash
# Check container health
docker ps --format "table {{.Names}}\t{{.Status}}"

# View health check logs
docker inspect rb9k-api --format='{{.State.Health.Log}}'
```

### Resource Monitoring

```bash
# Monitor resource usage
docker stats rb9k-api rb9k-web

# View container logs
docker logs -f rb9k-api
docker logs -f rb9k-web
```

## Troubleshooting

### Common Issues

1. **Port conflicts**

   ```bash
   # Check what's using the ports
   netstat -tulpn | grep :3000
   netstat -tulpn | grep :4000

   # Change ports in docker-compose.yml if needed
   ```

2. **Permission issues**

   ```bash
   # Create data directories with proper permissions
   sudo mkdir -p ./data/api ./data/uploads
   sudo chown -R 1001:1001 ./data/
   ```

3. **Memory issues**

   ```bash
   # Check available memory
   docker system df

   # Clean up unused resources
   docker system prune -f
   ```

### Log Analysis

```bash
# API logs
docker logs rb9k-api --tail 100 -f

# Web logs
docker logs rb9k-web --tail 100 -f

# All services
docker-compose logs -f --tail 100
```

### Database Issues

```bash
# Access database directly
docker exec -it rb9k-api sqlite3 /app/data/resume.db

# Check database file permissions
docker exec rb9k-api ls -la /app/data/
```

## Production Deployment Checklist

- [ ] Environment variables configured with strong secrets
- [ ] CORS origins set to production domains
- [ ] SSL/TLS termination configured (reverse proxy)
- [ ] Database backups scheduled
- [ ] Log rotation configured
- [ ] Monitoring and alerting set up
- [ ] Resource limits appropriate for your infrastructure
- [ ] Health checks verified
- [ ] Security scanning completed

## Scaling and High Availability

### Horizontal Scaling

```yaml
# Add to docker-compose.yml for multiple API instances
services:
  api:
    deploy:
      replicas: 3
      restart_policy:
        condition: on-failure
```

### Load Balancing

Use a reverse proxy like Nginx or Traefik to distribute traffic across multiple instances.

### Database Considerations

- SQLite is suitable for single-instance deployments
- For high availability, consider migrating to PostgreSQL or MySQL
- Implement database connection pooling for better performance

## Security Best Practices

1. **Never use default secrets in production**
2. **Use environment variables for all configuration**
3. **Enable container resource limits**
4. **Regularly update base images**
5. **Implement proper backup and recovery procedures**
6. **Use HTTPS in production (configure reverse proxy)**
7. **Monitor container logs for security events**

## Performance Optimization

### Image Size Optimization

- Multi-stage builds reduce final image size by ~70%
- Alpine Linux base images are significantly smaller
- Production images exclude all development dependencies

### Runtime Performance

- Health checks ensure service availability
- Resource limits prevent resource exhaustion
- Non-root execution improves security
- Proper signal handling with dumb-init

## Support

For issues specific to Docker deployment:

1. Check the [troubleshooting section](#troubleshooting)
2. Review container logs using the management scripts
3. Verify environment configuration
4. Ensure Docker and Docker Compose versions meet requirements

For application-specific issues, refer to the main project documentation.
