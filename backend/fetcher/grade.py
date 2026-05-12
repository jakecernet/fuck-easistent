from fetcher.req import AuthRequest
from datetime import datetime


class Grade:
    def __init__(
        self,
        value: int,
        entered_by: str,
        date: str,
        semester: int,
        subject: str,
        short_subject: str,
        subject_id: int,
        type: str,
        id: int,
    ):
        self.value = value
        self.entered_by = entered_by
        self.date = date
        self.semester = semester
        self.subject = subject
        self.short_subject = short_subject
        self.subject_id = subject_id
        self.type = type
        self.grade_id = id

    def __str__(self):
        return f"{self.subject}: {self.value}"


class GradeFetcher:
    def __init__(self, session: str):
        self.fetcher = AuthRequest(session)

    def fetch_for_subject(self, subject_id) -> list:

        url = f"https://www.easistent.com/m/grades/classes/{subject_id}"
        data = self.fetcher.send_request(url)
        if data is None:
            return []

        subject_data = data
        grades = []

        # Checks for all grades in case user got premium
        for semester in subject_data["semesters"]:
            for grade in semester["grades"]:
                g = Grade(
                    grade["value"],
                    entered_by=grade["inserted_by"]["name"],
                    short_subject=subject_data["short_name"],
                    date=grade["date"],
                    semester=semester["id"],
                    subject=subject_data["name"],
                    subject_id=subject_data["id"],
                    type=grade["type_name"],
                    id=grade["id"],)
                grades.append(g)

            sem_final = semester.get("final_grade")
            if sem_final and sem_final.get("value") is not None:
                grades.append(Grade(
                    int(sem_final["value"]),
                    entered_by=sem_final.get("inserted_by", {}).get("name", ""),
                    short_subject=subject_data["short_name"],
                    date=sem_final.get("date", ""),
                    semester=semester["id"],
                    subject=subject_data["name"],
                    subject_id=subject_data["id"],
                    type="Zaključena polletna",
                    id=sem_final["id"],
                ))

        year_final = subject_data.get("final_grade")
        if year_final and year_final.get("value") is not None:
            last_sem = subject_data["semesters"][-1]["id"] if subject_data.get("semesters") else 2
            grades.append(Grade(
                int(year_final["value"]),
                entered_by=year_final.get("inserted_by", {}).get("name", ""),
                short_subject=subject_data["short_name"],
                date=year_final.get("date", ""),
                semester=last_sem,
                subject=subject_data["name"],
                subject_id=subject_data["id"],
                type="Zaključena letna",
                id=year_final["id"],
            ))

        return grades

    def fetch_avg_grade_for_subject(self, subject_id):
        url = f"https://www.easistent.com/m/grades/classes/{subject_id}"
        data = self.fetcher.send_request(url)
        if data is None:
            return None
        # FIXME: Check if empty

        return data["average_grade"]

    def fetch_final(self, subject_id):
        url = f"https://www.easistent.com/m/grades/classes/{subject_id}"
        data = self.fetcher.send_request(url)
        if data is None:
            return None

        final = data["semesters"][-1]["final_grade"]
        return final

    def get_all_grades(self):
        url = f"https://www.easistent.com/m/grades/"
        data = self.fetcher.send_request(url)
        if data is None:
            return None
        if len(data["items"]) == 0:
            print("No grades...")
            return None

        grades = []

        for subject_data in data["items"]:
            for semester in subject_data["semesters"]:
                for grade in semester["grades"]:

                    grades.append({"grade_id": grade["id"], "date": grade["inserted_at"], "subject_id": subject_data["id"]})

                sem_final = semester.get("final_grade")
                fid = sem_final.get("id") if sem_final else None
                fdate = (sem_final.get("inserted_at") or sem_final.get("date")) if sem_final else None
                if fid is not None and fdate:
                    grades.append({"grade_id": fid, "date": fdate, "subject_id": subject_data["id"]})

            year_final = subject_data.get("final_grade")
            yid = year_final.get("id") if year_final else None
            ydate = (year_final.get("inserted_at") or year_final.get("date")) if year_final else None
            if yid is not None and ydate:
                grades.append({"grade_id": yid, "date": ydate, "subject_id": subject_data["id"]})

        grades.sort(
            key=lambda g: datetime.fromisoformat(g["date"]),
            reverse=True
        )

        return grades