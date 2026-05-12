from fetcher.req import AuthRequest


class ExtraFetcher:
    def __init__(self, session: str):
        self.fetcher = AuthRequest(session)

    def absences(self):
        return self.fetcher.send_request("https://www.easistent.com/m/absences/")

    def exams(self):
        return self.fetcher.send_request("https://www.easistent.com/m/exams")

    def homework(self):
        return self.fetcher.send_request("https://www.easistent.com/m/homework/")

    def meals(self):
        return self.fetcher.send_request("https://www.easistent.com/m/meals")

    def timetable(self, date_from: str, date_to: str):
        url = f"https://www.easistent.com/m/timetable/weekly?from={date_from}&to={date_to}"
        return self.fetcher.send_request(url)

    def timetable_overview(self):
        return self.fetcher.send_request("https://www.easistent.com/m/timetable/")
