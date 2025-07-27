#!/bin/bash

# FitTracker Pro - Production Deployment Script
# This script automates the deployment of FitTracker Pro to production

set -euo pipefail

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(dirname "${SCRIPT_DIR}")"
readonly DOCKER_IMAGE="fittrackerpro/backend"
readonly KUBE_NAMESPACE="fittracker-prod"
readonly AWS_REGION="${AWS_REGION:-us-east-1}"
readonly EKS_CLUSTER_NAME="${EKS_CLUSTER_NAME:-fittracker-prod}"

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Error handling
trap 'log_error "Deployment failed on line $LINENO"' ERR

# Help function
show_help() {
    cat << EOF
FitTracker Pro Deployment Script

Usage: $0 [OPTIONS] COMMAND

Commands:
    deploy      Deploy the application to production
    rollback    Rollback to previous version
    status      Check deployment status
    logs        View application logs
    test        Run smoke tests

Options:
    -h, --help              Show this help message
    -v, --version VERSION   Deploy specific version (default: latest)
    -n, --namespace NAME    Kubernetes namespace (default: fittracker-prod)
    --dry-run              Show what would be deployed without executing
    --skip-tests           Skip smoke tests after deployment
    --force                Force deployment even if health checks fail

Examples:
    $0 deploy                           # Deploy latest version
    $0 deploy -v v1.2.3                # Deploy specific version
    $0 deploy --dry-run                # Show deployment plan
    $0 rollback                         # Rollback to previous version
    $0 status                           # Check current status
    $0 logs -f                          # Follow logs

EOF
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    local missing_tools=()
    
    command -v docker >/dev/null 2>&1 || missing_tools+=("docker")
    command -v kubectl >/dev/null 2>&1 || missing_tools+=("kubectl")
    command -v aws >/dev/null 2>&1 || missing_tools+=("aws")
    command -v helm >/dev/null 2>&1 || missing_tools+=("helm")
    
    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        log_error "Missing required tools: ${missing_tools[*]}"
        log_info "Please install the missing tools and try again"
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity >/dev/null 2>&1; then
        log_error "AWS credentials not configured or invalid"
        exit 1
    fi
    
    # Check kubectl context
    if ! kubectl cluster-info >/dev/null 2>&1; then
        log_warning "kubectl not connected to cluster, attempting to configure..."
        aws eks update-kubeconfig --region "${AWS_REGION}" --name "${EKS_CLUSTER_NAME}"
    fi
    
    log_success "Prerequisites check passed"
}

# Build and push Docker image
build_and_push() {
    local version="${1:-latest}"
    local image_tag="${DOCKER_IMAGE}:${version}"
    
    log_info "Building Docker image: ${image_tag}"
    
    cd "${PROJECT_ROOT}"
    
    # Build image
    docker build -f Dockerfile.prod -t "${image_tag}" .
    
    # Run security scan
    if command -v trivy >/dev/null 2>&1; then
        log_info "Running security scan..."
        trivy image --exit-code 1 --severity HIGH,CRITICAL "${image_tag}"
    else
        log_warning "Trivy not found, skipping security scan"
    fi
    
    # Push image
    log_info "Pushing image to registry..."
    docker push "${image_tag}"
    
    log_success "Image built and pushed: ${image_tag}"
}

# Deploy to Kubernetes
deploy_to_k8s() {
    local version="${1:-latest}"
    local dry_run="${2:-false}"
    local skip_tests="${3:-false}"
    
    local image_tag="${DOCKER_IMAGE}:${version}"
    local dry_run_flag=""
    
    if [[ "${dry_run}" == "true" ]]; then
        dry_run_flag="--dry-run=client"
        log_info "DRY RUN MODE - No actual changes will be made"
    fi
    
    log_info "Deploying to Kubernetes namespace: ${KUBE_NAMESPACE}"
    
    # Create namespace if it doesn't exist
    kubectl create namespace "${KUBE_NAMESPACE}" ${dry_run_flag} --dry-run=client -o yaml | kubectl apply -f -
    
    # Apply storage configuration
    log_info "Applying storage configuration..."
    kubectl apply -f "${PROJECT_ROOT}/k8s/storage.yaml" -n "${KUBE_NAMESPACE}" ${dry_run_flag}
    
    # Update deployment with new image
    log_info "Updating deployment with image: ${image_tag}"
    kubectl set image deployment/fittracker-backend backend="${image_tag}" -n "${KUBE_NAMESPACE}" ${dry_run_flag}
    
    # Apply all Kubernetes manifests
    log_info "Applying Kubernetes manifests..."
    kubectl apply -f "${PROJECT_ROOT}/k8s/" -n "${KUBE_NAMESPACE}" ${dry_run_flag}
    
    if [[ "${dry_run}" == "false" ]]; then
        # Wait for rollout to complete
        log_info "Waiting for deployment rollout..."
        kubectl rollout status deployment/fittracker-backend -n "${KUBE_NAMESPACE}" --timeout=600s
        
        # Check pod status
        log_info "Checking pod status..."
        kubectl get pods -n "${KUBE_NAMESPACE}" -l app=fittracker-backend
        
        # Run smoke tests
        if [[ "${skip_tests}" == "false" ]]; then
            run_smoke_tests
        fi
    fi
    
    log_success "Deployment completed successfully"
}

