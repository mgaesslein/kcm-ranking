# GitHub Actions Setup Guide

This guide will help you configure the automated Docker image building and pushing pipeline.

## Overview

The GitHub Actions workflow (`.github/workflows/docker-build-push.yml`) automatically:
- ✅ Builds Docker images on every push to `main`
- ✅ Pushes images to Docker Hub and GitHub Container Registry
- ✅ Creates multi-platform images (amd64, arm64)
- ✅ Tags images appropriately (latest, version tags, commit SHA)
- ✅ Caches layers for faster builds

## Prerequisites

1. A GitHub account (you already have this!)
2. A Docker Hub account

## Step-by-Step Setup

### 1. Create a Docker Hub Account

If you don't have one already:
1. Go to https://hub.docker.com
2. Sign up for a free account
3. Remember your username

### 2. Generate Docker Hub Access Token

1. Log in to Docker Hub
2. Click on your username (top right) → **Account Settings**
3. Go to **Security** tab
4. Click **New Access Token**
5. Give it a description: `GitHub Actions - kcm-ranking`
6. Set permissions: **Read, Write, Delete**
7. Click **Generate**
8. **Copy the token immediately** (you won't be able to see it again!)

### 3. Add Secrets to GitHub Repository

1. Go to your GitHub repository: https://github.com/mgaesslein/kcm-ranking
2. Click on **Settings** (top right)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**

Add the following two secrets:

#### Secret 1: DOCKERHUB_USERNAME
- Name: `DOCKERHUB_USERNAME`
- Value: Your Docker Hub username (e.g., `mgaesslein`)
- Click **Add secret**

#### Secret 2: DOCKERHUB_TOKEN
- Click **New repository secret** again
- Name: `DOCKERHUB_TOKEN`
- Value: Paste the Docker Hub access token you generated
- Click **Add secret**

### 4. Verify the Workflow

The workflow should now be active! To trigger a build:

```bash
# Make any small change
echo "# KCM Ranking" >> README.md

# Commit and push
git add README.md
git commit -m "Trigger workflow"
git push
```

### 5. Monitor the Build

1. Go to your repository on GitHub
2. Click the **Actions** tab
3. You should see "Build and Push Docker Image" running
4. Click on the workflow run to see details
5. Wait for it to complete (usually 5-10 minutes)

## After Successful Build

Once the workflow completes, your Docker images will be available at:

### Docker Hub
```
docker pull mgaesslein/kcm-ranking:latest
```

### GitHub Container Registry (GHCR)
```
docker pull ghcr.io/mgaesslein/kcm-ranking:latest
```

## Image Tags

The workflow automatically creates the following tags:

- `latest` - Always points to the latest main branch build
- `main` - Same as latest
- `main-<commit-sha>` - Specific commit from main branch
- `v1.0.0`, `v1.0`, `v1` - When you create version tags

## Creating Version Releases

To create a versioned release:

```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0
```

This will create images tagged as:
- `v1.0.0`
- `v1.0`
- `v1`
- `latest`

## Sharing with Your Friend

Now your friend has multiple options to deploy:

### Option 1: Pull from Docker Hub (Easiest)
```bash
docker pull mgaesslein/kcm-ranking:latest
docker run -d -p 8080:80 --name kcm-ranking mgaesslein/kcm-ranking:latest
```

### Option 2: Pull from GitHub Container Registry
```bash
docker pull ghcr.io/mgaesslein/kcm-ranking:latest
docker run -d -p 8080:80 --name kcm-ranking ghcr.io/mgaesslein/kcm-ranking:latest
```

### Option 3: Use Docker Compose

Create a `docker-compose.yml`:

```yaml
version: '3.8'
services:
  kcm-ranking:
    image: mgaesslein/kcm-ranking:latest
    container_name: kcm-ranking
    ports:
      - "8080:80"
    restart: unless-stopped
```

Then run:
```bash
docker-compose up -d
```

## Troubleshooting

### Workflow fails with authentication error
- Check that your secrets are correctly set
- Make sure the Docker Hub token has Read, Write, Delete permissions
- Try regenerating the Docker Hub token

### Image not found on Docker Hub
- Check the Actions tab to see if the workflow succeeded
- Make sure you pushed to the `main` branch
- Verify the image name matches your Docker Hub username

### Workflow not running
- Check that the workflow file is in `.github/workflows/`
- Make sure you pushed the workflow file to GitHub
- Check that you have the required secrets set

### Build takes too long
- First builds take longer (5-10 minutes)
- Subsequent builds are faster due to caching
- Multi-platform builds (amd64 + arm64) take longer

## Making Changes

Every time you push to the `main` branch, a new image will be built and pushed automatically!

```bash
# Make your changes
git add .
git commit -m "Your changes"
git push

# Wait a few minutes, then your friend can pull the latest image:
docker pull mgaesslein/kcm-ranking:latest
docker restart kcm-ranking
```

## Security Notes

- ✅ Secrets are encrypted and not visible in logs
- ✅ The `GITHUB_TOKEN` is automatically provided by GitHub
- ✅ Docker Hub tokens can be revoked anytime
- ✅ Only you can see and modify the secrets

## Need Help?

- Check the Actions tab for error messages
- Review the workflow logs for details
- Make sure all prerequisites are met
- Verify secrets are correctly set

