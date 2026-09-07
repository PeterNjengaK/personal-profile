# Dynamic personal profile

## Run locally

1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env` and set `ADMIN_PASSWORD` and `JWT_SECRET`.
3. Run `npm install`, then `npm start`.
4. Open `http://localhost:3000` for the site and `http://localhost:3000/admin/` to edit it.

Without `MONGODB_URI`, changes are saved to `data/profile.json`. For production, create a free MongoDB Atlas cluster, add its connection string as `MONGODB_URI`, and deploy this Node app to Render or Railway. Add the same environment variables in the host dashboard. Never commit `.env`.

## Publish with Render

1. Push this folder to a GitHub repository.
2. In Render, choose **New > Blueprint** and select the repository. Render will use `render.yaml`.
3. Enter a strong value for `ADMIN_PASSWORD` when prompted.
4. Create a MongoDB Atlas database, allow access from Render, and paste its connection string into `MONGODB_URI` in Render.
5. Open the generated Render URL and add `/admin/` to manage the profile.

The local JSON fallback is useful for development. Use MongoDB in production because hosted filesystems are not durable.
