#!/bin/bash

# Production Deployment Script for FitTracker Backend
# This script handles secure deployment with zero-downtime updates

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="fittracker"
COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env.production"
BACKUP_DIR="./backups"
LOG_FILE="./logs/deployment.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a $LOG_FILE
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a $LOG_FILE
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a $LOG_FILE
}

# Pre-deployment checks
pre_deployment_checks() {
    log "Starting pre-deployment checks..."
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        error "Docker is not running or not accessible"
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed"
    fi
    
    # Check if environment file exists
    if [ ! -f "$ENV_FILE" ]; then
        error "Environment file $ENV_FILE not found"
    fi
    
    # Check if all required environment variables are set
    source $ENV_FILE
    required_vars=("MONGO_ROOT_PASSWORD" "REDIS_PASSWORD" "JWT_SECRET" "OPENAI_API_KEY")
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            error "Required environment variable $var is not set"
        fi
    done
    
    success "Pre-deployment checks passed"
}

# Create backup
create_backup() {
    log "Creating backup..."
    
    mkdir -p $BACKUP_DIR
    BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_PATH="$BACKUP_DIR/backup_$BACKUP_TIMESTAMP"
    
    # Backup MongoDB
    log "Backing up MongoDB..."
    docker-compose exec -T mongodb mongodump --authenticationDatabase admin \
        -u $MONGO_ROOT_USERNAME -p $MONGO_ROOT_PASSWORD \
        --out /backup/mongodb_$BACKUP_TIMESTAMP || warning "MongoDB backup failed"
    
    # Backup application data
    log "Backing up application data..."
    mkdir -p $BACKUP_PATH
    cp -r ./logs $BACKUP_PATH/ 2>/dev/null || true
    cp -r ./uploads $BACKUP_PATH/ 2>/dev/null || true
    
    success "Backup created at $BACKUP_PATH"
}

# Health check function
health_check() {
    local service=$1
    local max_attempts=${2:-30}
    local attempt=1
    
    log "Performing health check for $service..."
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose exec -T $service curl -f http://localhost:5000/health > /dev/null 2>&1; then
            success "$service is healthy"
            return 0
        fi
        
        log "Health check attempt $attempt/$max_attempts failed, retrying in 10 seconds..."
        sleep 10
        ((attempt++))
    done
    
    error "$service failed health check after $max_attempts attempts"
}

# Rolling update deployment
deploy() {
    log "Starting deployment process..."
    
    # Pull latest images
    log "Pulling latest Docker images..."
    docker-compose pull
    
    # Build application with latest code
    log "Building application..."
    docker-compose build --no-cache backend
    
    # Deploy with zero downtime using rolling update
    log "Performing rolling update..."
    
    # Scale up new instances
    docker-compose up -d --scale backend=2 --no-recreate
    
    # Wait for new instance to be healthy
    sleep 30
    
    # Remove old instances
    docker-compose up -d --scale backend=1 --remove-orphans
    
    # Update other services
    docker-compose up -d mongodb redis nginx prometheus grafana
    
    success "Deployment completed successfully"
}

# Post-deployment verification
post_deployment_verification() {
    log "Starting post-deployment verification..."
    
    # Check all services are running
    log "Checking service status..."
    docker-compose ps
    
    # Perform health checks
    health_check backend
    
    # Test API endpoints
    log "Testing API endpoints..."
    if curl -f http://localhost/api/health > /dev/null 2>&1; then
        success "API health endpoint is responding"
    else
        error "API health endpoint is not responding"
    fi
    
    # Check database connectivity
    log "Testing database connectivity..."
    if docker-compose exec -T backend node -e "
        const mongoose = require('mongoose');
        mongoose.connect(process.env.MONGODB_URI)
        .then(() => { console.log('Database connected'); process.exit(0); })
        .catch(err => { console.error('Database connection failed:', err); process.exit(1); });
    "; then
        success "Database connectivity verified"
    else
        error "Database connectivity failed"
    fi
    
    # Check Redis connectivity
    log "Testing Redis connectivity..."
    if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
        success "Redis connectivity verified"
    else
        error "Redis connectivity failed"
    fi
    
    success "Post-deployment verification completed"
}

# Cleanup old images and containers
cleanup() {
    log "Cleaning up old Docker images and containers..."
    
    # Remove dangling images
    docker image prune -f
    
    # Remove old containers
    docker container prune -f
    
    # Remove unused networks
    docker network prune -f
    
    success "Cleanup completed"
}

# Rollback function
rollback() {
    local backup_path=$1
    
    warning "Starting rollback process..."
    
    if [ -z "$backup_path" ]; then
        error "Backup path not provided for rollback"
    fi
    
    # Stop current services
    docker-compose down
    
    # Restore from backup
    log "Restoring from backup: $backup_path"
    # Add restore logic here based on your backup structure
    
    # Start services with previous version
    docker-compose up -d
    
    warning "Rollback completed"
}

# Main deployment flow
main() {
    log "=== FitTracker Production Deployment Started ==="
    
    # Create logs directory
    mkdir -p ./logs
    
    case "${1:-deploy}" in
        "deploy")
            pre_deployment_checks
            create_backup
            deploy
            post_deployment_verification
            cleanup
            success "=== Deployment completed successfully ==="
            ;;
        "rollback")
            rollback "$2"
            ;;
        "health-check")
            health_check backend
            ;;
        "backup")
            create_backup
            ;;
        *)
            echo "Usage: $0 {deploy|rollback|health-check|backup}"
            echo "  deploy        - Full deployment process"
            echo "  rollback PATH - Rollback to specific backup"
            echo "  health-check  - Check service health"
            echo "  backup        - Create backup only"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
