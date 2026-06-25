# Custom Flask routes for the psiTurk experiment server.
from flask import Blueprint

custom_code = Blueprint(
    "custom_code",
    __name__,
    template_folder="templates",
    static_folder="static",
)

# Add project-specific routes here if needed.
