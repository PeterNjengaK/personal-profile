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

## Profile Studio

Open `/admin/` and sign in with the `ADMIN_PASSWORD` configured for that environment.
The studio includes profile fields, page headings, portfolio and experience collections,
social links, and an Advanced JSON editor. Use the arrow controls to reorder collection
items. Changes appear on the public pages only after **Save & publish** succeeds.
Advanced edits and visual fields stay in sync, and custom fields are preserved.

The public pages and studio share a plum, copper, and ivory palette. Public styling is
in `profile.css`; the studio uses `admin/admin.css`. The site still runs with `npm start`
and the existing Render blueprint. Local `.env` values and `.local-preview/` browser
checks are ignored by Git and should not be included in deployment uploads.
