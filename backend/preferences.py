from dotenv import load_dotenv
import os


class Preferences:

    @classmethod
    def init(cls):
        cls.map = dict()
        load_dotenv()

    @classmethod
    def add(cls, name: str, env_name: str, default):
        cls.map[name] = {"env_name": env_name, "default": default}

    @classmethod
    def get(cls, name: str):
        if name not in cls.map:
            print(f"[ERROR] Preference not set: {name}")
            return None

        entry = cls.map[name]
        env_name = entry["env_name"]
        default = entry["default"]

        if env_name in os.environ:
            return os.environ[env_name]

        return default
