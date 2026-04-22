# Live Tactical Graph Engine

A production-ready real-time cricket analytics dashboard that visualizes match data as a Knowledge Graph and surfaces AI-powered tactical shifts using Gemini 3 Flash.

## Architecture

- **Frontend**: React + Vite + Tailwind CSS (Deployed on Vercel)
- **Backend**: FastAPI (Python) (Deployed on Google Cloud Run)
- **AI**: Gemini 1.5 Flash via Vertex AI
- **Graph**: react-force-graph

## Local Setup

### Backend
1. `cd backend`
2. `pip install -r requirements.txt`
3. `python main.py` (Starts on port 8080)

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Deployment

### Backend (GCP Cloud Run)
```bash
# Set your project
gcloud config set project [PROJECT_ID]

# Build and deploy
gcloud builds submit --tag gcr.io/[PROJECT_ID]/crick-backend ./backend
gcloud run deploy crick-backend --image gcr.io/[PROJECT_ID]/crick-backend --platform managed --region asia-south1 --allow-unauthenticated
```

### Frontend (Vercel)
1. Push the `frontend` folder to a GitHub repo.
2. Connect the repo to Vercel.
3. Set Environment Variable: `VITE_API_URL` to your Cloud Run URL.
4. Deploy!
