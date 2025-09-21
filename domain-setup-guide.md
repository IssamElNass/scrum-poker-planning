# Domain Setup Guide

This guide walks you through setting up your custom domain with your poker planning application, regardless of your domain provider.

## Step 1: Access Your Domain Provider's Control Panel

1. Log into your domain provider's account (e.g., Namecheap, GoDaddy, Cloudflare, mijnhost.be, etc.)
2. Navigate to **"DNS Management"**, **"Zone Editor"**, or **"DNS Settings"**
3. Click on your domain name
4. Look for **"DNS Records"**, **"DNS"**, or **"Manage DNS"**

## Step 2: Configure DNS Records

### For DigitalOcean App Platform

Add these DNS records in your domain provider's panel:

```
Type: CNAME
Name: @ (root domain)
Value: your-app-name.ondigitalocean.app
TTL: 3600

Type: CNAME
Name: www
Value: your-app-name.ondigitalocean.app
TTL: 3600
```

**Note**: Replace `your-app-name.ondigitalocean.app` with your actual DigitalOcean app URL.

### For Hetzner Cloud

Add these DNS records in your domain provider's panel:

```
Type: A
Name: @ (root domain)
Value: YOUR_HETZNER_SERVER_IP
TTL: 3600

Type: A
Name: www
Value: YOUR_HETZNER_SERVER_IP
TTL: 3600
```

**Note**: Replace `YOUR_HETZNER_SERVER_IP` with your actual Hetzner server IP address.

## Step 3: Update Configuration Files

### For DigitalOcean

1. **Update `spec.yaml`** with your domain:

   ```yaml
   # Uncomment and update these lines in spec.yaml
   domains:
     - name: yourdomain.com # Replace with your actual domain
       type: PRIMARY
     - name: www.yourdomain.com # Replace with your actual domain
       type: ALIAS
   ```

2. **Update environment variables**:

   ```yaml
   envs:
     - key: NEXTAUTH_URL
       scope: RUN_TIME
       value: https://yourdomain.com # Replace with your actual domain
     - key: NEXT_PUBLIC_APP_URL
       scope: RUN_TIME
       value: https://yourdomain.com # Replace with your actual domain
   ```

3. **Deploy the updated configuration**:
   ```bash
   doctl apps update APP_ID --spec spec.yaml
   ```

### For Hetzner Cloud

1. **Update `nginx.conf`** with your domain:

   ```nginx
   # Replace yourdomain.com with your actual domain
   server_name yourdomain.com www.yourdomain.com;
   ```

2. **Update environment variables** in `.env.production`:

   ```bash
   NEXTAUTH_URL=https://yourdomain.com
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

3. **Get SSL certificate**:

   ```bash
   # Stop nginx temporarily
   docker-compose -f docker-compose.hetzner.yml stop nginx

   # Get certificate (replace yourdomain.com with your actual domain)
   certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

   # Copy certificates
   mkdir -p /opt/poker-planning/ssl
   cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /opt/poker-planning/ssl/cert.pem
   cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /opt/poker-planning/ssl/key.pem

   # Set permissions
   chmod 644 /opt/poker-planning/ssl/cert.pem
   chmod 600 /opt/poker-planning/ssl/key.pem

   # Restart services
   docker-compose -f docker-compose.hetzner.yml up -d
   ```

## Step 4: Verify DNS Propagation

Use these tools to check if your DNS changes have propagated:

```bash
# Check DNS propagation
nslookup yourdomain.com
dig yourdomain.com

# Online tools (visit in browser)
# https://www.whatsmydns.net/
# https://dnschecker.org/
```

**Note**: DNS propagation can take up to 24-48 hours, but usually completes within 1-2 hours.

## Step 5: Test Your Setup

1. **Test HTTP access** (should redirect to HTTPS on Hetzner):

   ```
   http://yourdomain.com
   ```

2. **Test HTTPS access**:

   ```
   https://yourdomain.com
   ```

3. **Test www subdomain**:

   ```
   https://www.yourdomain.com
   ```

4. **Test health endpoint**:
   ```
   https://yourdomain.com/api/health
   ```

## Troubleshooting

### Common Issues

1. **"Domain not found" error**:

   - Check DNS records are correctly configured
   - Wait for DNS propagation (up to 24 hours)
   - Verify TTL settings

2. **SSL certificate errors on Hetzner**:

   - Ensure domain points to correct IP
   - Check certificate files exist and have correct permissions
   - Restart nginx container

3. **DigitalOcean domain verification fails**:
   - Ensure CNAME records point to the correct app URL
   - Check domain configuration in DigitalOcean dashboard
   - Verify domain ownership

### Support Contacts

- **Domain Provider Support**: Contact your domain provider's support team
- **DigitalOcean Support**: Available through their support tickets
- **Hetzner Support**: Available through their help center
- **Common Domain Providers**:
  - Namecheap: Live chat and tickets
  - GoDaddy: Phone and online support
  - Cloudflare: Community forum and enterprise support
  - mijnhost.be: Customer portal support

## Security Considerations

1. **Enable HTTPS everywhere**: Both configurations force HTTPS
2. **Set up HSTS**: Included in nginx configuration for Hetzner
3. **Regular certificate renewal**: Automated for both platforms
4. **Monitor certificate expiry**: Set up alerts for certificate renewal

## Cost Implications

- **Domain registration**: Usually $10-20/year depending on TLD and provider
- **SSL certificates**: Free with Let's Encrypt (both platforms)
- **DNS management**: Usually included with domain registration
- **No additional hosting costs** for domain configuration

### Typical Domain Costs by Provider:

- **Namecheap**: $8-15/year (.com, .org, .net)
- **GoDaddy**: $12-20/year (.com, .org, .net)
- **Cloudflare**: $8-15/year (.com, .org, .net)
- **mijnhost.be**: €10-15/year (.nl, .be, .com)

## Example Configuration

Here's a complete example for domain `poker-planning.example`:

### DNS Records at your domain provider:

```
Type: A
Name: @
Value: 95.217.123.456  # Your Hetzner IP
TTL: 3600

Type: A
Name: www
Value: 95.217.123.456  # Your Hetzner IP
TTL: 3600
```

### Environment Variables:

```bash
NEXTAUTH_URL=https://poker-planning.example
NEXT_PUBLIC_APP_URL=https://poker-planning.example
```

### Nginx Server Name:

```nginx
server_name poker-planning.example www.poker-planning.example;
```

### SSL Certificate Command:

```bash
certbot certonly --standalone -d poker-planning.example -d www.poker-planning.example
```

This setup will make your poker planning application available at `https://poker-planning.example` with automatic HTTPS redirects and proper SSL certificates.

## Provider-Specific Notes

### Cloudflare

- Offers free SSL/TLS certificates
- Built-in CDN and DDoS protection
- May require disabling proxy (orange cloud) for initial setup

### Namecheap

- DNS changes typically propagate within 30 minutes
- WhoisGuard privacy protection included with most domains
- Use "Advanced DNS" tab for record management

### GoDaddy

- DNS management in "My Products" → "DNS"
- Changes can take up to 24 hours to propagate
- May have default parking page records to remove

### mijnhost.be

- Navigate to "Mijn Domeinen" (My Domains)
- DNS settings in "DNS" section
- Supports all standard record types
