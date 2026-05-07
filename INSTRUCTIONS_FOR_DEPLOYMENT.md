# Deployment Instructions

Your project has been reorganized into `frontend` and `backend` folders for easier deployment to Netlify and Render.

## 1. Backend Deployment (Render)
1. Create a new **Web Service** on [Render](https://render.com/).
2. Connect your repository.
3. Set the **Root Directory** to `backend`.
4. **Build Command**: `npm install`
5. **Start Command**: `npm start`
6. Add the following **Environment Variables**:
   - `PORT`: `5002` (or whatever you prefer)
   - `TURSO_DATABASE_URL`: Your Turso DB URL.
   - `TURSO_AUTH_TOKEN`: Your Turso Auth Token.
   - `JWT_SECRET`: A secure random string for authentication.

## 2. Frontend Deployment (Netlify)
1. Create a new site on [Netlify](https://www.netlify.com/).
2. Connect your repository.
3. Set the **Base Directory** to `frontend`.
4. **Build Command**: `npm run build`
5. **Publish Directory**: `frontend/dist` (Note: Netlify usually auto-detects this as `dist` relative to base).
6. Add the following **Environment Variables**:
   - `VITE_API_URL`: The URL of your backend on Render (e.g., `https://your-app.onrender.com/api/`).
   - `VITE_UPLOADS_URL`: The URL of your backend on Render (e.g., `https://your-app.onrender.com`).

## 3. Database (Turso)
Your project is already configured to use Turso. Ensure your `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are correctly set in the Render environment variables.

---
**Note**: Since the folder structure changed, you may need to run `npm install` in both `frontend` and `backend` directories locally to continue development.
