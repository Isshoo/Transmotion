"""Dataset controller"""

from flask import current_app, request
from marshmallow import ValidationError

from app.layers.schemas.dataset_schema import (
    AddPreprocessedRowSchema,
    ColumnSettingsSchema,
    DatasetListQuerySchema,
    DatasetUploadSchema,
    PreprocessedQuerySchema,
    RawDataQuerySchema,
    UpdatePreprocessedRowSchema,
)
from app.layers.services import dataset_service
from app.utils.response import error_response, paginated_response, success_response


def _parse_err(err: ValidationError):
    return error_response(
        message=f"Validasi gagal: {', '.join([v[0] for v in err.messages.values()])}",
        errors=[{"field": k, "message": v[0]} for k, v in err.messages.items()],
        status_code=422,
    )


def list_datasets():
    try:
        params = DatasetListQuerySchema().load(request.args)
    except ValidationError as err:
        return _parse_err(err)

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
    ds = dataset_service.get_by_id(dataset_id)
    return success_response(
        data=ds.to_dict(include_jobs=True),
        message="Detail dataset berhasil diambil",
    )


def upload_dataset():
    try:
        form_data = DatasetUploadSchema().load(request.form.to_dict())
    except ValidationError as err:
        return _parse_err(err)

    if "file" not in request.files:
        return error_response(message="File dataset harus disertakan", status_code=400)
    file = request.files["file"]
    if not file or file.filename == "":
        return error_response(message="File tidak dipilih", status_code=400)

    ds = dataset_service.upload(
        file=file,
        name=form_data["name"],
        description=form_data.get("description"),
        user_id=request.current_user.id,
    )
    return success_response(
        data=ds.to_dict(), message="Dataset berhasil diupload", status_code=201
    )


def set_columns(dataset_id):
    try:
        data = ColumnSettingsSchema().load(request.get_json() or {})
    except ValidationError as err:
        return _parse_err(err)

    ds = dataset_service.set_columns(
        dataset_id=dataset_id,
        text_column=data["text_column"],
        label_column=data["label_column"],
    )
    return success_response(
        data=ds.to_dict(), message="Pengaturan kolom berhasil disimpan"
    )


def get_raw_data(dataset_id):
    try:
        params = RawDataQuerySchema().load(request.args)
    except ValidationError as err:
        return _parse_err(err)

    rows, total = dataset_service.get_raw_data(
        dataset_id=dataset_id,
        page=params["page"],
        per_page=params["per_page"],
        search=params.get("search"),
        filter_label=params.get("filter_label"),
    )
    return paginated_response(
        data=rows,
        total=total,
        page=params["page"],
        per_page=params["per_page"],
        message="Data raw berhasil diambil",
    )


def start_preprocessing(dataset_id):
    app = current_app._get_current_object()
    ds = dataset_service.start_preprocessing(dataset_id, app)
    return success_response(data=ds.to_dict(), message="Preprocessing dimulai")


def get_preprocessed_data(dataset_id):
    try:
        params = PreprocessedQuerySchema().load(request.args)
    except ValidationError as err:
        return _parse_err(err)

    rows, total = dataset_service.get_preprocessed_data(
        dataset_id=dataset_id,
        page=params["page"],
        per_page=params["per_page"],
        search=params.get("search"),
        filter_label=params.get("filter_label"),
    )
    return paginated_response(
        data=[r.to_dict() for r in rows],
        total=total,
        page=params["page"],
        per_page=params["per_page"],
        message="Data preprocessed berhasil diambil",
    )


def add_preprocessed_row(dataset_id):
    try:
        data = AddPreprocessedRowSchema().load(request.get_json() or {})
    except ValidationError as err:
        return _parse_err(err)

    row = dataset_service.add_preprocessed_row(
        dataset_id=dataset_id,
        raw_text=data["raw_text"],
        preprocessed_text=data["preprocessed_text"],
        label=data["label"],
    )
    return success_response(
        data=row.to_dict(), message="Data berhasil ditambahkan", status_code=201
    )


def update_preprocessed_row(dataset_id, row_id):
    try:
        data = UpdatePreprocessedRowSchema().load(request.get_json() or {})
    except ValidationError as err:
        return _parse_err(err)

    row = dataset_service.update_preprocessed_row(
        dataset_id=dataset_id,
        row_id=int(row_id),
        preprocessed_text=data.get("preprocessed_text"),
        label=data.get("label"),
    )
    return success_response(data=row.to_dict(), message="Data berhasil diperbarui")


def delete_preprocessed_row(dataset_id, row_id):
    dataset_service.delete_preprocessed_row(dataset_id=dataset_id, row_id=int(row_id))
    return success_response(message="Data berhasil dihapus")


def delete_dataset(dataset_id):
    dataset_service.delete(dataset_id)
    return success_response(message="Dataset berhasil dihapus")
