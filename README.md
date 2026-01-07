<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1_sbwy3kNzqzC9nG6H49Spg_x_1uYgnq3

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to GitHub Pages

This project is configured to automatically deploy to GitHub Pages using GitHub Actions.

### Setup Instructions

1. **Enable GitHub Pages** in your repository:

   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**

2. **Configure the base path** (if needed):

   - Open `.github/workflows/deploy.yml`
   - Update the `VITE_BASE_PATH` environment variable to match your repository name:
     ```yaml
     env:
       VITE_BASE_PATH: /your-repository-name/
     ```

3. **Push to main branch**:

   ```bash
   git add .
   git commit -m "Setup GitHub Pages deployment"
   git push origin main
   ```

4. **Monitor deployment**:
   - Go to the **Actions** tab in your GitHub repository
   - Watch the deployment workflow run
   - Once complete, your site will be available at: `https://your-username.github.io/demo-dashboard/`

### Manual Deployment

You can also trigger a deployment manually:

- Go to **Actions** tab → **Deploy to GitHub Pages** → **Run workflow**

### Troubleshooting

- **404 errors**: Ensure the `VITE_BASE_PATH` in the workflow matches your repository name
- **Build failures**: Check the Actions logs for detailed error messages
- **Assets not loading**: Verify that the base path is correctly configured in `vite.config.ts`
