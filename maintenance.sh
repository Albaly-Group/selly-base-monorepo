#!/bin/bash

# Maintenance Script for Selly Base Production Environment
# Provides backup, restore, and update functionality

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Backup directory
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR

# Load environment
if [ -f .env.prod ]; then
    source .env.prod
else
    echo -e "${RED}Error: .env.prod not found${NC}"
    exit 1
fi

show_menu() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}Selly Base Maintenance Menu${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
    echo "1. Backup Database"
    echo "2. Restore Database"
    echo "3. Update Application"
    echo "4. View Logs"
    echo "5. Service Status"
    echo "6. Restart Services"
    echo "7. Clean Docker Resources"
    echo "8. SSL Certificate Status"
    echo "9. Exit"
    echo ""
}

backup_database() {
    echo -e "${YELLOW}Starting database backup...${NC}"
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/selly_base_backup_$TIMESTAMP.sql"
    
    docker exec selly-postgres pg_dump -U ${POSTGRES_USER} ${POSTGRES_DB} > $BACKUP_FILE
    
    if [ -f $BACKUP_FILE ]; then
        # Compress backup
        gzip $BACKUP_FILE
        echo -e "${GREEN}✓ Backup completed: ${BACKUP_FILE}.gz${NC}"
        
        # Show backup size
        SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
        echo -e "  Size: $SIZE"
        
        # Keep only last 7 backups
        echo "Cleaning old backups (keeping last 7)..."
        ls -t $BACKUP_DIR/selly_base_backup_*.sql.gz | tail -n +8 | xargs -r rm
        echo -e "${GREEN}✓ Old backups cleaned${NC}"
    else
        echo -e "${RED}✗ Backup failed${NC}"
        exit 1
    fi
}

restore_database() {
    echo -e "${YELLOW}Available backups:${NC}"
    echo ""
    
    BACKUPS=($(ls -t $BACKUP_DIR/selly_base_backup_*.sql.gz 2>/dev/null))
    
    if [ ${#BACKUPS[@]} -eq 0 ]; then
        echo -e "${RED}No backups found${NC}"
        return
    fi
    
    for i in "${!BACKUPS[@]}"; do
        SIZE=$(du -h "${BACKUPS[$i]}" | cut -f1)
        echo "$((i+1)). ${BACKUPS[$i]} ($SIZE)"
    done
    
    echo ""
    echo -n "Select backup to restore (1-${#BACKUPS[@]}): "
    read selection
    
    if [ "$selection" -ge 1 ] && [ "$selection" -le "${#BACKUPS[@]}" ]; then
        BACKUP_FILE="${BACKUPS[$((selection-1))]}"
        
        echo -e "${RED}WARNING: This will overwrite the current database!${NC}"
        echo -n "Are you sure? (yes/no): "
        read confirm
        
        if [ "$confirm" == "yes" ]; then
            echo -e "${YELLOW}Restoring database from ${BACKUP_FILE}...${NC}"
            
            # Decompress and restore
            gunzip -c $BACKUP_FILE | docker exec -i selly-postgres psql -U ${POSTGRES_USER} ${POSTGRES_DB}
            
            echo -e "${GREEN}✓ Database restored successfully${NC}"
            echo "Restarting API service..."
            docker compose -f docker-compose.prod.yml restart api
        else
            echo "Restore cancelled"
        fi
    else
        echo -e "${RED}Invalid selection${NC}"
    fi
}

update_application() {
    echo -e "${YELLOW}Updating application...${NC}"
    
    # Backup before update
    echo "Creating backup before update..."
    backup_database
    
    echo ""
    echo "Pulling latest code..."
    git fetch origin
    
    echo ""
    echo "Available branches/tags:"
    git branch -r
    echo ""
    echo -n "Enter branch/tag to deploy (or press Enter for current): "
    read branch
    
    if [ ! -z "$branch" ]; then
        git checkout $branch
        git pull origin $branch
    fi
    
    echo ""
    echo "Rebuilding Docker images..."
    docker compose -f docker-compose.prod.yml build --no-cache
    
    echo ""
    echo "Rolling update (zero downtime)..."
    docker compose -f docker-compose.prod.yml up -d --force-recreate --no-deps api
    sleep 5
    docker compose -f docker-compose.prod.yml up -d --force-recreate --no-deps web
    
    echo -e "${GREEN}✓ Update completed${NC}"
    echo ""
    echo "Checking service health..."
    sleep 10
    docker compose -f docker-compose.prod.yml ps
}

view_logs() {
    echo "Select service:"
    echo "1. All services"
    echo "2. API"
    echo "3. Frontend"
    echo "4. Traefik"
    echo "5. PostgreSQL"
    echo ""
    echo -n "Choice (1-5): "
    read choice
    
    case $choice in
        1) docker compose -f docker-compose.prod.yml logs -f ;;
        2) docker compose -f docker-compose.prod.yml logs -f api ;;
        3) docker compose -f docker-compose.prod.yml logs -f web ;;
        4) docker compose -f docker-compose.prod.yml logs -f traefik ;;
        5) docker compose -f docker-compose.prod.yml logs -f postgres ;;
        *) echo -e "${RED}Invalid choice${NC}" ;;
    esac
}

