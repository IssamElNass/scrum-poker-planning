#!/bin/bash

echo "Setting up Poker Planning Microservices..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js 20+ first.${NC}"
    exit 1
fi

echo -e "${GREEN}Node.js found: $(node -v)${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ npm found: $(npm -v)${NC}"
echo ""

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}Dependencies installed${NC}"
echo ""

# Build shared package
echo -e "${YELLOW}Building shared package...${NC}"
cd packages/shared && npm run build && cd ../..

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to build shared package${NC}"
    exit 1
fi

echo -e "${GREEN}Shared package built${NC}"
echo ""

# Create environment files
echo -e "${YELLOW}Creating environment files...${NC}"

# Backend .env
if [ ! -f "apps/backend/.env" ]; then
    cat > apps/backend/.env << EOF
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/poker_planning
PORT=4000
WEBSOCKET_URL=http://localhost:5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
ENCRYPTION_KEY=$(openssl rand -base64 32)
EOF
    echo -e "${GREEN}Created apps/backend/.env${NC}"
else
    echo -e "${YELLOW}apps/backend/.env already exists, skipping${NC}"
fi

# WebSocket .env
if [ ! -f "apps/websocket/.env" ]; then
    cat > apps/websocket/.env << EOF
PORT=5000
BACKEND_URL=http://localhost:4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
EOF
    echo -e "${GREEN}Created apps/websocket/.env${NC}"
else
    echo -e "${YELLOW}apps/websocket/.env already exists, skipping${NC}"
fi

# UI .env.local
if [ ! -f "apps/ui/.env.local" ]; then
    cat > apps/ui/.env.local << EOF
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_WEBSOCKET_URL=http://localhost:5000
EOF
    echo -e "${GREEN}Created apps/ui/.env.local${NC}"
else
    echo -e "${YELLOW}apps/ui/.env.local already exists, skipping${NC}"
fi

echo ""
echo -e "${GREEN}Setup complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo ""
echo "1. Set up your PostgreSQL database:"
echo "   createdb poker_planning"
echo ""
echo "2. Run database migrations:"
echo "   npm run db:migrate"
echo ""
echo "3. Start all services:"
echo "   npm run dev"
echo ""
echo "Or start services individually:"
echo "   npm run dev:backend    # Backend API on port 4000"
echo "   npm run dev:websocket  # WebSocket on port 5000"
echo "   npm run dev:ui         # UI on port 3000"
echo ""
echo -e "${GREEN}Happy coding!${NC}"

