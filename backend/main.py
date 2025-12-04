from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from database import engine, Base
from routers import movements, budgets, dashboard, auth, users, categories, config, recurring, families, search

Base.metadata.create_all(bind=engine)

# Rate limiting
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="SpeseCasa Lite API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(families.router)  # NEW: Family management
app.include_router(categories.router)
app.include_router(movements.router)
app.include_router(budgets.router)
app.include_router(dashboard.router)
app.include_router(config.router)
app.include_router(recurring.router)
app.include_router(search.router)  # NEW: Global search

@app.get("/")
def read_root():
    return {"message": "SpeseCasa Lite API is running"}
