# Deployment Guide: GitHub + Vercel

This guide will help you push your CO₂ Calculator to GitHub and deploy it on Vercel.

## Prerequisites

1. **Install Git** (if not already installed):
   - Download from: https://git-scm.com/download/win
   - Install with default settings
   - Restart your terminal/IDE after installation

2. **Create a GitHub account** (if you don't have one):
   - Sign up at: https://github.com

3. **Create a Vercel account** (if you don't have one):
   - Sign up at: https://vercel.com (you can use your GitHub account)

---

## Step 1: Initialize Git Repository

Open PowerShell or Command Prompt in your project folder and run:

```powershell
# Navigate to your project directory
cd "C:\Users\user\Desktop\Concrete Mineralization CO2 calculator"

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: CO2 Mineralization Calculator"
```

---

## Step 2: Create GitHub Repository

1. Go to https://github.com and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Fill in:
   - **Repository name**: `co2-mineralization-calculator` (or your preferred name)
   - **Description**: "CO₂ Mineralization Calculator for concrete carbonation"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have files)
4. Click **"Create repository"**

---

## Step 3: Push Code to GitHub

After creating the repository, GitHub will show you commands. Use these (replace `YOUR_USERNAME` with your GitHub username):

```powershell
# Add GitHub remote (replace YOUR_USERNAME with your actual GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/co2-mineralization-calculator.git

# Rename main branch (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Note**: You'll be prompted for your GitHub username and password. For password, use a **Personal Access Token** (not your GitHub password):
- Go to: https://github.com/settings/tokens
- Click "Generate new token" → "Generate new token (classic)"
- Give it a name, select `repo` scope, and generate
- Copy the token and use it as your password

---

## Step 4: Deploy to Vercel

### Option A: Deploy via Vercel Website (Recommended)

1. Go to https://vercel.com and sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository (`co2-mineralization-calculator`)
4. Configure project:
   - **Framework Preset**: Other (or leave default)
   - **Root Directory**: `./` (default)
   - **Build Command**: Leave empty (static site, no build needed)
   - **Output Directory**: Leave empty
   - **Install Command**: Leave empty
5. Click **"Deploy"**
6. Wait for deployment (usually 30-60 seconds)
7. Your site will be live at: `https://your-project-name.vercel.app`

### Option B: Deploy via Vercel CLI

```powershell
# Install Vercel CLI globally
npm install -g vercel

# Deploy (run from your project directory)
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? (press Enter for default)
# - Directory? (press Enter for default)
```

---

## Step 5: Configure Vercel for Static Site

Since this is a static HTML site, you may need to configure Vercel:

1. Go to your project on Vercel dashboard
2. Go to **Settings** → **General**
3. Under **Build & Development Settings**:
   - **Framework Preset**: Other
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
   - **Install Command**: (leave empty)
4. Save changes

**Important**: Make sure your HTML file is named `index.html` for Vercel to serve it as the main page. If you want to keep `co2_calculator (1).html`, you can either:
- Rename it to `index.html`, OR
- Create a `vercel.json` configuration file (see below)

---

## Optional: Create vercel.json Configuration

If you want to keep your current filename, create a `vercel.json` file:

```json
{
  "rewrites": [
    {
      "source": "/",
      "destination": "/co2_calculator (1).html"
    }
  ]
}
```

**OR** rename your HTML file to `index.html` (recommended):

```powershell
# Rename the HTML file
Rename-Item "co2_calculator (1).html" "index.html"
```

Then update `calculator.js` and `styles.css` references if needed (they should still work).

---

## Future Updates

To update your deployed site:

```powershell
# Make your changes to files
# Then commit and push:
git add .
git commit -m "Description of your changes"
git push

# Vercel will automatically redeploy!
```

---

## Troubleshooting

### Git Issues
- **"git is not recognized"**: Install Git from https://git-scm.com/download/win
- **Authentication failed**: Use Personal Access Token instead of password
- **Remote already exists**: Run `git remote remove origin` then add again

### Vercel Issues
- **404 Error**: Make sure your main HTML file is named `index.html` or configure `vercel.json`
- **Assets not loading**: Check that CSS/JS file paths are correct (relative paths)
- **Build failed**: This is a static site, so no build is needed - check Framework Preset is set to "Other"

---

## Quick Reference Commands

```powershell
# Initialize and first push
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main

# Future updates
git add .
git commit -m "Update description"
git push
```

---

## Need Help?

- **Git Documentation**: https://git-scm.com/doc
- **GitHub Guides**: https://guides.github.com
- **Vercel Documentation**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support
