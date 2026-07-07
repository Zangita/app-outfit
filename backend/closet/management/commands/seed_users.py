"""Crea las cuentas privadas de la app (sin registro público).

Uso:
    python manage.py seed_users

Las contraseñas se leen de KENYI_PASSWORD y JOEL_PASSWORD en el .env;
si no están definidas, se genera una aleatoria y se muestra una sola vez.
"""

import os
import secrets

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

ACCOUNTS = [
    {"username": "kenyi", "first_name": "Kenyi", "env": "KENYI_PASSWORD", "superuser": False},
    {"username": "joel", "first_name": "Joel", "env": "JOEL_PASSWORD", "superuser": True},
]


class Command(BaseCommand):
    help = "Crea las cuentas de Kenyi y Joel"

    def handle(self, *args, **options):
        User = get_user_model()
        for account in ACCOUNTS:
            if User.objects.filter(username=account["username"]).exists():
                self.stdout.write(f"'{account['username']}' ya existe, no se toca.")
                continue

            password = os.environ.get(account["env"])
            generated = password is None
            if generated:
                password = secrets.token_urlsafe(12)

            user = User.objects.create_user(
                username=account["username"],
                first_name=account["first_name"],
                password=password,
            )
            if account["superuser"]:
                user.is_staff = True
                user.is_superuser = True
                user.save()

            if generated:
                self.stdout.write(self.style.SUCCESS(
                    f"Cuenta '{user.username}' creada. Contraseña generada: {password}"
                ))
                self.stdout.write("Guárdala ahora: no se volverá a mostrar.")
            else:
                self.stdout.write(self.style.SUCCESS(f"Cuenta '{user.username}' creada con la contraseña del .env."))
