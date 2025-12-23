#!/bin/bash
# infra/docker/setup.sh

set -e

echo "🚀 Setting up BizAI Docker Environment"
echo "======================================"

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env file"
        echo "⚠️  Please edit .env file with your actual values!"
    else
        echo "❌ .env.example not found!"
        exit 1
    fi
fi

# Load environment variables
source .env

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p \
    postgres/init \
    postgres/conf \
    postgres/scripts \
    nginx/conf.d \
    nginx/ssl \
    nginx/scripts \
    app/web \
    app/ai-worker \
    app/shared \
    monitoring/prometheus \
    monitoring/grafana/dashboards \
    monitoring/grafana/datasources \
    monitoring/grafana/provisioning/dashboards \
    monitoring/grafana/provisioning/datasources \
    monitoring/loki \
    monitoring/scripts \
    certbot \
    logs/nginx \
    logs/app \
    logs/postgres \
    backups/database \
    backups/logs

# Generate SSL certificates for development
echo "🔐 Generating SSL certificates..."
if [ ! -f nginx/ssl/selfsigned.key ]; then
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/selfsigned.key \
        -out nginx/ssl/selfsigned.crt \
        -subj "/C=AE/ST=Dubai/L=Dubai/O=BizAI/CN=localhost" 2>/dev/null
    echo "✅ Generated self-signed SSL certificates"
fi

# Generate passwords if not set
generate_password() {
    openssl rand -base64 32 | tr -d '\n'
}

echo "🔑 Generating secure passwords..."
sed -i "s|DB_PASSWORD=.*|DB_PASSWORD=$(generate_password)|" .env
sed -i "s|JWT_SECRET=.*|JWT_SECRET=$(generate_password)|" .env
sed -i "s|ENCRYPTION_KEY=.*|ENCRYPTION_KEY=$(generate_password)|" .env
sed -i "s|REDIS_PASSWORD=.*|REDIS_PASSWORD=$(generate_password)|" .env
sed -i "s|SESSION_SECRET=.*|SESSION_SECRET=$(generate_password)|" .env

# Create wait-for script
echo "⏳ Creating wait-for script..."
cat > app/shared/wait-for.sh << 'EOF'
#!/bin/sh
# wait-for.sh

set -e

host="$1"
shift
port="$1"
shift
cmd="$@"

until nc -z "$host" "$port"; do
  >&2 echo "⏳ Waiting for $host:$port..."
  sleep 2
done

>&2 echo "✅ $host:$port is available"
exec $cmd
EOF

chmod +x app/shared/wait-for.sh

# Create entrypoint scripts
echo "📝 Creating entrypoint scripts..."

# Web entrypoint
cat > app/web/entrypoint.sh << 'EOF'
#!/bin/sh
set -e

echo "🚀 Starting BizAI Web Application..."

# Wait for dependencies
/wait-for.sh postgres 5432
/wait-for.sh redis 6379

# Run database migrations if needed
if [ "$NODE_ENV" = "production" ]; then
    echo "🔧 Running database migrations..."
    npx drizzle-kit push
fi

# Start the application
exec "$@"
EOF

chmod +x app/web/entrypoint.sh

# AI Worker entrypoint
cat > app/ai-worker/entrypoint.sh << 'EOF'
#!/bin/sh
set -e

echo "🤖 Starting BizAI Worker..."

# Wait for dependencies
/wait-for.sh postgres 5432
/wait-for.sh redis 6379

# Start the worker
exec "$@"
EOF

chmod +x app/ai-worker/entrypoint.sh

# Create healthcheck scripts
echo "🏥 Creating healthcheck scripts..."

cat > app/web/healthcheck.sh << 'EOF'
#!/bin/sh
# Health check for web application

curl -f http://localhost:3000/api/health || exit 1
EOF

chmod +x app/web/healthcheck.sh

cat > app/ai-worker/healthcheck.sh << 'EOF'
#!/bin/sh
# Health check for AI worker

curl -f http://localhost:3001/health || exit 1
EOF

chmod +x app/ai-worker/healthcheck.sh

# Create backup script
echo "💾 Creating backup script..."
cat > postgres/scripts/backup.sh << 'EOF'
#!/bin/bash
# PostgreSQL backup script

set -e

BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql.gz"

echo "💾 Starting PostgreSQL backup..."

# Create backup
pg_dumpall -U ${POSTGRES_USER} | gzip > ${BACKUP_FILE}

if [ $? -eq 0 ]; then
    echo "✅ Backup created: ${BACKUP_FILE}"
    echo "📦 Size: $(du -h ${BACKUP_FILE} | cut -f1)"
    
    # Remove old backups (keep 7 days)
    find ${BACKUP_DIR} -name "backup_*.sql.gz" -mtime +7 -delete
    
    # Log backup
    echo "$(date): Backup created - ${BACKUP_FILE}" >> ${BACKUP_DIR}/backup.log
else
    echo "❌ Backup failed!"
    exit 1
fi
EOF

chmod +x postgres/scripts/backup.sh

# Set permissions
echo "🔒 Setting permissions..."
chmod +x *.sh

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Edit .env file with your actual API keys"
echo "   2. Build Docker images: docker-compose build"
echo "   3. Start services: docker-compose up -d"
echo ""
echo "🔗 Access URLs:"
echo "   - Web App: http://localhost:3000"
echo "   - Adminer: http://localhost:8080"
echo "   - MailHog: http://localhost:8025"
echo ""
echo "📝 Logs:"
echo "   - docker-compose logs -f"
echo ""