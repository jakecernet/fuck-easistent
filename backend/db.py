import sqlite3

from sqlite3 import Connection


from fetcher.grade import Grade

from fetcher.subject import Subject


URL = "data/database.db"


def setup():

    db = sqlite3.connect(URL)

    db.execute("PRAGMA journal_mode=WAL;")

    db.execute("PRAGMA foreign_keys=ON;")

    db.execute(
        """

            CREATE TABLE IF NOT EXISTS Users (

                id INTEGER PRIMARY KEY AUTOINCREMENT,

                username VARCHAR(20) NOT NULL UNIQUE,

                password VARCHAR(255) NOT NULL

            );
        """
    )

    db.execute(
        """

        CREATE TABLE IF NOT EXISTS Subjects (

            subject_id INT,

            user_id INT,

            subject VARCHAR(30) NOT NULL,

            subject_short VARCHAR(6) NOT NULL,

            CONSTRAINT user_id_FK FOREIGN KEY(user_id) REFERENCES Users(id) ON DELETE CASCADE,

            PRIMARY KEY (subject_id, user_id)

            );
    
    """
    )

    db.execute(
        """

        CREATE TABLE IF NOT EXISTS Grades (

            id INT,

            value UNSIGNED TINYINT CHECK(value > 0 AND value <= 5) NOT NULL,

            date DATE NOT NULL,

            subject_id INT NOT NULL,

            user_id INT,

            entered_by VARCHAR(32) NOT NULL,

            semester TINYINT NOT NULL,

            type VARCHAR(30) NOT NULL,

            CONSTRAINT subject_FK FOREIGN KEY(subject_id, user_id) REFERENCES Subjects(subject_id, user_id) ON DELETE CASCADE,

            PRIMARY KEY(id, user_id)

        );
    """
    )

    db.execute(
        """

        CREATE TABLE IF NOT EXISTS Logins (

            user_id INT PRIMARY KEY,

            username VARCHAR(64) NOT NULL,

            password VARCHAR(64) NOT NULL,

            last_grade_id INT DEFAULT NULL,

            ses TEXT DEFAULT NULL,

            CONSTRAINT logins_user_id_FK FOREIGN KEY(user_id) REFERENCES Users(id) ON DELETE CASCADE

        );
    """
    )

    db.execute(
        """

        CREATE TABLE IF NOT EXISTS Invites (

            invite_id INTEGER PRIMARY KEY AUTOINCREMENT,

            code VARCHAR(8) NOT NULL UNIQUE

        );

"""
    )

    db.execute(
        """
    CREATE TABLE IF NOT EXISTS ServerInfo (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        last_check INTEGER DEFAULT None,
        last_full_check INTEGER DEFAULT None
    )
    """
    )

    db.execute(
        """
        INSERT OR IGNORE INTO ServerInfo (id) VALUES (1);
    """
    )

    db.commit()


def connect() -> Connection:
    db = sqlite3.connect(URL)

    db.execute("PRAGMA foreign_keys=ON;")
    return db


def clear_data(user_id):
    db = connect()
    try:
        db.execute("DELETE FROM Grades WHERE user_id = ?", (user_id,))
        db.execute("DELETE FROM Subjects WHERE user_id = ?", (user_id,))
        db.execute("DELETE FROM Logins WHERE user_id = ?", (user_id,))
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        print("[ERROR]", e)
        return False


def set_last_check_time(last_check_time: int):
    db = connect()
    db.execute("UPDATE ServerInfo SET last_check = ? WHERE id = 1", (last_check_time,))
    db.commit()


def set_last_full_check_time(last_full_check_time: int):
    db = connect()
    db.execute(
        "UPDATE ServerInfo SET last_full_check = ? WHERE id = 1",
        (last_full_check_time,),
    )
    db.commit()


def get_server_info():
    db = connect()
    res = db.execute("SELECT * FROM ServerInfo WHERE id = 1")
    _, last_check, last_full_check = res.fetchone()

    return {"last_check": last_check, "last_full_check": last_full_check}


def delete_user(user_id):
    db = connect()

    try:

        db.execute("DELETE FROM Users WHERE id = ? AND username <> 'admin'", (user_id,))

        db.commit()

        return True  # Will return True also for admin but it doesnt delete it so its ok

    except Exception as e:
        db.rollback()
        print(e)

        return False


def list_invites():

    db = connect()

    res = db.execute("SELECT * FROM Invites")

    codes = []

    for c in res.fetchall():

        code_id, code = c

        codes.append({"code_id": code_id, "code": code})

    return codes


def insert_invite(code: str):

    db = connect()

    try:

        db.execute("INSERT INTO Invites (code) VALUES (?)", (code,))

        db.commit()
        return True

    except Exception as e:

        print(e)
        db.rollback()
        return False


def invite_code_exists(code: str):

    db = connect()

    res = db.execute("SELECT * FROM Invites WHERE Invites.code = ?", (code,))

    return len(res.fetchall()) > 0


def remove_invite_code(code: str):

    db = connect()

    try:

        db.execute("DELETE FROM Invites WHERE Invites.code = ?", (code,))

        db.commit()
        return True

    except Exception as e:
        db.rollback()
        return False


def insert_subject(user_id, subject: Subject, long_name: str):

    db = connect()

    try:

        db.execute(
            "INSERT INTO Subjects VALUES(?,?,?,?)",
            (subject.id, user_id, long_name, subject.name),
        )

        db.commit()
        return True

    except Exception as e:
        db.rollback()
        print("Error: ", e)

    return False


