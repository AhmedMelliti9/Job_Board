import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.routes.jobs import router as jobs_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("job_board")

app = FastAPI(
    title="Job Board API",
    description="A job board API for managing job positions",
    version="1.0.0",
)

# CORS configuration — allow requests from the frontend origin
origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """Catch unhandled errors, log them, and return a clean 500 response without leaking tracebacks."""
    logger.error(f"Unhandled server error on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Something went wrong on our end."},
    )


# Include routes
app.include_router(jobs_router)


@app.get("/")
def root():
    return {"message": "Job Board API is running"}
