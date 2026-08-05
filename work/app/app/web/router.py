from fastapi import APIRouter, Depends, Form, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates

from app.core.dependencies import (
    get_prediction_service,
    get_race_service,
    get_status_service,
)
from app.schemas.prediction import VARIABLE_LABELS
from app.services.prediction_service import PredictionService
from app.services.race_service import RaceService
from app.services.status_service import StatusService

web_router = APIRouter()
templates = Jinja2Templates(directory="app/templates")
templates.env.auto_reload = True
templates.env.cache = {}

@web_router.get("/", response_class=HTMLResponse)
async def home(
    request: Request,
    race_service: RaceService = Depends(get_race_service),
    status_service: StatusService = Depends(get_status_service),
):
    venues = await race_service.list_venues()
    status = await status_service.get_status()
    return templates.TemplateResponse(
        request=request,
        name="home.html",
        context={"request": request, "venues": venues, "status": status},
    )


@web_router.get("/venues/{meeting_id}", response_class=HTMLResponse)
async def venue_page(
    meeting_id: int,
    request: Request,
    race_service: RaceService = Depends(get_race_service),
    status_service: StatusService = Depends(get_status_service),
):
    venue = await race_service.get_venue(meeting_id)
    status = await status_service.get_status()
    return templates.TemplateResponse(
        request=request,
        name="venue.html",
        context={"request": request, "venue": venue, "status": status},
    )


@web_router.get("/races/{race_id}", response_class=HTMLResponse)
async def race_page(
    race_id: int,
    request: Request,
    race_service: RaceService = Depends(get_race_service),
    status_service: StatusService = Depends(get_status_service),
):
    race = await race_service.get_race_view(race_id)
    status = await status_service.get_status()
    return templates.TemplateResponse(
        request=request,
        name="race_detail.html",
        context={"request": request, "race": race, "status": status},
    )


@web_router.get("/horses/{horse_id}", response_class=HTMLResponse)
async def horse_page(
    horse_id: int,
    request: Request,
    race_service: RaceService = Depends(get_race_service),
):
    horse = await race_service.get_horse_view(horse_id)
    return templates.TemplateResponse(
        request=request,
        name="horse_detail.html",
        context={"request": request, "horse": horse},
    )


@web_router.get("/races/{race_id}/analytics", response_class=HTMLResponse)
async def analytics_page(
    race_id: int,
    request: Request,
    race_service: RaceService = Depends(get_race_service),
):
    race = await race_service.get_race_view(race_id)
    variables = [{"code": code, "label": label} for code, label in VARIABLE_LABELS.items()]
    return templates.TemplateResponse(
        request=request,
        name="analytics.html",
        context={"request": request, "race": race, "variables": variables},
    )


@web_router.post("/races/{race_id}/prediction", response_class=HTMLResponse)
async def prediction_page(
    race_id: int,
    request: Request,
    selected_variables: list[str] = Form(...),
    prediction_service: PredictionService = Depends(get_prediction_service),
):
    result = await prediction_service.run_prediction(race_id, selected_variables)
    return templates.TemplateResponse(
        request=request,
        name="prediction_results.html",
        context={"request": request, "result": result},
    )


@web_router.get("/races/{race_id}/prediction", response_class=HTMLResponse)
async def prediction_page_redirect(race_id: int):
    return RedirectResponse(url=f"/races/{race_id}/analytics", status_code=303)


@web_router.get("/races/{race_id}/final/{horse_id}", response_class=HTMLResponse)
async def final_horse_page(
    race_id: int,
    horse_id: int,
    request: Request,
    prediction_service: PredictionService = Depends(get_prediction_service),
    race_service: RaceService = Depends(get_race_service),
):
    latest = await prediction_service.run_prediction(
        race_id, ["trainer_ranking", "jockey_rating", "starting_price"]
    )
    selected = next((item for item in latest.predictions if item.horse_id == horse_id), None)
    horse = await race_service.get_horse_view(horse_id)
    return templates.TemplateResponse(
        request=request,
        name="final_horse.html",
        context={"request": request, "prediction": selected, "horse": horse},
    )