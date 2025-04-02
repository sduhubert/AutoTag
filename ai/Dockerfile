FROM python:3.13
WORKDIR /AutoTag
COPY requirements.txt .
RUN pip3 install -r requirements.txt
RUN apt-get update && apt-get install -y ffmpeg
COPY . .
CMD ["python", "app.py"]