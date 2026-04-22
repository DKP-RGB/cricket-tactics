import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from dotenv import load_dotenv

# Optional: Import vertexai if available
try:
    import vertexai
    from vertexai.generative_models import GenerativeModel
    VERTEX_AVAILABLE = True
except ImportError:
    VERTEX_AVAILABLE = False

load_dotenv()

app = FastAPI(title="CrickGraph Tactical Engine")

# CORS Configuration for Vercel
# IMPORTANT: Replace "*" with your actual Vercel URL in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AI Setup
PROJECT_ID = os.getenv("GCP_PROJECT_ID", "your-project-id")
LOCATION = os.getenv("GCP_LOCATION", "asia-south1")

if VERTEX_AVAILABLE:
    try:
        vertexai.init(project=PROJECT_ID, location=LOCATION)
        model = GenerativeModel("gemini-1.5-flash")
    except Exception as e:
        print(f"Vertex AI initialization failed: {e}")
        model = None
else:
    model = None

class MatchState(BaseModel):
    match_id: str
    status: str
    teams: Dict[str, Any]
    current_state: Dict[str, Any]
    graph: Dict[str, Any]
    tactical_insight: str

@app.get("/api/match-state", response_model=MatchState)
async def get_match_state():
    try:
        data_path = os.path.join(os.path.dirname(__file__), "match_data.json")
        with open(data_path, "r") as f:
            data = json.load(f)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze-over")
async def analyze_over(current_nodes: List[Dict[str, Any]]):
    system_prompt = (
        "Analyze the current match nodes [Batter, Bowler, Pitch]. "
        "Identify one invisible tactical shift—such as a subtle change in bowling angle, "
        "footwork, or matchup vulnerability—that commentators haven't noted. "
        "Insight must be <25 words."
    )
    
    prompt = f"Nodes: {json.dumps(current_nodes)}"
    
    if model:
        try:
            response = model.generate_content([system_prompt, prompt])
            return {"insight": response.text.strip()}
        except Exception as e:
            return {"insight": f"Mock: Bowler adjusting seam position to exploit the subtle breeze. (System error: {str(e)})"}
    else:
        return {"insight": "Mock Insight: Bowler is slightly pulling back the length to account for the lack of dew, forcing more vertical bat play."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8080)))
