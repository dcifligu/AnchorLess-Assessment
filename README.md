# AnchorLess Assessment
A simple visa dossier upload application built in Laravel 12 and ReactJS with React-Router

## 🏗️ Project Structure

```
AnchorLess-Assessment/
├── backend/          # Laravel API backend
└── frontend/         # React frontend application
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **PHP** >= 8.3.13
- **Composer** (PHP dependency manager)
- **Node.js** >= 18.x
- **npm** or **yarn**
- **Git**

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/dcifligu/AnchorLess-Assessment.git
cd AnchorLess-Assessment
```

### 2. Backend Setup (Laravel)

Navigate to the backend directory and install dependencies:

```bash
cd backend
composer install
```

#### Environment Configuration

1. Copy the environment file:
```bash
cp .env.example .env
```

2. Generate application key:
```bash
php artisan key:generate
```

3. Configure your database in the `.env` file. The project is pre-configured to use SQLite:
```env
DB_CONNECTION=sqlite
```

4. Create the SQLite database file:
```bash
touch database/database.sqlite
```

5. Run database migrations:
```bash
php artisan migrate
```

#### Install Node.js Dependencies for Backend

```bash
npm install
```

### 3. Frontend Setup (React)

Navigate to the frontend directory and install dependencies:

```bash
cd ../frontend
npm install
```

## 🖥️ Running the Application

### Development Mode

You have several options to run the application:

#### Option 1: Run Both Services Simultaneously (Recommended)

From the backend directory, use the convenient development script:

```bash
cd backend
composer run dev
```

This command will start:
- Laravel development server (http://localhost:8000)
- Queue worker
- Laravel Pail (log viewer)
- Frontend development server

#### Option 2: Run Services Separately

**Backend (Laravel API):**
```bash
cd backend
php artisan serve
```
The API will be available at `http://localhost:8000`

**Frontend (React):**
```bash
cd frontend
npm run dev
```
The frontend will be available at `http://localhost:5173`

#### Option 3: Additional Backend Services

**Queue Worker (for background jobs):**
```bash
cd backend
php artisan queue:work
```

**Laravel Pail (Real-time log viewer):**
```bash
cd backend
php artisan pail
```

## 🧪 Testing

### Backend Tests

The Laravel backend includes comprehensive testing capabilities:

```bash
cd backend

# Run all tests
composer run test
# or
php artisan test

# Run specific test file
php artisan test tests/Feature/ExampleTest.php

# Run tests with coverage
php artisan test --coverage
```

### Frontend Tests

```bash
cd frontend

# Run linting
npm run lint

# Preview production build
npm run preview
```

## 🔧 Available CLI Commands

### Laravel Artisan Commands

```bash
cd backend

# Database operations
php artisan migrate                    # Run migrations
php artisan migrate:rollback          # Rollback migrations
php artisan migrate:refresh           # Refresh migrations
php artisan db:seed                   # Seed database

# Cache operations
php artisan cache:clear               # Clear application cache
php artisan config:clear              # Clear config cache
php artisan route:clear               # Clear route cache
php artisan view:clear                # Clear view cache

# Development tools
php artisan tinker                    # Interactive shell
php artisan make:controller Name      # Create controller
php artisan make:model Name           # Create model
php artisan make:migration name       # Create migration
php artisan make:seeder Name          # Create seeder
php artisan make:test Name            # Create test

# Queue management
php artisan queue:work                # Start queue worker
php artisan queue:restart             # Restart queue workers
php artisan queue:failed              # List failed jobs

# Laravel Pail (Log viewer)
php artisan pail                      # Start real-time log viewer
php artisan pail --timeout=0         # Start without timeout
```

### Composer Scripts

```bash
cd backend

# Development environment
composer run dev                      # Start all development services

# Testing
composer run test                     # Run tests with config clear
```

## 🏗️ Build for Production

### Backend

```bash
cd backend

# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
composer install --optimize-autoloader --no-dev
```

### Frontend

```bash
cd frontend

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🛠️ Technology Stack

### Backend
- **Laravel 12.x** - PHP framework
- **Laravel Sanctum** - API authentication
- **Laravel Tinker** - Interactive shell
- **Laravel Sail** - Docker development environment
- **Laravel Pail** - Log viewer
- **PHPUnit** - Testing framework

### Frontend
- **React 19.x** - JavaScript library
- **React Router DOM** - Client-side routing
- **Vite** - Build tool
- **Tailwind CSS** - Utility-first CSS framework
- **ESLint** - Code linting

### Development Tools
- **Composer** - PHP dependency management
- **NPM** - Node.js package management
- **Concurrently** - Run multiple commands
- **Laravel Pint** - PHP code style fixer

## 📝 Environment Variables

Key environment variables in the backend `.env` file:

```env
APP_NAME=Laravel
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=sqlite
SESSION_DRIVER=database
QUEUE_CONNECTION=database
CACHE_STORE=database

MAIL_MAILER=log
```

## 🐛 Troubleshooting

### Common Issues

1. **Permission Issues:**
```bash
cd backend
chmod -R 775 storage bootstrap/cache
```

2. **Clear All Caches:**
```bash
php artisan optimize:clear
```

3. **Regenerate Autoloader:**
```bash
composer dump-autoload
```

4. **Database Issues:**
```bash
php artisan migrate:fresh
```

## 📚 Additional Resources

- [Laravel Documentation](https://laravel.com/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/)
