#!/bin/bash

echo "=========================================="
echo "      SpeseCasa Server Updater"
echo "=========================================="

echo "[1/3] Pulling latest code..."
git pull

echo ""
echo "[2/3] Rebuilding and restarting containers..."
docker compose -f docker-compose.prod.yml up -d --build

echo ""
echo "[3/3] Cleaning up unused images..."
docker image prune -f

echo ""
echo "=========================================="
echo "      Update Complete!"
echo "=========================================="
