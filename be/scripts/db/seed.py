"""
Database seeding script.
Run with: python -m scripts.db.seed
"""

import os
import sys

sys.path.insert(
    0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)

from app import create_app
from app.config.extensions import db
from app.layers.models.user import User, UserRole
from app.utils.password import hash_password

# ============================================================
# USERS
# ============================================================
SEED_USERS = [
    {
        "email": "admin@example.com",
        "name": "admin",
        "password": "Admin123!",
        "role": UserRole.ADMIN,
        "is_verified": True,
        "auth_provider": "local",
        "avatar_url": "https://i.pravatar.cc/150?img=1",
    },
    {
        "email": "user1@example.com",
        "name": "testuser1",
        "password": "User123!",
        "role": UserRole.USER,
        "is_verified": True,
        "auth_provider": "local",
        "avatar_url": "https://i.pravatar.cc/150?img=2",
    },
    {
        "email": "user2@example.com",
        "name": "testuser2",
        "password": "User123!",
        "role": UserRole.USER,
        "is_verified": True,
        "auth_provider": "local",
        "avatar_url": "https://i.pravatar.cc/150?img=3",
    },
    {
        "email": "user3@example.com",
        "name": "testuser3",
        "password": "User123!",
        "role": UserRole.USER,
        "is_verified": True,
        "auth_provider": "local",
        "avatar_url": "https://i.pravatar.cc/150?img=4",
    },
    {
        "email": "user4@example.com",
        "name": "testuser4",
        "password": "User123!",
        "role": UserRole.USER,
        "is_verified": True,
        "auth_provider": "local",
        "avatar_url": "https://i.pravatar.cc/150?img=5",
    },
    {
        "email": "user5@example.com",
        "name": "testuser5",
        "password": "User123!",
        "role": UserRole.USER,
        "is_verified": True,
        "auth_provider": "local",
        "avatar_url": "https://i.pravatar.cc/150?img=6",
    },
]


# ============================================================
# SEEDER FUNCTIONS
# ============================================================
def seed_users():
    print("\n📌 Seeding Users...")
    created = 0
    user_ids = []

    for data in SEED_USERS:
        existing = db.session.query(User).filter_by(email=data["email"]).first()
        if existing:
            user_ids.append(existing.id)
            print(f"  Skip: {data['email']} sudah ada")
            continue

        user = User(
            email=data["email"],
            name=data["name"],
            password_hash=hash_password(data["password"]),
            role=data["role"],
            is_verified=data["is_verified"],
            is_active=True,
            auth_provider=data["auth_provider"],
            avatar_url=data.get("avatar_url"),
        )
        db.session.add(user)
        db.session.flush()
        user_ids.append(user.id)
        created += 1
        print(f"  Created: {data['email']} ({data['role'].value})")

    db.session.commit()
    print(f"  ✅ {created} users dibuat")
    return user_ids


# ============================================================
# MAIN
# ============================================================
def run_seed():
    app = create_app()
    with app.app_context():
        print("=" * 50)
        print("🌱 Database Seeding — Transmotion")
        print("=" * 50)
        db.create_all()

        seed_users()

        print("\n" + "=" * 50)
        print("🎉 Seeding selesai!")
        print("=" * 50)


if __name__ == "__main__":
    run_seed()
