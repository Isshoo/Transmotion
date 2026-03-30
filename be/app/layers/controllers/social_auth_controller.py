"""Social Auth controller"""

from flask import request
from marshmallow import Schema, ValidationError, fields, validate

from app.layers.services import social_auth_service
from app.utils.response import error_response, success_response


class GoogleAuthSchema(Schema):
    error_messages = {"unknown": "Kolom tidak dikenal"}
    access_token = fields.String(
        required=True, error_messages={"required": "Access token harus diisi"}
    )
    intent = fields.String(
        load_default="login", validate=validate.OneOf(["login", "register"])
    )


def google_auth():
    try:
        data = GoogleAuthSchema().load(request.get_json() or {})
    except ValidationError as err:
        return error_response(
            message=f"Validasi gagal: {', '.join([f'Kolom {k} tidak dikenal' if 'tidak dikenal' in v[0].lower() or 'unknown field' in v[0].lower() else v[0] for k, v in err.messages.items()])}",
            errors=[{"field": k, "message": v[0]} for k, v in err.messages.items()],
            status_code=422,
        )

    user, access_token, refresh_token, is_new = social_auth_service.google_auth(
        access_token=data["access_token"], intent=data["intent"]
    )

    return success_response(
        data={
            "user": user.to_dict(),
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "Bearer",
            "is_new_user": is_new,
        },
        message="Registrasi Google berhasil" if is_new else "Masuk Google berhasil",
        status_code=201 if is_new else 200,
    )
