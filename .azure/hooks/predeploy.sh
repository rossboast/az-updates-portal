#!/bin/bash
set -e

echo "Building web application..."
cd web
npm install
npm run build
cd ..

echo "Installing API dependencies..."
cd api
npm install --omit=dev
cd ..

echo "Build completed successfully!"
