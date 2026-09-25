from fastapi import APIRouter, Query, Depends
import requests
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, WorkoutSession


router = APIRouter(
    prefix="/gyms",
    tags=["Gym Recommender"]
)


HEADERS = {
    "User-Agent": "AI-Gym-Fitness-Assistant/1.0"
}


# ---------------------------------------------------------
# GEOCODING
# ---------------------------------------------------------

def get_coordinates(location: str):
    """
    Convert city/location name into latitude and longitude
    using OpenStreetMap Nominatim.
    """

    url = "https://nominatim.openstreetmap.org/search"

    params = {
        "q": location,
        "format": "json",
        "limit": 1
    }

    try:
        response = requests.get(
            url,
            params=params,
            headers=HEADERS,
            timeout=10
        )

        if response.status_code != 200:
            return None

        data = response.json()

        if not data:
            return None

        return {
            "latitude": float(data[0]["lat"]),
            "longitude": float(data[0]["lon"])
        }

    except requests.RequestException:
        return None


# ---------------------------------------------------------
# OVERPASS GYM SEARCH
# ---------------------------------------------------------

def search_overpass(latitude: float, longitude: float, radius: int):
    """
    Search OpenStreetMap for gyms and fitness-related places.
    """

    query = f"""
    [out:json][timeout:40];

    (
        node["leisure"="fitness_centre"](around:{radius},{latitude},{longitude});
        way["leisure"="fitness_centre"](around:{radius},{latitude},{longitude});
        relation["leisure"="fitness_centre"](around:{radius},{latitude},{longitude});

        node["sport"="fitness"](around:{radius},{latitude},{longitude});
        way["sport"="fitness"](around:{radius},{latitude},{longitude});
        relation["sport"="fitness"](around:{radius},{latitude},{longitude});

        node["sport"="gymnastics"](around:{radius},{latitude},{longitude});
        way["sport"="gymnastics"](around:{radius},{latitude},{longitude});
        relation["sport"="gymnastics"](around:{radius},{latitude},{longitude});

        node["building"="sports_centre"](around:{radius},{latitude},{longitude});
        way["building"="sports_centre"](around:{radius},{latitude},{longitude});

        node["leisure"="sports_centre"](around:{radius},{latitude},{longitude});
        way["leisure"="sports_centre"](around:{radius},{latitude},{longitude});
        relation["leisure"="sports_centre"](around:{radius},{latitude},{longitude});

        node["amenity"="gym"](around:{radius},{latitude},{longitude});
        way["amenity"="gym"](around:{radius},{latitude},{longitude});
        relation["amenity"="gym"](around:{radius},{latitude},{longitude});
    );

    out center tags;
    """

    overpass_urls = [
        "https://overpass-api.de/api/interpreter",
        "https://overpass.kumi.systems/api/interpreter",
        "https://overpass.private.coffee/api/interpreter"
    ]

    for url in overpass_urls:

        try:
            response = requests.post(
                url,
                data=query,
                headers=HEADERS,
                timeout=45
            )

            if response.status_code == 200:
                return response.json()

        except requests.RequestException:
            continue

    return None


# ---------------------------------------------------------
# FORMAT GYM DATA
# ---------------------------------------------------------

def format_gyms(data, location: str):

    gyms = []

    if not data:
        return gyms

    for index, element in enumerate(
        data.get("elements", []),
        start=1
    ):

        tags = element.get("tags", {})

        name = tags.get("name")

        # Ignore unnamed places
        if not name:
            continue

        # -----------------------------
        # Coordinates
        # -----------------------------

        if "lat" in element and "lon" in element:

            gym_lat = element["lat"]
            gym_lon = element["lon"]

        elif "center" in element:

            gym_lat = element["center"].get("lat")
            gym_lon = element["center"].get("lon")

        else:

            gym_lat = None
            gym_lon = None

        # -----------------------------
        # Address
        # -----------------------------

        address_parts = [
            tags.get("addr:housenumber"),
            tags.get("addr:street"),
            tags.get("addr:suburb"),
            tags.get("addr:city")
        ]

        address = ", ".join(
            part
            for part in address_parts
            if part
        )

        if not address:
            address = location

        # -----------------------------
        # Type
        # -----------------------------

        place_type = (
            tags.get("leisure")
            or tags.get("sport")
            or tags.get("amenity")
            or "fitness"
        )

        gyms.append({
            "id": index,
            "name": name,
            "location": address,
            "latitude": gym_lat,
            "longitude": gym_lon,
            "distance": "Nearby",
            "rating": None,
            "type": place_type,
            "programs": [
                "Fitness Training",
                "Strength Training",
                "Cardio"
            ],
            "challenges": [
                "Fitness Challenge",
                "Consistency Challenge"
            ],
            "goalMatch": "AI Match Available",
            "description": (
                f"Fitness and workout facility near {location}."
            )
        })

    return gyms


