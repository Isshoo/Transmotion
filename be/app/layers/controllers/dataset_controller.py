"""Dataset controller — request handlers"""

from flask import request
from marshmallow import ValidationError

from app.layers.schemas.dataset_schema import (
    DatasetListQuerySchema,
    DatasetPreprocessSchema,
    DatasetUploadSchema,
)
from app.layers.services import dataset_service
from app.utils.response import error_response, paginated_response, success_response


def _parse_validation_error(err: ValidationError):
    return error_response(
        message=f"Validasi gagal: {', '.join([v[0] for v in err.messages.values()])}",
        errors=[{"field": k, "message": v[0]} for k, v in err.messages.items()],
        status_code=422,
    )


def list_datasets():
    try:
        params = DatasetListQuerySchema().load(request.args)
    except ValidationError as err:
        return _parse_validation_error(err)

    datasets, total = dataset_service.get_all(
        page=params["page"],
        per_page=params["per_page"],
        search=params.get("search"),
        status=params.get("status"),
        sort_by=params.get("sort_by", "created_at"),
        sort_order=params.get("sort_order", "desc"),
    )
    return paginated_response(
        data=[d.to_dict(include_jobs=True) for d in datasets],
        total=total,
        page=params["page"],
        per_page=params["per_page"],
        message="Daftar dataset berhasil diambil",
    )


def get_dataset(dataset_id):
    dataset = dataset_service.get_by_id(dataset_id)
    return success_response(
        data=dataset.to_dict(include_jobs=True),
        message="Detail dataset berhasil diambil",
    )


def upload_dataset():
    # Form data: name, description (text fields) + file
    try:
        form_data = DatasetUploadSchema().load(request.form.to_dict())
    except ValidationError as err:
        return _parse_validation_error(err)

    if "file" not in request.files:
        return error_response(message="File dataset harus disertakan", status_code=400)

    file = request.files["file"]
    if not file or file.filename == "":
        return error_response(message="File tidak dipilih", status_code=400)

    dataset = dataset_service.upload(
        file=file,
        name=form_data["name"],
        description=form_data.get("description"),
        user_id=request.current_user.id,
    )
    return success_response(
        data=dataset.to_dict(),
        message="Dataset berhasil diupload",
        status_code=201,
    )


def preprocess_dataset(dataset_id):
    try:
        data = DatasetPreprocessSchema().load(request.get_json() or {})
    except ValidationError as err:
        return _parse_validation_error(err)

    dataset = dataset_service.preprocess(
        dataset_id=dataset_id,
        text_column=data["text_column"],
        label_column=data["label_column"],
        test_size=data.get("test_size", 0.1),
        val_size=data.get("val_size", 0.1),
    )
    return success_response(
        data=dataset.to_dict(),
        message="Preprocessing dataset berhasil",
    )


def delete_dataset(dataset_id):
    dataset_service.delete(dataset_id)
    return success_response(message="Dataset berhasil dihapus")
