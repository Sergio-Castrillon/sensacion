# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static e-commerce website for "Sensación", a personal care brand. The site is built with vanilla HTML, CSS, and JavaScript - no build process or dependencies.

## Running the Project

### Current Static Site
Since this is currently a static website, there are no build commands. To run locally:

```bash
# Option 1: Python HTTP server
python3 -m http.server
# Then visit http://localhost:8000

# Option 2: VS Code Live Server extension
# Right-click on index.html and select "Open with Live Server"

# Option 3: Simply open index.html in a browser
```

### Future E-commerce Development (Docker-First Approach)

#### 🐳 Docker Development (Recommended)

**Prerequisites:**
```bash
# Verify Docker installation
docker --version  # Ensure Docker 20.10+
docker-compose --version  # Ensure Compose v2+
```

**Quick Start with Docker:**
```bash
# 1. Clone and setup
git clone <repo> sensacion-ecommerce
cd sensacion-ecommerce

# 2. Start development environment
docker-compose up -d

# 3. Access services
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# Database: localhost:5432
# Redis: localhost:6379
```

**Project Structure for Docker:**
```
sensacion-ecommerce/
├── docker-compose.yml           # Multi-service orchestration
├── docker-compose.prod.yml      # Production overrides
├── backend/
│   ├── Dockerfile               # Multi-stage Node.js build
│   ├── .dockerignore           # Exclude dev files
│   └── src/
├── frontend/                    # Keep existing structure
├── nginx/
│   └── nginx.conf              # Reverse proxy config
└── scripts/
    ├── dev-setup.sh            # Development scripts
    └── prod-deploy.sh          # Production deployment
```

**Docker Compose Configuration:**
```yaml
# docker-compose.yml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: sensacion_db
      POSTGRES_USER: sensacion
      POSTGRES_PASSWORD: dev_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U sensacion"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: development
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://sensacion:dev_password@postgres:5432/sensacion_db
      REDIS_URL: redis://redis:6379
      JWT_SECRET: dev-secret-change-in-production
    volumes:
      - ./backend:/app
      - /app/node_modules
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    command: npm run dev

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "3000:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./frontend:/usr/share/nginx/html
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:
```

**Multi-Stage Dockerfile (Backend):**
```dockerfile
# backend/Dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Development stage
FROM base AS development
RUN npm ci
COPY . .
EXPOSE 3001
USER node
CMD ["npm", "run", "dev"]

# Build stage
FROM base AS build
COPY . .
RUN npm ci && npm run build && npm prune --production

# Production stage
FROM node:18-alpine AS production
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001
WORKDIR /app
COPY --from=build --chown=nextjs:nodejs /app/dist ./dist
COPY --from=build --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nextjs:nodejs /app/package.json ./package.json
USER nextjs
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/healthcheck.js
CMD ["node", "dist/server.js"]
```

**Environment Configuration:**
```bash
# .env.development
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://sensacion:dev_password@postgres:5432/sensacion_db
REDIS_URL=redis://redis:6379
JWT_SECRET=dev-secret-min-32-chars
BCRYPT_ROUNDS=10
CLOUDINARY_URL=cloudinary://key:secret@cloud
MERCADOPAGO_ACCESS_TOKEN=TEST-token
NEQUI_API_KEY=dev-api-key

# .env.production
NODE_ENV=production
PORT=3001
DATABASE_URL=${DATABASE_URL}
REDIS_URL=${REDIS_URL}
JWT_SECRET=${JWT_SECRET}
BCRYPT_ROUNDS=12
CLOUDINARY_URL=${CLOUDINARY_URL}
MERCADOPAGO_ACCESS_TOKEN=${MP_TOKEN}
NEQUI_API_KEY=${NEQUI_KEY}
```

**Development Commands:**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f postgres

# Run database migrations
docker-compose exec backend npm run migrate

# Run tests
docker-compose exec backend npm test

# Access database
docker-compose exec postgres psql -U sensacion -d sensacion_db

