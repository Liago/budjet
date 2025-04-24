#!/bin/bash
# Production deployment script

# Clean previous build
echo "Cleaning previous build..."
rm -rf dist

# Build the project
echo "Building project for production..."
npm run build:prod

# Directory where the build is located
BUILD_DIR="./dist"

# Check if build succeeded
if [ ! -d "$BUILD_DIR" ] || [ -z "$(ls -A $BUILD_DIR)" ]; then
  echo "Build failed or directory is empty. Check for errors."
  exit 1
fi

echo "Build completed successfully!"
echo "The production build is available in the $BUILD_DIR directory"
echo ""
echo "Base URL used for this build: /budjet/"
echo ""
echo "Files in build directory:"
ls -la $BUILD_DIR
echo ""
echo "To deploy to your production server, you can copy these files to your server using:"
echo "rsync -avz $BUILD_DIR/ user@your-server:/path/to/web/root/budjet/"
echo ""
echo "IMPORTANT: Make sure the destination directory matches the /budjet/ path used in the build!" 