# ---------------------------------------------------------
# REMOVE DUPLICATES
# ---------------------------------------------------------

def remove_duplicates(gyms):

    unique_gyms = []
    seen_names = set()

    for gym in gyms:

        name_key = gym["name"].lower().strip()

        if name_key not in seen_names:

            seen_names.add(name_key)
            unique_gyms.append(gym)

    return unique_gyms


# ---------------------------------------------------------
# MAIN GYM SEARCH API
# ---------------------------------------------------------

@router.get("/search")
def search_gyms(
    location: str = Query(..., min_length=2)
):
    """
    Search real gyms and fitness centres near a city/location.

    Example:
    /gyms/search?location=Ahmedabad
    """

    # -----------------------------------------
    # Step 1: Get coordinates
    # -----------------------------------------

    coordinates = get_coordinates(location)

    if not coordinates:

        return {
            "success": False,
            "location": location,
            "count": 0,
            "gyms": [],
            "message": (
                f"Location '{location}' could not be found. "
                "Please enter a valid city or location."
            )
        }

    latitude = coordinates["latitude"]
    longitude = coordinates["longitude"]

    # -----------------------------------------
    # Step 2: First search - 10 km
    # -----------------------------------------

    data = search_overpass(
        latitude,
        longitude,
        10000
    )

    gyms = format_gyms(
        data,
        location
    )

    # -----------------------------------------
    # Step 3: If very few results,
    # search larger radius - 25 km
    # -----------------------------------------

    if len(gyms) < 5:

        wider_data = search_overpass(
            latitude,
            longitude,
            25000
        )

        wider_gyms = format_gyms(
            wider_data,
            location
        )

        gyms.extend(wider_gyms)

    # -----------------------------------------
    # Step 4: Remove duplicate gyms
    # -----------------------------------------

    unique_gyms = remove_duplicates(gyms)

    # -----------------------------------------
    # Step 5: Return results
    # -----------------------------------------

    return {
        "success": True,
        "location": location,
        "coordinates": {
            "latitude": latitude,
            "longitude": longitude
        },
        "count": len(unique_gyms),
        "gyms": unique_gyms[:30],
        "message": (
            f"Found {len(unique_gyms)} fitness facilities "
            f"near {location}."
            if unique_gyms
            else (
                f"No mapped gyms were found near {location}. "
                "Try entering a nearby major city."
            )
        )
    }


# =========================================================
# HISTORICAL-DATA BASED GYM RECOMMENDER
# =========================================================

