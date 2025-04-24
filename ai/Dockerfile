FROM python:3.13
RUN apt-get update && apt-get install -y \
    cmake \
    g++ \
    build-essential \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /AutoTag
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip3 install -r requirements.txt
COPY . .
CMD ["python", "app.py"]