def insert_grade(user_id, grade: Grade):

    db = connect()

    res = db.execute(
        "SELECT subject_id FROM Subjects WHERE subject_id = ? AND user_id = ?",
        (grade.subject_id, user_id),
    )

    if res.fetchone() is None:

        ok = insert_subject(
            user_id,
            Subject(id=grade.subject_id, name=grade.short_subject),
            long_name=grade.subject,
        )

        if not ok:

            return False

    try:

        db.execute(
            "INSERT INTO Grades VALUES (?, ?, ?, ?,?, ?, ?, ?)",
            (
                grade.grade_id,
                grade.value,
                grade.date,
                grade.subject_id,
                user_id,
                grade.entered_by,
                grade.semester,
                grade.type,
            ),
        )

        db.commit()
        return True

    except Exception as e:
        db.rollback()
        print("Error: ", e)

    return False


def get_grades(user_id, subject_id=None):

    db = connect()

    if subject_id is not None:

        res = db.execute(
            "SELECT * FROM Grades WHERE Grades.subject_id = ? AND Grades.user_id = ?",
            (subject_id, user_id),
        )

    else:

        res = db.execute(
            "SELECT * FROM Grades WHERE Grades.user_id = ? ORDER BY Grades.date DESC",
            (user_id,),
        )

    response = []

    for g in res.fetchall():

        id, value, date, subject_id, user_id, entered_by, semester, type2 = g

        response.append(
            {
                "id": id,
                "value": value,
                "date": date,
                "subject_id": subject_id,
                "entered_by": entered_by,
                "semester": semester,
                "type": type2,
            }
        )

    return response


def get_summarized_grades(user_id):

    db = connect()

    res = db.execute(
        """
        SELECT Subjects.subject_id, Grades.id, Grades.value, Subjects.subject_short
        FROM Subjects
        INNER JOIN Grades
        ON Grades.subject_id = Subjects.subject_id
        WHERE Subjects.user_id = ?
        ORDER BY Grades.date DESC

    """,
        (user_id,),
    )

    result = []

    for g in res.fetchall():
        subj_id, grade_id, value, subject = g
        result.append(
            {
                "subject_id": subj_id,
                "grade_id": grade_id,
                "value": value,
                "subject": subject,
            }
        )

    return result


def get_subjects(user_id, subject_id=None):

    db = connect()
    if subject_id is None:
        res = db.execute(
            "SELECT * FROM Subjects WHERE Subjects.user_id = ?", (user_id,)
        )
    else:
        res = db.execute(
            "SELECT * FROM Subjects WHERE Subjects.user_id = ? AND Subjects.subject_id = ?",
            (user_id, subject_id),
        )
    response = []
    for g in res.fetchall():
        id, user_id, name, short_name = g
        response.append({"id": id, "name": name, "short_name": short_name})

    return response


def get_grade(user_id, grade_id):

    db = connect()

    res = db.execute(
        "SELECT * FROM Grades WHERE Grades.id = ? AND Grades.user_id = ?",
        (grade_id, user_id),
    )

    g = res.fetchone()
    if g is None:
        return {}

    id, value, date, subject_id, user_id, entered_by, semester, type2 = g

    return {
        "id": id,
        "value": value,
        "date": date,
        "subject_id": subject_id,
        "entered_by": entered_by,
        "semester": semester,
        "type": type2,
    }


def get_user(username: str):

    db = connect()

    res = db.execute("SELECT * FROM Users WHERE Users.username = ?", (username,))

    db.commit()

    g = res.fetchone()

    if g is None:

        return {}

    user_id, username, password = g

    return {
        "id": user_id,
        "username": username,
        "password": password,
    }


def insert_user(username, password_hash):

    db = connect()

    try:

        db.execute(
            "INSERT INTO Users (username, password) VALUES (?,?)",
            (username, password_hash),
        )

        db.commit()
        return True

    except:
        db.rollback()

        return False


def change_user_password(user_id, new_password_hash):

    db = connect()

    try:

        db.execute(
            "UPDATE Users SET password = ? WHERE id = ?",
            (new_password_hash, user_id),
        )

        db.commit()
        return True

    except Exception as e:

        print("[ERROR]", e)
        db.rollback()
        return False


def insert_login_info(user_id, username, password):

    db = connect()

    try:

        db.execute(
            """INSERT INTO Logins VALUES (?,?,?, NULL, NULL)

                ON CONFLICT(user_id) DO UPDATE SET

                username = excluded.username,

                password = excluded.password
            """,
            (user_id, username, password),
        )

        db.commit()
        return True

    except:
        db.rollback()
        return False


def set_last_grade_fetched(user_id, new):

    db = connect()

    db.execute(
        "UPDATE Logins SET last_grade_id = ? WHERE Logins.user_id = ?",
        (
            new,
            user_id,
        ),
    )

    db.commit()


def set_session(user_id, session):

    db = connect()

    db.execute(
        "UPDATE Logins SET ses = ? WHERE Logins.user_id = ?",
        (
            session,
            user_id,
        ),
    )

    db.commit()


def get_session(user_id):

    db = connect()

    res = db.execute(
        "SELECT ses, username, password FROM Logins WHERE Logins.user_id = ?",
        (user_id,),
    )

    g = res.fetchone()

    if g is None:
        return None

    ses, username, password = g

    return {"ses": ses, "username": username, "password": password}


def get_tracked_logins():

    db = connect()

    res = db.execute("SELECT * FROM Logins")

    response = []

    for g in res.fetchall():

        user_id, username, password, last_fetched, ses = g

        response.append(
            {
                "user_id": user_id,
                "username": username,
                "password": password,
                "last_fetched": last_fetched,
                "ses": ses,
            }
        )

    return response
