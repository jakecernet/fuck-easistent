import os
import random
import time

import db
from fetcher.grade import GradeFetcher
from fetcher.login import get_session_token
from fetcher.req import verify_session
from fetcher.subject import SubjectFetcher
from api.auth import password_hash
from preferences import Preferences
import asyncio

last_full_check_time = 0


async def check_for_new_grades():
    loop = asyncio.get_running_loop()
    await loop.run_in_executor(None, check_for_new_grades_sync)


def check_for_new_grades_sync():
    global last_full_check_time
    print("[Checking for new grades]")
    # Do a full check every hour
    should_full_check = int(time.time()) - last_full_check_time > Preferences.get_int(
        "check_interval_full"
    )
    if should_full_check:
        print("Doing a full check")

    for login in db.get_tracked_logins():
        user_id = login["user_id"]
        username = login["username"]
        password = login["password"]
        last_fetched = login["last_fetched"]
        ses = login["ses"]
        print(f"Checking for user {user_id}")

        if ses is None or not verify_session(ses):
            # Session invalid
            ses = get_session_token(username, password)
            db.set_session(user_id, ses)

        grade_fetcher = GradeFetcher(ses)
        grades = grade_fetcher.get_all_grades()
        if len(grades) == 0:
            continue

        last_grade_id = grades[0]["grade_id"]
        last_subject_id = grades[0]["subject_id"]

        subject_fetcher = SubjectFetcher(ses)
        subject_name_pairs = subject_fetcher.get_subject_name_pairs()

        if last_fetched is None or should_full_check:
            for subj in subject_fetcher.get_subjects():
                if subj.name in subject_name_pairs:
                    db.insert_subject(user_id, subj, subject_name_pairs[subj.name])
                fetch_and_insert_grades(subj.id, user_id, grade_fetcher)
        elif last_fetched != last_grade_id:
            fetch_and_insert_grades(last_subject_id, user_id, grade_fetcher)
            db.set_last_grade_fetched(user_id, last_grade_id)

    print("[Ended checking]")
    if should_full_check:
        last_full_check_time = int(time.time())
        db.set_last_full_check_time(last_full_check_time)
    db.set_last_check_time(int(time.time()))


def fetch_and_insert_grades(subject_id, user_id, grade_fetcher: GradeFetcher):
    grades = grade_fetcher.fetch_for_subject(subject_id)
    for grade in grades:
        try:
            db.insert_grade(user_id, grade)
        except Exception as e:
            print("[ERROR] ", e)


def ensure_admin():
    admin_password = Preferences.get("admin_password")
    hashed = password_hash.hash(admin_password, salt=random.randbytes(8))
    print("Initialized Admin")
    if admin := db.get_user("admin"):
        if password_hash.verify(admin_password, admin["password"]):
            pass  # Password is already the same so no problem
        else:
            db.change_user_password(admin["id"], hashed)
    else:
        db.insert_user("admin", hashed)

    # Ensure at least one invite code exists
    from api.invites import generate_invite
    invites = db.list_invites()
    if not invites:
        code = generate_invite()
        print(f"Generated invite code: {code}")


def init_preferences():
    Preferences.init()
    Preferences.add("admin_password", "ADMIN_PASSWORD", "changeme")
    Preferences.add("check_interval", "CHECK_INTERVAL_SECONDS", 60)
    Preferences.add("check_interval_full", "CHECK_FULL_INTERVAL_SECONDS", 60 * 60)
