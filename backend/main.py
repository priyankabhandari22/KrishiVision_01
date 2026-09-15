"""
main.py
-------
FastAPI application entry point for KrishiVision backend service.
"""

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from backend.routes import router as api_router
from backend.middleware import OptionalApiKeyMiddleware

app = FastAPI(
    title="KrishiVision API",
    description="AI-powered Crop Disease Detection & Advisory Service",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(OptionalApiKeyMiddleware)

HEATMAP_DIR = Path(__file__).resolve().parent / "static" / "heatmaps"
HEATMAP_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=HEATMAP_DIR.parent), name="static")

FRONTEND_DIR = Path(__file__).resolve().parents[1] / "frontend"
if FRONTEND_DIR.exists():
    app.mount("/frontend", StaticFiles(directory=FRONTEND_DIR), name="frontend")
    FRONTEND_DIST_DIR = FRONTEND_DIR / "dist"
    if FRONTEND_DIST_DIR.exists():
        app.mount(
            "/assets",
            StaticFiles(directory=FRONTEND_DIST_DIR / "assets"),
            name="frontend-assets",
        )

@app.get("/", include_in_schema=False)
async def serve_index():
    index_file = FRONTEND_DIR / "dist" / "index.html"
    if not index_file.exists():
        index_file = FRONTEND_DIR / "index.html"
    if not index_file.exists():
        index_file = FRONTEND_DIR / "pages" / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return {"message": "KrishiVision API is running. Access API docs at /docs."}

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return FileResponse(FRONTEND_DIR / "assets" / "leaf.svg")

app.include_router(api_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)

