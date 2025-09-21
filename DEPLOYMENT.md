# Deployment Guide

This guide covers deploying the Poker Planning application to DigitalOcean App Platform and Hetzner Cloud using Docker containers.

## Prerequisites

### For Both Platforms

- Docker installed locally for testing
- Git repository with the project
- Convex backend deployed (`npx convex deploy --prod`)
- Environment variables configured
- Custom domain (optional but recommended for production)

### Required Environment Variables

```bash
NEXT_PUBLIC_CONVEX_URL=https://your-convex-deployment-url
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

## Option 1: DigitalOcean App Platform

DigitalOcean App Platform provides a managed container platform with automatic scaling and load balancing.

### Setup Steps

1. **Configure GitHub Secrets** (for CI/CD):

   ```bash
   DIGITALOCEAN_ACCESS_TOKEN=your_do_api_token
   NEXT_PUBLIC_CONVEX_URL=your_convex_url
   ```

2. **Manual Deployment via doctl**:

   ```bash
   # Install doctl
   curl -sL https://github.com/digitalocean/doctl/releases/download/v1.100.0/doctl-1.100.0-linux-amd64.tar.gz | tar -xzv
   sudo mv doctl /usr/local/bin

   # Authenticate
   doctl auth init --access-token YOUR_API_TOKEN

   # Deploy using spec file
   doctl apps create --spec spec.yaml
   ```

3. **Using the Web Interface**:
   - Go to [DigitalOcean Apps](https://cloud.digitalocean.com/apps)
   - Click "Create App"
   - Connect your GitHub repository
   - Choose the branch (main)
   - DigitalOcean will detect the Dockerfile automatically
   - Set environment variables in the app settings
   - Deploy

### Configuration

The `spec.yaml` file is pre-configured with:

- Automatic Docker builds
- Health checks on `/api/health`
- Environment variable placeholders
- Auto-deployment on push to main branch

### Scaling

- Basic instance: 1 vCPU, 512MB RAM ($5/month)
- Can scale up to multiple instances for high traffic
- Automatic load balancing included

## Option 2: Hetzner Cloud

Hetzner offers cost-effective VPS hosting with excellent performance in Europe.

### Setup Steps

1. **Create a Hetzner Cloud Server**:

   ```bash
   # Recommended specs for small-medium traffic:
   # CX21: 2 vCPUs, 4GB RAM, 40GB SSD (~€4.90/month)
   # CX31: 2 vCPUs, 8GB RAM, 80GB SSD (~€8.90/month)
   ```

2. **Server Setup Script**:

   ```bash
   #!/bin/bash
   # Run this on your Hetzner server

   # Update system
   apt update && apt upgrade -y

   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   usermod -aG docker $USER

   # Install Docker Compose
   curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   chmod +x /usr/local/bin/docker-compose

   # Create application directory
   mkdir -p /opt/poker-planning
   cd /opt/poker-planning

   # Clone repository
   git clone https://github.com/INQTR/poker-planning.git .

   # Set up environment
   echo "NEXT_PUBLIC_CONVEX_URL=your_convex_url" > .env.production
   echo "NODE_ENV=production" >> .env.production
   echo "REDIS_PASSWORD=$(openssl rand -base64 32)" >> .env.production

   # Start services
   docker-compose -f docker-compose.hetzner.yml up -d
   ```

3. **Configure GitHub Secrets** (for CI/CD):
   ```bash
   HETZNER_HOST=your_server_ip
   HETZNER_USERNAME=root
   HETZNER_SSH_KEY=your_private_ssh_key
   NEXT_PUBLIC_CONVEX_URL=your_convex_url
   ```

### Manual Deployment

```bash
# On your Hetzner server
cd /opt/poker-planning

# Pull latest changes
git pull origin main

# Update environment if needed
nano .env.production

# Restart services
docker-compose -f docker-compose.hetzner.yml down
docker-compose -f docker-compose.hetzner.yml pull
docker-compose -f docker-compose.hetzner.yml up -d

# Check status
docker-compose -f docker-compose.hetzner.yml logs
```

### SSL/HTTPS Setup

1. **Install Certbot**:

   ```bash
   apt install certbot python3-certbot-nginx
   ```

2. **Get SSL Certificate**:

   ```bash
   certbot --nginx -d your-domain.com
   ```

3. **Update nginx.conf** for HTTPS and restart:
   ```bash
   docker-compose -f docker-compose.hetzner.yml restart nginx
   ```

## CI/CD Automation

The GitHub Actions workflow (`.github/workflows/deploy.yml`) provides:

### Automatic Deployment

- Triggers on push to `main` branch
- Builds and pushes Docker image to GitHub Container Registry
- Deploys to DigitalOcean App Platform
- Deploys to Hetzner Cloud via SSH

### Manual Deployment

Use workflow dispatch to deploy to specific platforms:

```bash
# Via GitHub CLI
gh workflow run deploy.yml -f target=digitalocean
gh workflow run deploy.yml -f target=hetzner
gh workflow run deploy.yml -f target=both
```

## Local Testing

Test the Docker setup locally before deploying:

```bash
# Build and test locally
docker build -t poker-planning .
docker run -p 3000:3000 -e NEXT_PUBLIC_CONVEX_URL=your_url poker-planning

