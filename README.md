# Visionary Writings Infrastructure

## Overview
This project deploys an Astro.js SSR application on AWS using Terraform. The infrastructure is modular, scalable, and follows AWS best practices.

## Architecture

```
┌─────────────┐
│   Internet  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│            VPC (10.0.0.0/16)            │
│                                         │
│  ┌────────────────────────────────┐    │
│  │  Public Subnet (10.0.1.0/24)   │    │
│  │                                 │    │
│  │  ┌──────────────────────────┐  │    │
│  │  │   EC2 (Ubuntu 22.04)     │  │    │
│  │  │   - Node.js 20           │  │    │
│  │  │   - Nginx (reverse proxy)│  │    │
│  │  │   - PM2 (process manager)│  │    │
│  │  │   - Astro SSR App :3000  │  │    │
│  │  └──────────────────────────┘  │    │
│  │         Elastic IP              │    │
│  └────────────────────────────────┘    │
│                                         │
│  ┌────────────────────────────────┐    │
│  │ Private Subnets (10.0.2-3.0/24)│    │
│  │                                 │    │
│  │  ┌──────────────────────────┐  │    │
│  │  │   RDS MySQL 8.0          │  │    │
│  │  │   - db.t3.micro          │  │    │
│  │  │   - Multi-AZ subnets     │  │    │
│  │  └──────────────────────────┘  │    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         S3 Bucket (Private)             │
│         - app.zip storage               │
│         - EC2 downloads on boot         │
└─────────────────────────────────────────┘
```

## Project Structure

```
temp-infra/
├── modules/
│   ├── S3/                    # App storage module
│   │   ├── main.tf           # S3 bucket, zip upload
│   │   ├── variables.tf      # Module inputs
│   │   └── outputs.tf        # Bucket name/ARN
│   │
│   ├── EC2/                   # Application server module
│   │   ├── main.tf           # VPC, EC2, networking, IAM
│   │   ├── variables.tf      # Module inputs
│   │   └── outputs.tf        # Public IP, DNS
│   │
│   └── RDS/                   # Database module
│       ├── main.tf           # MySQL instance, subnets
│       ├── variables.tf      # Module inputs
│       └── outputs.tf        # Connection string
│
├── main.tf                    # Module orchestration
├── variables.tf               # Root variables
├── outputs.tf                 # Root outputs
├── providers.tf               # AWS provider config
├── terraform.tfvars           # Variable values (gitignored)
└── README.md                  # This file
```

## Deployment Flow

1. **S3 Module**: Zips Astro app → Uploads to S3
2. **EC2 Module**: Creates VPC, subnets, security groups, EC2 instance
3. **RDS Module**: Creates private subnets, MySQL database
4. **EC2 User Data**: Downloads app from S3 → Installs dependencies → Builds → Starts with PM2

## Infrastructure Components

### S3 Module
- **Purpose**: Store and transfer application code
- **Resources**:
  - S3 bucket with random suffix for uniqueness
  - Public access blocked (security)
  - Zips Astro app source directory
  - Uploads app.zip for EC2 deployment

### EC2 Module
- **Purpose**: Run Astro.js application
- **Resources**:
  - VPC with public subnet
  - Internet Gateway + Route Table
  - Security Group (ports 22, 80, 443)
  - IAM role for S3 read access
  - Elastic IP (static public IP)
  - Ubuntu 22.04 EC2 instance (t3.medium)
- **Software Stack**:
  - Node.js 20
  - pnpm (package manager)
  - PM2 (process manager)
  - Nginx (reverse proxy: 80 → 3000)
  - AWS CLI (for S3 downloads)

### RDS Module
- **Purpose**: MySQL database for application
- **Resources**:
  - 2 private subnets (multi-AZ)
  - DB subnet group
  - Security group (MySQL port 3306, EC2 only)
  - MySQL 8.0 instance (db.t3.micro)
  - Random password generation

## Deployment Process

### Initial Setup
```bash
# 1. Configure variables
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values

# 2. Initialize Terraform
terraform init

# 3. Review plan
terraform plan

# 4. Deploy
terraform apply
```

### What Happens on EC2 Boot (User Data Script)
1. Install Node.js 20, pnpm, PM2, Nginx, AWS CLI
2. Configure Nginx as reverse proxy
3. Download app.zip from S3
4. Unzip application code
5. Create .env file with secrets
6. Run `pnpm install --frozen-lockfile`
7. Run `pnpm build`
8. Generate Prisma client
9. Run database migrations
10. Start app with PM2
11. Configure PM2 to auto-start on reboot

## Security Features

- **S3**: All public access blocked, IAM-based access only
- **RDS**: Private subnets, no public access, security group restricted to EC2
- **EC2**: Security group limits ingress to necessary ports
- **Secrets**: Marked as sensitive in Terraform
- **Nginx**: Security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)

## Environment Variables

The following variables are injected into the EC2 instance:
- `DATABASE_URL` - MySQL connection string from RDS
- `ASTROAUTH_URL` - Public app URL
- `ASTROAUTH_SECRET` - Auth secret
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - OAuth
- `CAPTCHA_SITE_KEY` - Captcha integration
- `CLOUDFLARE_IMAGES_KEY` - Image CDN

## Outputs

After deployment, Terraform provides:
- `s3_bucket_name` - S3 bucket storing app
- `ec2_public_ip` - Static IP address
- `ec2_public_dns` - Public DNS name
- `app_url` - Full HTTP URL to access app

## Cost Estimate (Monthly)

- EC2 t3.medium: ~$30
- RDS db.t3.micro: ~$15
- S3 storage: <$1
- Data transfer: Variable
- **Total**: ~$50/month (dev environment)

## Limitations & Considerations

1. **User Data Runs Once**: Code updates require manual redeployment or instance replacement
2. **No Auto-Scaling**: Single EC2 instance (not HA)
3. **No HTTPS**: Need to add ACM certificate + ALB for SSL
4. **No CI/CD**: Manual terraform apply required
5. **Single Region**: Deployed to us-east-1 only

## Future Improvements

- [ ] Add Application Load Balancer for HTTPS
- [ ] Implement Auto Scaling Group
- [ ] Add CloudFront CDN
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Add monitoring (CloudWatch)
- [ ] Implement backup strategy for RDS
- [ ] Add Route53 for custom domain
- [ ] Separate staging/production environments

## Troubleshooting

### Check EC2 deployment logs
```bash
ssh -i ~/.ssh/id_rsa ubuntu@<ec2_public_ip>
sudo tail -f /var/log/user-data.log
```

### Check application logs
```bash
pm2 logs astro-app
```

### Redeploy application
```bash
# SSH into EC2
cd /home/ubuntu
aws s3 cp s3://<bucket-name>/app.zip ./app.zip
unzip -qo app.zip
pnpm install
pnpm build
pm2 restart astro-app
```

## Maintenance

### Update infrastructure
```bash
terraform plan
terraform apply
```

### Destroy infrastructure
```bash
terraform destroy
```

## Tech Stack Summary

- **IaC**: Terraform (AWS provider 6.x)
- **Cloud**: AWS (VPC, EC2, RDS, S3, IAM)
- **OS**: Ubuntu 22.04 LTS
- **Runtime**: Node.js 20
- **Framework**: Astro.js (SSR mode)
- **Database**: MySQL 8.0
- **Web Server**: Nginx
- **Process Manager**: PM2
- **Package Manager**: pnpm

## Contact

For questions or issues, contact the infrastructure team.
