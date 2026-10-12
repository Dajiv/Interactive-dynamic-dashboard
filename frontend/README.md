# Interactive Dynamic Task Dashboard Platform

React + Vite frontend for the task dashboard.

## Run locally

1. Start MySQL and run `backend/schema.sql` in MySQL Workbench.
2. Configure the backend variables in `backend/.env` and start the API:

   ```powershell
   cd ..\backend
   npm install
   npm run dev
   ```

3. In another terminal, start the frontend:

   ```powershell
   cd ..\frontend
   npm install
   npm run dev
   ```

The frontend uses `http://localhost:5000/api` by default. To use another API
URL, set `VITE_API_URL` in a frontend `.env` file.
