"""User service - Business logic for user operations"""

from sqlalchemy import asc, desc, or_

from app.config.extensions import db
from app.layers.models.user import User, UserRole
from app.utils.exceptions import ConflictError, NotFoundError
from app.utils.password import hash_password


def get_by_id(user_id):
    user = db.session.get(User, user_id)
    if not user:
        raise NotFoundError("Pengguna tidak ditemukan")
    return user


def get_all(
    page=1,
    per_page=20,
    search=None,
    role=None,
    is_verified=None,
    is_active=None,
    sort_by="created_at",
    sort_order="desc",
):
    query = db.session.query(User)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                User.email.ilike(search_term),
                User.name.ilike(search_term),
            )
        )

    if role:
        query = query.filter(User.role == UserRole(role))

    if is_verified is not None:
        query = query.filter(User.is_verified == is_verified)

    if is_active is not None:
        query = query.filter(User.is_active == is_active)

    # Get total count
    total = query.count()

    # Apply sorting
    sort_column = getattr(User, sort_by, User.created_at)
    sort_func = desc if sort_order == "desc" else asc
    query = query.order_by(sort_func(sort_column))

    # Apply pagination
    offset = (page - 1) * per_page
    users = query.offset(offset).limit(per_page).all()

    return users, total


def create(name, email, password, role):
    # Check for unique constraints
    existing = db.session.query(User).filter(User.email == email.lower()).first()
    if existing:
        raise ConflictError("Email sudah digunakan")

    user = User(
        email=email.lower(),
        password_hash=hash_password(password),
        name=name,
        role=UserRole(role),
        is_verified=True,
        auth_provider="local",
    )
    db.session.add(user)
    db.session.commit()
    return user


def update(user, **kwargs):
    # Check for unique constraints

    if "email" in kwargs and kwargs["email"]:
        existing = (
            db.session.query(User)
            .filter(User.email == kwargs["email"].lower(), User.id != user.id)
            .first()
        )
        if existing:
            raise ConflictError("Email sudah terdaftar")
        kwargs["email"] = kwargs["email"].lower()

    if "password" in kwargs and kwargs["password"]:
        kwargs["password"] = hash_password(kwargs["password"])

    # Handle role conversion
    if "role" in kwargs and kwargs["role"]:
        kwargs["role"] = UserRole(kwargs["role"])

    # Update fields
    for key, value in kwargs.items():
        if value is not None and hasattr(user, key):
            setattr(user, key, value)

    db.session.commit()
    return user


def delete(user_id):
    user = db.session.get(User, user_id)
    if not user:
        raise NotFoundError("Pengguna tidak ditemukan")

    db.session.delete(user)
    db.session.commit()


def upload_avatar(user, file_url):
    user.avatar_url = file_url
    db.session.commit()
    return user


def deactivate(user_id):
    user = db.session.get(User, user_id)
    if not user:
        raise NotFoundError("Pengguna tidak ditemukan")

    user.is_active = False
    db.session.commit()

    return user


def activate(user_id):
    user = db.session.get(User, user_id)
    if not user:
        raise NotFoundError("Pengguna tidak ditemukan")

    user.is_active = True
    db.session.commit()

    return user
