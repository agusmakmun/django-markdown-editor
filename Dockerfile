FROM alpine:3.16.0

WORKDIR /app

# Install required packages including tini
RUN set -xe && \
    apk add --no-cache python3 py3-pip tini && \
    pip install --upgrade pip setuptools-scm

# Copy project files
COPY . .

# Install Python dependencies and setup Django app
RUN pip3 install -e . && \
    python3 martor_demo/manage.py makemigrations && \
    python3 martor_demo/manage.py migrate

# Create user and set permissions
RUN addgroup -g 1000 appuser && \
    adduser -u 1000 -G appuser -D -h /app appuser && \
    chown -R appuser:appuser /app

USER appuser
EXPOSE 8000/tcp

# Use full path for tini
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["python3", "/app/martor_demo/manage.py", "runserver", "0.0.0.0:8000"]
