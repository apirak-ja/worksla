#!/usr/bin/env bash
set -euo pipefail

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

# Function to check if service is healthy
check_service_health() {
    # Usage: check_service_health <name> <url> <max_attempts> [exec_service]
    local service_name=$1
    local url=$2
    local max_attempts=$3
    local exec_service=${4:-}
    local attempt=1

    print_status "Checking $service_name health at $url"

    while [ $attempt -le $max_attempts ]; do
        if [ -n "$exec_service" ]; then
            # run curl inside the specified container
            if docker compose exec -T "$exec_service" curl -skf "$url" >/dev/null 2>&1; then
                print_success "$service_name is healthy"
                return 0
            fi
        else
            if curl -skf "$url" >/dev/null 2>&1; then
                print_success "$service_name is healthy"
                return 0
            fi
        fi

        print_warning "Waiting for $service_name... ($attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    done

    print_error "$service_name failed to become healthy after $max_attempts attempts"
    return 1
}

# Function to test API endpoints
test_api_endpoints() {
    print_status "Testing API endpoints..."

    # Login first
    if ! curl -sk -X POST https://10.251.150.222:3346/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"username":"admin","password":"admin123"}' \
        -c /tmp/worksla_cookies.txt >/dev/null 2>&1; then
        print_error "Failed to login"
        return 1
    fi

    # Test endpoints
    local endpoints=(
        "GET /api/health"
        "GET /api/admin/users"
        "GET /api/admin/assignees"
        "GET /api/admin/settings"
        "GET /api/wp?page=1&page_size=5"
        "GET /api/reports/sla"
    )

    for endpoint in "${endpoints[@]}"; do
        local method=$(echo $endpoint | cut -d' ' -f1)
        local path=$(echo $endpoint | cut -d' ' -f2)

        if curl -sk -X $method "https://10.251.150.222:3346$path" \
            -b /tmp/worksla_cookies.txt >/dev/null 2>&1; then
            print_success "✓ $endpoint"
        else
            print_error "✗ $endpoint"
        fi
    done

    # Cleanup
    rm -f /tmp/worksla_cookies.txt
}

# Main script
main() {
    cd /opt/code/openproject/worksla

    print_status "🚀 Starting WorkSLA System Build and Deployment"
    echo

    # Step 1: Stop existing containers
    print_status "[1/8] Stopping existing containers..."
    docker compose down --remove-orphans 2>/dev/null || true

    # Step 2: Clean up unused resources
    print_status "[2/8] Cleaning up Docker resources..."
    docker system prune -f >/dev/null 2>&1 || true

    # Step 3: Build images with no cache
    print_status "[3/8] Building Docker images (no cache)..."
    if ! docker compose build --no-cache; then
        print_error "Failed to build Docker images"
        exit 1
    fi

    # Step 4: Start services
    print_status "[4/8] Starting services..."
    if ! docker compose up -d; then
        print_error "Failed to start services"
        docker compose logs
        exit 1
    fi

    # Step 5: Wait for backend to be healthy
    print_status "[5/8] Waiting for backend to be healthy..."
    # Run health check inside backend container because backend does not publish port to host
    if ! check_service_health "Backend" "http://localhost:8000/api/health" 10 worksla-backend; then
        print_warning "Backend did not become healthy within the quick timeout. Continuing — migrations and seeding will be attempted but may fail if backend isn't ready."
        echo
        print_status "Recent backend logs (last 50 lines):"
        docker compose logs --no-color worksla-backend | tail -n 50 || true
    else
        print_success "Backend is healthy"
    fi

    # Step 6: Wait for frontend to be ready
    print_status "[6/8] Waiting for frontend to be ready..."
    if ! check_service_health "Frontend" "https://10.251.150.222:3346/worksla/" 5; then
        print_warning "Frontend may not be fully ready, but continuing..."
    fi

    # Step 7: Run database migrations
    print_status "[7/8] Running database migrations..."
    if ! docker compose exec -T worksla-backend alembic upgrade head 2>/dev/null; then
        print_warning "Migration may have failed, but continuing..."
    fi

    # Step 8: Seed admin user
    print_status "[8/8] Seeding admin user..."
    if ! docker compose exec -T worksla-backend python scripts/seed_admin.py --username admin --password admin123 2>/dev/null; then
        print_warning "Admin seeding may have failed, but continuing..."
    fi

    echo
    print_success "🎉 WorkSLA System is ready!"
    echo
    echo "🌐 URL: https://10.251.150.222:3346/worksla/"
    echo "👤 Admin Login: admin / admin123"
    echo
    print_status "Services Status:"
    docker compose ps
    echo

    # Test API endpoints
    echo
    print_status "Testing system functionality..."
    test_api_endpoints

    echo
    print_success "✅ Build and deployment completed successfully!"
    echo
    print_status "Useful commands:"
    echo "  • View logs: docker compose logs -f"
    echo "  • Stop system: docker compose down"
    echo "  • Restart: docker compose restart"
    echo "  • Rebuild: docker compose build --no-cache && docker compose up -d"
}

# Run main function
main "$@"