# Or use docker-compose
docker-compose up --build
```

## Monitoring and Maintenance

### Health Checks

- Both platforms monitor `/api/health` endpoint
- Returns application status and Convex connectivity
- Automatic restart on health check failures

### Logs Access

**DigitalOcean**: View logs in the Apps dashboard or via doctl:

```bash
doctl apps logs APP_ID --follow
```

**Hetzner**: View logs via Docker Compose:

```bash
docker-compose -f docker-compose.hetzner.yml logs -f
```

### Backup Considerations

- **Convex**: Handles data persistence and backups
- **Application**: Stateless, no backup needed
- **Environment Variables**: Store securely and backup configuration

## Cost Comparison

| Platform           | Specs           | Cost/Month | Features                                |
| ------------------ | --------------- | ---------- | --------------------------------------- |
| DigitalOcean Basic | 512MB RAM       | $5         | Managed, auto-scaling, load balancer    |
| DigitalOcean Pro   | 1GB RAM         | $12        | Multiple instances, advanced monitoring |
| Hetzner CX21       | 4GB RAM, 2 vCPU | €4.90      | Full control, better specs              |
| Hetzner CX31       | 8GB RAM, 2 vCPU | €8.90      | High performance, EU data centers       |

## Troubleshooting

### Common Issues

1. **Convex Connection Failed**:

   - Verify `NEXT_PUBLIC_CONVEX_URL` is set correctly
   - Ensure Convex backend is deployed (`npx convex deploy --prod`)

2. **Build Failures**:

   - Check Docker build logs
   - Verify Node.js version compatibility
   - Ensure all dependencies are in package.json

3. **Health Check Failures**:

   - Container may be starting (wait 30-60 seconds)
   - Check environment variables
   - Verify port 3000 is accessible

4. **Deployment Timeout**:
   - Increase health check timeout in platform settings
   - Check if container starts successfully locally

### Support Resources

- [DigitalOcean App Platform Docs](https://docs.digitalocean.com/products/app-platform/)
- [Hetzner Cloud API](https://docs.hetzner.cloud/)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [Convex Deployment Guide](https://docs.convex.dev/production/hosting)

## Custom Domain Setup

### DNS Configuration

1. **Access your domain provider's DNS panel**:

   - Log into your domain provider's account (e.g., Namecheap, GoDaddy, Cloudflare, mijnhost.be, etc.)
   - Navigate to "DNS Management", "Zone Editor", or "DNS Settings"

2. **For DigitalOcean App Platform**:

   ```
   Type: CNAME
   Name: @ (or your subdomain like 'poker')
   Value: your-app-name.ondigitalocean.app
   TTL: 3600

   Type: CNAME
   Name: www
   Value: your-app-name.ondigitalocean.app
   TTL: 3600
   ```

3. **For Hetzner Cloud**:

   ```
   Type: A
   Name: @ (or your subdomain like 'poker')
   Value: YOUR_HETZNER_SERVER_IP
   TTL: 3600

   Type: A
   Name: www
   Value: YOUR_HETZNER_SERVER_IP
   TTL: 3600
   ```

### DigitalOcean Domain Setup

1. **Add Domain in DigitalOcean**:

   ```bash
   # Via doctl
   doctl apps update APP_ID --spec spec.yaml

   # The spec.yaml will be updated to include your domain
   ```

2. **Update your spec.yaml** (done automatically in the updated version):
   ```yaml
   domains:
     - name: yourdomain.com
       type: PRIMARY
     - name: www.yourdomain.com
       type: ALIAS
   ```

### Hetzner SSL Certificate Setup

1. **Install Certbot** (if not already done):

   ```bash
   apt update
   apt install certbot python3-certbot-nginx
   ```

2. **Get SSL Certificate**:

   ```bash
   # Stop nginx temporarily
   docker-compose -f docker-compose.hetzner.yml stop nginx

   # Get certificate
   certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

   # Copy certificates to project directory
   mkdir -p /opt/poker-planning/ssl
   cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /opt/poker-planning/ssl/cert.pem
   cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /opt/poker-planning/ssl/key.pem

   # Set proper permissions
   chmod 644 /opt/poker-planning/ssl/cert.pem
   chmod 600 /opt/poker-planning/ssl/key.pem

   # Restart services
   docker-compose -f docker-compose.hetzner.yml up -d
   ```

3. **Auto-renewal setup**:

   ```bash
   # Add to crontab
   crontab -e

   # Add this line for auto-renewal
   0 12 * * * /usr/bin/certbot renew --quiet --deploy-hook "cd /opt/poker-planning && docker-compose -f docker-compose.hetzner.yml restart nginx"
   ```

### Environment Variables for Custom Domain

Add these to your deployment environment:

```bash
# For both platforms
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# For development
NEXTAUTH_URL_INTERNAL=http://localhost:3000
```

## Security Best Practices

1. **Environment Variables**: Never commit secrets to Git
2. **SSH Keys**: Use strong SSH keys for Hetzner deployment
3. **Firewall**: Configure UFW/iptables on Hetzner servers
4. **Updates**: Regularly update Docker images and dependencies
5. **Monitoring**: Set up uptime monitoring and alerts
6. **SSL**: Always use HTTPS in production with your custom domain
7. **Rate Limiting**: Nginx configuration includes rate limiting
8. **Security Headers**: Nginx adds security headers automatically
9. **Domain Security**: Configure HSTS and proper SSL settings for your domain
