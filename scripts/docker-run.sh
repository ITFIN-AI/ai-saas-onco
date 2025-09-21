#!/bin/bash

# Script to run Docker configurations for the project
# Usage: ./scripts/docker-run.sh [dev|prod|firebase|firebase-only] [up|build|down|logs]

# Set default values
ENV=${1:-dev}
ACTION=${2:-up}
DETACHED=""

# Parse arguments
if [[ "$ENV" != "dev" && "$ENV" != "prod" && "$ENV" != "firebase" && "$ENV" != "firebase-only" ]]; then
  echo "Invalid environment: $ENV. Use 'dev', 'prod', 'firebase', or 'firebase-only'."
  exit 1
fi

if [[ "$ENV" == "prod" && "$ACTION" == "up" ]]; then
  DETACHED="-d"
fi

# Set docker-compose file
if [[ "$ENV" == "dev" ]]; then
  DOCKER_COMPOSE_FILE="docker-compose.dev.yml"
elif [[ "$ENV" == "prod" ]]; then
  DOCKER_COMPOSE_FILE="docker-compose.prod.yml"
elif [[ "$ENV" == "firebase" ]]; then
  # For firebase, use a custom configuration
  DOCKER_COMPOSE_FILE="docker-compose.dev.yml"
  DOCKER_SERVICE="firebase"
elif [[ "$ENV" == "firebase-only" ]]; then
  # For standalone firebase, use the dedicated firebase compose file
  DOCKER_COMPOSE_FILE="docker-compose.firebase.yml"
  DOCKER_SERVICE=""
fi

# Execute action
case "$ACTION" in
  up)
    echo "Starting $ENV environment..."
    if [[ "$ENV" == "firebase" ]]; then
      docker compose -f $DOCKER_COMPOSE_FILE up $DETACHED $DOCKER_SERVICE
    elif [[ "$ENV" == "firebase-only" ]]; then
      docker compose -f $DOCKER_COMPOSE_FILE up $DETACHED
    else
      docker compose -f $DOCKER_COMPOSE_FILE up $DETACHED
    fi
    ;;
  build)
    echo "Building $ENV environment..."
    if [[ "$ENV" == "firebase" ]]; then
      docker compose -f $DOCKER_COMPOSE_FILE build $DOCKER_SERVICE
    elif [[ "$ENV" == "firebase-only" ]]; then
      docker compose -f $DOCKER_COMPOSE_FILE build
    else
      docker compose -f $DOCKER_COMPOSE_FILE build
    fi
    ;;
  down)
    echo "Stopping $ENV environment..."
    if [[ "$ENV" == "firebase" ]]; then
      docker compose -f $DOCKER_COMPOSE_FILE stop $DOCKER_SERVICE
    elif [[ "$ENV" == "firebase-only" ]]; then
      docker compose -f $DOCKER_COMPOSE_FILE down
    else
      docker compose -f $DOCKER_COMPOSE_FILE down
    fi
    ;;
  logs)
    echo "Showing logs for $ENV environment..."
    if [[ "$ENV" == "firebase" ]]; then
      docker compose -f $DOCKER_COMPOSE_FILE logs -f $DOCKER_SERVICE
    elif [[ "$ENV" == "firebase-only" ]]; then
      docker compose -f $DOCKER_COMPOSE_FILE logs -f
    else
      docker compose -f $DOCKER_COMPOSE_FILE logs -f
    fi
    ;;
  *)
    echo "Invalid action: $ACTION. Use 'up', 'build', 'down', or 'logs'."
    exit 1
    ;;
esac
