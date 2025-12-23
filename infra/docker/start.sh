#!/bin/bash
# infra/docker/start.sh

set -e

echo "🚀 Starting BizAI Docker Stack..."
echo "================================="

# Load environment
source .env 2>/dev/null || true

# Build images
echo "🔨 Building Docker images..."
docker-compose build

# Start services
echo "🚀 Starting services..."
docker-compose up -d

# Wait for services
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check status
echo "📊 Services status:"
docker-compose ps

echo ""
echo "✅ All services started successfully!"
echo ""
echo "🔗 Access URLs:"
echo "   - Web Application: http://localhost:3000"
echo "   - Adminer (DB UI): http://localhost:8080"
echo "   - MailHog (Email Testing): http://localhost:8025"
echo "   - Nginx: http://localhost:80"
echo ""
echo "📝 Management commands:"
echo "   - View logs: docker-compose logs -f"
echo "   - Stop services: docker-compose down"
echo "   - Restart: docker-compose restart"
echo "   - Shell access: docker-compose exec web sh"
echo ""