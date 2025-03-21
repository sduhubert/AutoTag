FROM python:3.13
WORKDIR /AutoTag
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "app.py"]