# Rebuild after changes
docker-compose build backend
docker-compose up -d backend

# Clean restart
docker-compose down -v
docker-compose up -d
```

#### 🛠️ Manual Setup (Alternative)

**Prerequisites:**
```bash
# Verify installations
node --version     # Ensure Node.js 18+
npm --version      # Ensure npm 9+
psql --version     # Ensure PostgreSQL 14+
redis-cli --version # Ensure Redis 6+
```

**Setup Steps:**
```bash
# 1. Database setup
createdb sensacion_db
psql sensacion_db < scripts/init.sql

# 2. Redis setup
redis-server --daemonize yes

# 3. Backend setup
cd backend
npm install
cp .env.example .env.development
npm run migrate
npm run seed
npm run dev

# 4. Frontend (keep existing setup)
cd ../frontend
python3 -m http.server 3000
```

**Why Docker is Recommended:**
- ✅ **Consistent Environment**: Same setup across all machines
- ✅ **Easy Dependencies**: No manual PostgreSQL/Redis installation
- ✅ **Production Parity**: Exact same environment as production
- ✅ **Team Collaboration**: New developers can start in minutes
- ✅ **Testing**: Isolated test environments
- ✅ **Deployment**: Same containers in production

## Architecture

### File Structure
- `index.html` - Homepage with featured products and hero section
- `pages/` - Contains all other HTML pages:
  - `products.html` - Product catalog with filtering
  - `product-details.html` - Dynamic product detail page
  - `contact.html` - Contact form using Formspree
- `js/` - JavaScript functionality:
  - `main.js` - Cart interactions and product filtering
  - `product-details.js` - Populates product details based on URL params
- `style/styles.css` - All styling for the site
- `images/` - Logo and icons

### Key Technical Details

1. **Product Details System**: Uses URL parameters (`?product=product-name`) to dynamically load product information from a JavaScript object in `product-details.js`

2. **Contact Form**: Integrated with Formspree service (form ID: `mgvzkdqg`). Requires updating this ID for production use.

3. **Responsive Design**: Uses CSS media queries for mobile/tablet/desktop layouts

4. **No Framework**: Pure vanilla JavaScript - DOM manipulation via `querySelector` and event listeners

### External Dependencies
- Google Fonts (Poppins)
- Font Awesome 6.5.1 (icons)
- Formspree (contact form submission)
- Placeholder images from placehold.co

## Common Tasks

### Adding a New Product
1. Add product card HTML in `index.html` or `pages/products.html`
2. Add product details to the `products` object in `js/product-details.js`
3. Ensure the product link uses the correct URL parameter

### Modifying Contact Form
Update the Formspree form ID in `pages/contact.html:53`

### Updating Navigation
Navigation is duplicated across all HTML files - update header and footer in each file when making changes

## Documentation and Development Resources

### Real-time Documentation Access
This project uses **context7 MCP** for accessing real-time documentation. Context7 provides automatic access to up-to-date documentation through function calls.

#### Available Documentation Sources
- **Node.js Best Practices**: Latest patterns and security guidelines
- **Docker Containerization**: Multi-stage builds and production practices
- **Database Design**: PostgreSQL optimization and security
- **Payment Integration**: MercadoPago and Nequi APIs for Colombia
- **Testing Frameworks**: Jest, Playwright, and API testing
- **Security Patterns**: Authentication, authorization, and data protection

#### How Claude Code Uses Context7
Claude Code automatically accesses relevant documentation when:
- Implementing new features or fixing issues
- Following best practices for the technology stack
- Integrating with external APIs (payments, shipping)
- Setting up development or production environments
- Optimizing performance or security

This ensures all implementations follow current best practices and use the latest API versions.

## Important Conventions

### Git Commits and Documentation
- **NEVER include references to Claude, AI, or automated tools** in commit messages, PRs, or code comments
- Keep all commits professional and focused on the technical changes
- Use conventional commit format when possible (feat:, fix:, docs:, etc.)
- Write commit messages as if created by a human developer