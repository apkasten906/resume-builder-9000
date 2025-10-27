#!/usr/bin/env bash

# Resume Builder 9000 - Docker Management Script
# Provides easy commands for managing Docker containers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to build production images
build_production() {
    print_status "Building production images..."

    # Build API image
    print_status "Building API production image..."
    docker build -f Dockerfile.production --target api-runtime -t rb9k-api:latest .

    # Build Web image
    print_status "Building Web production image..."
    docker build -f Dockerfile.production --target web-runtime -t rb9k-web:latest .

    print_success "Production images built successfully!"
}

# Function to build development images
build_development() {
    print_status "Building development images..."

    # Build API dev image
    print_status "Building API development image..."
    docker build -f Dockerfile.development --target api-dev -t rb9k-api-dev:latest .

    # Build Web dev image
    print_status "Building Web development image..."
    docker build -f Dockerfile.development --target web-dev -t rb9k-web-dev:latest .

    print_success "Development images built successfully!"
}

# Function to start production environment
start_production() {
    print_status "Starting production environment..."

    # Create data directories
    mkdir -p ./data/api ./data/uploads

    # Set proper permissions
    chmod 755 ./data/api ./data/uploads

    docker-compose up -d

    print_success "Production environment started!"
    print_status "API: http://localhost:4000"
    print_status "Web: http://localhost:3000"
}

# Function to start development environment
start_development() {
    print_status "Starting development environment..."

    docker-compose -f docker-compose.dev.yml up -d

    print_success "Development environment started!"
    print_status "API: http://localhost:4000 (Debug: 9229)"
    print_status "Web: http://localhost:3000"
}

# Function to stop all containers
stop() {
    print_status "Stopping all containers..."

    docker-compose down
    docker-compose -f docker-compose.dev.yml down

    print_success "All containers stopped!"
}

# Function to clean up everything
cleanup() {
    print_warning "This will remove all containers, images, and volumes. Are you sure? (y/N)"
    read -r response

    if [[ "$response" =~ ^[Yy]$ ]]; then
        print_status "Cleaning up containers and images..."

        # Stop and remove containers
        docker-compose down -v
        docker-compose -f docker-compose.dev.yml down -v

        # Remove images
        docker rmi rb9k-api:latest rb9k-web:latest rb9k-api-dev:latest rb9k-web-dev:latest 2>/dev/null || true

        # Remove volumes
        docker volume prune -f

        print_success "Cleanup completed!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Function to show logs
logs() {
    local service="${2:-}"
    local env="${1:-production}"

    if [ "$env" = "dev" ]; then
        if [ -n "$service" ]; then
            docker-compose -f docker-compose.dev.yml logs -f "$service"
        else
            docker-compose -f docker-compose.dev.yml logs -f
        fi
    else
        if [ -n "$service" ]; then
            docker-compose logs -f "$service"
        else
            docker-compose logs -f
        fi
    fi
}

# Function to show help
show_help() {
    echo "Resume Builder 9000 - Docker Management Script"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  build-prod          Build production images"
    echo "  build-dev           Build development images"
    echo "  start-prod          Start production environment"
    echo "  start-dev           Start development environment"
    echo "  stop                Stop all containers"
    echo "  restart-prod        Restart production environment"
    echo "  restart-dev         Restart development environment"
    echo "  logs [env] [service] Show logs (env: prod|dev, service: api|web)"
    echo "  status              Show container status"
    echo "  cleanup             Remove all containers, images, and volumes"
    echo "  help                Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 build-prod       # Build production images"
    echo "  $0 start-dev        # Start development environment"
    echo "  $0 logs dev api     # Show API logs in development"
    echo "  $0 status           # Show container status"
}

# Function to show status
show_status() {
    print_status "Container Status:"
    echo ""
    docker ps -a --filter "name=rb9k" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    print_status "Image Status:"
    docker images --filter "reference=rb9k*" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"
}

# Main script logic
main() {
    check_docker

    case "${1:-}" in
        "build-prod")
            build_production
            ;;
        "build-dev")
            build_development
            ;;
        "start-prod")
            start_production
            ;;
        "start-dev")
            start_development
            ;;
        "stop")
            stop
            ;;
        "restart-prod")
            stop
            start_production
            ;;
        "restart-dev")
            stop
            start_development
            ;;
        "logs")
            logs "$2" "$3"
            ;;
        "status")
            show_status
            ;;
        "cleanup")
            cleanup
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            print_error "Unknown command: ${1:-}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
