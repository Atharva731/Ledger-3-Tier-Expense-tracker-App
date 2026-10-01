# --- Build/install stage ---
FROM node:20-alpine AS base

WORKDIR /usr/src/app

# Install backend dependencies first (better layer caching)
COPY backend/package.json backend/package-lock.json* ./backend/
RUN cd backend && npm install --omit=dev

# Copy the rest of the app
COPY backend ./backend
COPY frontend ./frontend

WORKDIR /usr/src/app/backend

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "server.js"]
