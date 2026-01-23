from fetcher.req import AuthRequest
from datetime import date, timedelta

def current_week_bounds():
    today = date.today()
    start_of_week = today - timedelta(days=today.weekday())  # Monday
    end_of_week = start_of_week + timedelta(days=6)           # Sunday

    return start_of_week.isoformat(), end_of_week.isoformat()

class Subject:
    def __init__(self, name: str,id: int):
        self.name = name
        self.id = id

    def __str__(self):
        return f"{self.name} ({self.id})"


class SubjectFetcher:
    def __init__(self, session: str):
        self.fetcher = AuthRequest(session)

    def get_subjects(self):
        st, en = current_week_bounds()
        url = f"https://www.easistent.com/m/timetable/weekly?from={st}&to={en}"
        data = self.fetcher.send_request(url)
        if data is None:
            return None
        result = []
        for event in data["school_hour_events"]:
            subject = event["subject"]
            for s in result:
                if s.name == subject["name"]:
                    break
            else:
                result.append(Subject(name=subject["name"], id=subject["id"]))

        return result

    def get_subject_name_pairs(self):
        url = "https://www.easistent.com/m/timetable/"
        data = self.fetcher.send_request(url)
        if data is None:
            return {}

        result = {}
        for event in data["school_hour_events"]:
            result[event["short_name"]] = event["name"]

        return result



