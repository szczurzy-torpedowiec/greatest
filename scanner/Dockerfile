# syntax=docker/dockerfile:1
FROM python:3.9.7
RUN apt-get update
RUN apt-get install python3-opencv libgl1 -y
WORKDIR /app
COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt
COPY . /app
CMD [ "python3", "api.py"]