service_status() {
    echo -e "${BLUE}Service Status:${NC}"
    docker compose -f docker-compose.prod.yml ps
    
    echo ""
    echo -e "${BLUE}Resource Usage:${NC}"
    docker stats --no-stream
    
    echo ""
    echo -e "${BLUE}Disk Usage:${NC}"
    docker system df
}

restart_services() {
    echo "Select service to restart:"
    echo "1. All services"
    echo "2. API only"
    echo "3. Frontend only"
    echo "4. Traefik only"
    echo ""
    echo -n "Choice (1-4): "
    read choice
    
    case $choice in
        1) docker compose -f docker-compose.prod.yml restart ;;
        2) docker compose -f docker-compose.prod.yml restart api ;;
        3) docker compose -f docker-compose.prod.yml restart web ;;
        4) docker compose -f docker-compose.prod.yml restart traefik ;;
        *) echo -e "${RED}Invalid choice${NC}"; return ;;
    esac
    
    echo -e "${GREEN}✓ Service(s) restarted${NC}"
}

clean_docker() {
    echo -e "${YELLOW}Docker Resource Cleanup${NC}"
    echo ""
    echo "This will remove:"
    echo "- Stopped containers"
    echo "- Unused networks"
    echo "- Dangling images"
    echo "- Build cache"
    echo ""
    echo -n "Continue? (yes/no): "
    read confirm
    
    if [ "$confirm" == "yes" ]; then
        docker system prune -f
        echo -e "${GREEN}✓ Cleanup completed${NC}"
        
        echo ""
        echo "Current disk usage:"
        docker system df
    else
        echo "Cleanup cancelled"
    fi
}

ssl_status() {
    echo -e "${BLUE}SSL Certificate Status:${NC}"
    echo ""
    
    # Check Traefik logs for certificate info
    docker compose -f docker-compose.prod.yml logs traefik | grep -i certificate | tail -20
    
    echo ""
    echo "Certificate files:"
    docker exec selly-traefik ls -lh /letsencrypt/ 2>/dev/null || echo "No certificates found yet"
    
    echo ""
    echo -e "${YELLOW}To test SSL:${NC}"
    echo "curl -I https://$DOMAIN"
    echo "curl -I https://api.$DOMAIN"
}

# Main menu loop
while true; do
    show_menu
    echo -n "Select option (1-9): "
    read choice
    echo ""
    
    case $choice in
        1) backup_database ;;
        2) restore_database ;;
        3) update_application ;;
        4) view_logs ;;
        5) service_status ;;
        6) restart_services ;;
        7) clean_docker ;;
        8) ssl_status ;;
        9) echo "Goodbye!"; exit 0 ;;
        *) echo -e "${RED}Invalid option${NC}" ;;
    esac
    
    echo ""
    echo -n "Press Enter to continue..."
    read
    clear
done