@router.get("/recommend")
def recommend_gyms(
    location: str = Query(..., min_length=2),
    user_id: int = Query(..., ge=1),
    db: Session = Depends(get_db)
):
    """
    Recommend nearby gyms using:
    - Current location
    - User fitness goal
    - User activity level
    - Historical workout data
    """

    # -----------------------------------------
    # Step 1: Get user profile
    # -----------------------------------------

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:

        return {
            "success": False,
            "user_id": user_id,
            "location": location,
            "recommendations": [],
            "message": "User not found."
        }

    # -----------------------------------------
    # Step 2: Get historical workout data
    # -----------------------------------------

    workout_history = db.query(
        WorkoutSession
    ).filter(
        WorkoutSession.user_id == user_id
    ).all()

    workout_count = len(workout_history)

    # -----------------------------------------
    # Step 3: Get historical exercise data
    # -----------------------------------------

    exercise_names = []

    for workout in workout_history:

        exercise_name = getattr(
            workout,
            "exercise_name",
            None
        )

        if exercise_name:
            exercise_names.append(
                str(exercise_name).lower()
            )

    # -----------------------------------------
    # Step 4: User profile preferences
    # -----------------------------------------

    fitness_goal = (
        user.fitness_goal or "general_fitness"
    ).lower()

    activity_level = (
        user.activity_level or "moderate"
    ).lower()

    # -----------------------------------------
    # Step 5: Find nearby gyms
    # -----------------------------------------

    coordinates = get_coordinates(location)

    if not coordinates:

        return {
            "success": False,
            "user_id": user_id,
            "location": location,
            "recommendations": [],
            "message": (
                f"Location '{location}' could not be found."
            )
        }

    latitude = coordinates["latitude"]
    longitude = coordinates["longitude"]

    # Search 10 km
    data = search_overpass(
        latitude,
        longitude,
        10000
    )

    gyms = format_gyms(
        data,
        location
    )

    # Search 25 km if required
    if len(gyms) < 5:

        wider_data = search_overpass(
            latitude,
            longitude,
            25000
        )

        wider_gyms = format_gyms(
            wider_data,
            location
        )

        gyms.extend(wider_gyms)

    # Remove duplicates
    gyms = remove_duplicates(gyms)

    # -----------------------------------------
    # Step 6: Calculate historical AI score
    # -----------------------------------------

    recommendations = []

    for gym in gyms:

        score = 50
        reasons = []

        gym_name = gym["name"].lower()
        gym_type = str(
            gym.get("type", "fitness")
        ).lower()

        # -------------------------------------
        # Fitness goal
        # -------------------------------------

        if fitness_goal in [
            "weight_loss",
            "fat_loss",
            "lose_weight"
        ]:

            score += 10

            reasons.append(
                "Suitable for your weight-loss goal"
            )

        elif fitness_goal in [
            "muscle_gain",
            "muscle_building",
            "gain_muscle"
        ]:

            score += 10

            reasons.append(
                "Suitable for your muscle-building goal"
            )

        elif fitness_goal in [
            "strength",
            "strength_training"
        ]:

            score += 8

            reasons.append(
                "Suitable for strength training"
            )

        else:

            score += 5

            reasons.append(
                "Suitable for general fitness"
            )

        # -------------------------------------
        # Activity level
        # -------------------------------------

        if activity_level in [
            "high",
            "very_active",
            "advanced"
        ]:

            score += 8

            reasons.append(
                "Matches your active fitness level"
            )

        elif activity_level in [
            "moderate",
            "medium"
        ]:

            score += 5

            reasons.append(
                "Matches your moderate activity level"
            )

        else:

            score += 3

            reasons.append(
                "Suitable for your current activity level"
            )

        # -------------------------------------
        # Historical workout frequency
        # -------------------------------------

        if workout_count >= 30:

            score += 20

            reasons.append(
                "Based on your strong historical workout consistency"
            )

        elif workout_count >= 10:

            score += 12

            reasons.append(
                "Based on your regular previous workouts"
            )

        elif workout_count >= 5:

            score += 7

            reasons.append(
                "Based on your previous workout activity"
            )

        else:

            score += 3

            reasons.append(
                "Based on your available workout history"
            )

        # -------------------------------------
        # Historical exercise preference
        # -------------------------------------

        if exercise_names:

            strength_exercises = [
                "squat",
                "deadlift",
                "bench press",
                "bicep curl",
                "shoulder press"
            ]

            cardio_exercises = [
                "running",
                "running",
                "cycling",
                "walking",
                "jumping"
            ]

            if any(
                exercise in " ".join(exercise_names)
                for exercise in strength_exercises
            ):

                if (
                    "strength" in gym_type
                    or "fitness" in gym_type
                    or "gym" in gym_name
                ):

                    score += 5

                    reasons.append(
                        "Matches your previous strength-training activity"
                    )

            if any(
                exercise in " ".join(exercise_names)
                for exercise in cardio_exercises
            ):

                if (
                    "fitness" in gym_type
                    or "sport" in gym_type
                    or "gym" in gym_name
                ):

                    score += 5

                    reasons.append(
                        "Matches your previous cardio activity"
                    )

        # -------------------------------------
        # Location availability
        # -------------------------------------

        score += 5

        reasons.append(
            "Located near your selected location"
        )

        # Maximum score = 100
        score = min(score, 100)

        # -------------------------------------
        # Add recommendation information
        # -------------------------------------

        gym["historicalScore"] = score

        gym["historicalDataUsed"] = True

        gym["recommendationReason"] = ". ".join(
            reasons
        ) + "."

        recommendations.append(gym)

    # -----------------------------------------
    # Step 7: Sort recommendations
    # -----------------------------------------

    recommendations.sort(
        key=lambda gym: gym["historicalScore"],
        reverse=True
    )

    # -----------------------------------------
    # Step 8: Return recommendations
    # -----------------------------------------

    return {
        "success": True,
        "user_id": user_id,
        "location": location,
        "coordinates": {
            "latitude": latitude,
            "longitude": longitude
        },
        "historical_data_used": True,
        "workout_history_count": workout_count,
        "fitness_goal": fitness_goal,
        "activity_level": activity_level,
        "count": len(recommendations),
        "recommendations": recommendations[:10],
        "message": (
            "Gym recommendations generated using "
            "location, fitness profile and historical "
            "workout data."
        )
    }