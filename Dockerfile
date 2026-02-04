FROM python:3-alpine

WORKDIR /app

RUN apk add --no-cache tzdata
ENV TZ=Europe/Ljubljana

COPY backend ./
RUN mkdir static
RUN mkdir data
RUN pip install --no-cache-dir -r requirements.txt

COPY frontend/dist/frontend/browser ./static

ENV PYTHONUNBUFFERED=1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]
