# Shorter

A lightweight, self-hosted URL shortener built with Next.js. Designed for simplicity, performance, and ease of deployment.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.0-black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38bdf8)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ed)

## ✨ Features

- **Zero Database Dependency**: Uses a robust local JSON storage system, making it incredibly easy to back up and migrate.
- **Modern UI**: A clean, responsive dashboard built with React and **Tailwind CSS**.
- **Secure Management**: Protected by a single API Key authentication mechanism.
- **Custom Slugs**: Choose your own short URLs or let the system handle it.
- **Full Control**: Create, Edit, and Delete links instantly.
- **Docker Ready**: Production-ready Dockerfile and Compose configuration included.

## 🛠 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (React)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Storage**: Local JSON File System
- **Runtime**: Node.js

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/cupkappu/shorter.git
   cd shorter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configuration**
   Copy the example environment file and set your secret key.
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and set a strong `AUTH_KEY`:
   ```env
   AUTH_KEY=your-secure-secret-key
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## 🐳 Docker Deployment

Shorter is designed to run anywhere Docker runs.

### Using Docker CLI

```bash
# Build the image
docker build -t shorter .

# Run the container
# Mount the /data volume to persist your links
docker run -d \
  -p 3000:3000 \
  -e AUTH_KEY=your-secure-secret-key \
  -v $(pwd)/data:/app/data \
  --name shorter \
  shorter
```

### Using Docker Compose

```bash
# Start the service
AUTH_KEY=your-secure-secret-key docker compose up -d
```

## 📖 Usage

1. **Login**: Access the dashboard and enter the `AUTH_KEY` you configured.
2. **Create**: Paste a long URL, optionally provide a custom slug (e.g., `my-link`), and click "Shorten".
3. **Manage**: View your active links, edit destinations, or delete unused links directly from the dashboard.
4. **Share**: Click the copy icon to grab your short link instantly.

## 📄 License

This project is open-sourced software licensed under the [MIT license](LICENSE).