# Run smoke tests
run_smoke_tests() {
    log_info "Running smoke tests..."
    
    # Get service endpoint
    local service_url
    if kubectl get ingress fittracker-ingress -n "${KUBE_NAMESPACE}" >/dev/null 2>&1; then
        service_url="https://$(kubectl get ingress fittracker-ingress -n "${KUBE_NAMESPACE}" -o jsonpath='{.spec.rules[0].host}')"
    else
        # Use port-forward for testing
        kubectl port-forward -n "${KUBE_NAMESPACE}" svc/fittracker-backend-service 8080:80 &
        local port_forward_pid=$!
        service_url="http://localhost:8080"
        sleep 5
    fi
    
    # Health check
    local max_attempts=30
    local attempt=1
    
    while [[ ${attempt} -le ${max_attempts} ]]; do
        log_info "Health check attempt ${attempt}/${max_attempts}"
        
        if curl -f -s "${service_url}/api/health" >/dev/null 2>&1; then
            log_success "Health check passed"
            break
        fi
        
        if [[ ${attempt} -eq ${max_attempts} ]]; then
            log_error "Health check failed after ${max_attempts} attempts"
            
            # Kill port-forward if it was started
            [[ -n "${port_forward_pid:-}" ]] && kill "${port_forward_pid}" 2>/dev/null || true
            
            return 1
        fi
        
        sleep 10
        ((attempt++))
    done
    
    # Additional API tests
    log_info "Testing API endpoints..."
    
    # Test endpoints
    local endpoints=(
        "/api/health"
        "/api/health/ready"
        "/api/v1/auth/status"
    )
    
    for endpoint in "${endpoints[@]}"; do
        if curl -f -s "${service_url}${endpoint}" >/dev/null 2>&1; then
            log_success "✓ ${endpoint}"
        else
            log_warning "✗ ${endpoint} - may require authentication"
        fi
    done
    
    # Kill port-forward if it was started
    [[ -n "${port_forward_pid:-}" ]] && kill "${port_forward_pid}" 2>/dev/null || true
    
    log_success "Smoke tests completed"
}

# Rollback deployment
rollback_deployment() {
    log_info "Rolling back deployment..."
    
    # Get rollout history
    kubectl rollout history deployment/fittracker-backend -n "${KUBE_NAMESPACE}"
    
    # Rollback to previous version
    kubectl rollout undo deployment/fittracker-backend -n "${KUBE_NAMESPACE}"
    
    # Wait for rollback to complete
    kubectl rollout status deployment/fittracker-backend -n "${KUBE_NAMESPACE}" --timeout=300s
    
    log_success "Rollback completed"
}

# Check deployment status
check_status() {
    log_info "Checking deployment status..."
    
    echo "=== Deployments ==="
    kubectl get deployments -n "${KUBE_NAMESPACE}"
    
    echo -e "\n=== Pods ==="
    kubectl get pods -n "${KUBE_NAMESPACE}"
    
    echo -e "\n=== Services ==="
    kubectl get services -n "${KUBE_NAMESPACE}"
    
    echo -e "\n=== Ingress ==="
    kubectl get ingress -n "${KUBE_NAMESPACE}" 2>/dev/null || echo "No ingress found"
    
    echo -e "\n=== HPA ==="
    kubectl get hpa -n "${KUBE_NAMESPACE}" 2>/dev/null || echo "No HPA found"
    
    echo -e "\n=== Recent Events ==="
    kubectl get events -n "${KUBE_NAMESPACE}" --sort-by=.metadata.creationTimestamp | tail -10
}

# View logs
view_logs() {
    local follow="${1:-false}"
    local lines="${2:-100}"
    
    local follow_flag=""
    [[ "${follow}" == "true" ]] && follow_flag="-f"
    
    log_info "Viewing application logs..."
    kubectl logs -l app=fittracker-backend -n "${KUBE_NAMESPACE}" --tail="${lines}" ${follow_flag}
}

# Main function
main() {
    local command=""
    local version="latest"
    local namespace="${KUBE_NAMESPACE}"
    local dry_run="false"
    local skip_tests="false"
    local force="false"
    local follow_logs="false"
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -v|--version)
                version="$2"
                shift 2
                ;;
            -n|--namespace)
                namespace="$2"
                shift 2
                ;;
            --dry-run)
                dry_run="true"
                shift
                ;;
            --skip-tests)
                skip_tests="true"
                shift
                ;;
            --force)
                force="true"
                shift
                ;;
            -f|--follow)
                follow_logs="true"
                shift
                ;;
            deploy|rollback|status|logs|test)
                command="$1"
                shift
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Check if command is provided
    if [[ -z "${command}" ]]; then
        log_error "No command specified"
        show_help
        exit 1
    fi
    
    # Update namespace if different from default
    if [[ "${namespace}" != "${KUBE_NAMESPACE}" ]]; then
        KUBE_NAMESPACE="${namespace}"
    fi
    
    # Check prerequisites for all commands except help
    check_prerequisites
    
    # Execute command
    case "${command}" in
        deploy)
            if [[ "${dry_run}" == "false" ]]; then
                build_and_push "${version}"
            fi
            deploy_to_k8s "${version}" "${dry_run}" "${skip_tests}"
            ;;
        rollback)
            rollback_deployment
            ;;
        status)
            check_status
            ;;
        logs)
            view_logs "${follow_logs}"
            ;;
        test)
            run_smoke_tests
            ;;
        *)
            log_error "Unknown command: ${command}"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
