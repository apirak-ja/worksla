.PHONY: help up down restart logs logs-backend logs-frontend logs-nginx build clean ps seed migrate refresh-wp install

# Default target
.DEFAULT_GOAL := help

help: ## Show this help message
	@echo "WorkSLA - Open Project SLA Reporting System"
	@echo "============================================"
	@echo ""
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

up: ## Start all services
	docker-compose up -d
	@echo "✅ Services started. Access at: https://10.251.150.222:3346/worksla/"
	@echo "⚠️  Note: You may need to accept the self-signed certificate"

down: ## Stop all services
	docker-compose down

restart: ## Restart all services
	docker-compose restart

build: ## Build all images
	docker-compose build --no-cache

logs: ## View logs from all services
	docker-compose logs -f

logs-backend: ## View backend logs
	docker-compose logs -f worksla-backend

logs-frontend: ## View frontend logs
	docker-compose logs -f worksla-frontend

logs-nginx: ## View nginx logs
	docker-compose logs -f worksla-nginx

ps: ## Show running containers
	docker-compose ps
	@echo ""
	@echo "Containers with worksla label:"
	@docker ps --filter "label=worksla=1" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

seed: ## Seed admin user (default: admin/admin123)
	docker-compose exec worksla-backend python scripts/seed_admin.py

seed-custom: ## Seed admin with custom credentials (use: make seed-custom USER=myuser PASS=mypass)
	docker-compose exec worksla-backend python scripts/seed_admin.py --username $(USER) --password $(PASS)

migrate: ## Run database migrations
	@echo "Running database initialization..."
	docker-compose run --rm worksla-init-db

refresh-wp: ## Manually refresh work packages from OpenProject
	@echo "Triggering work package refresh..."
	curl -X POST https://10.251.150.222:3346/worksla/api/wp/refresh \
		-H "Content-Type: application/json" \
		-k --cookie-jar cookies.txt --cookie cookies.txt

clean: ## Remove all containers, volumes, and images
	docker-compose down -v --rmi all
	@echo "⚠️  All data has been removed!"

install: ## First-time installation
	@echo "🚀 Starting WorkSLA installation..."
	@echo ""
	@echo "Step 1: Building images..."
	docker-compose build
	@echo ""
	@echo "Step 2: Starting services..."
	docker-compose up -d
	@echo ""
	@echo "Step 3: Waiting for services to be ready..."
	@sleep 10
	@echo ""
	@echo "Step 4: Creating admin user..."
	docker-compose exec worksla-backend python scripts/seed_admin.py
	@echo ""
	@echo "✅ Installation complete!"
	@echo ""
	@echo "🌐 Access the application at: https://10.251.150.222:3346/worksla/"
	@echo "👤 Default credentials: admin / admin123"
	@echo "⚠️  Please change the admin password after first login!"

status: ## Check service health status
	@echo "Checking service health..."
	@echo ""
	@docker ps --filter "label=worksla=1" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 
	@echo ""
	@echo "Backend health:"
	@curl -s http://localhost:8000/api/health 2>/dev/null && echo "" || echo "❌ Backend not responding"
	@echo ""
	@echo "Frontend health:"
	@curl -s http://localhost:80/worksla/ -o /dev/null && echo "✅ Frontend OK" || echo "❌ Frontend not responding"
	@echo ""
	@echo "Nginx health:"
	@curl -s -k https://localhost:3346/health && echo "" || echo "❌ Nginx not responding"
