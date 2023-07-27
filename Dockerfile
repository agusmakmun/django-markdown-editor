 alpine:3.16.0

# Changed the working directory to /app
WORKDIR /app

# Removed the trailing semicolon on RUN command (set -xe;)
# Added --update flag to update the package index before installing packages
# Replaced python3 with python3-dev to include development headers
# Added gcc and musl-dev packages for compilation
RUN apk --no-cache --update add python3-dev py3-pip tini gcc musl-dev

# Copy the entire current directory to the /app directory in the container
COPY .# .

 Installing/updating pip and setuptools-scm packages
RUN pip install --upgrade pip setuptools-scm

# Install the project dependencies and scripts
RUN python3 setup.py install

# Perform necessary database migrations
RUN python3 martor_demo/manage.py makemigrations
RUN python3 martor_demo/manage.py migrate

# Create a new group and user with UID 1000
RUN addgroup -g 1000 appuser
RUN adduser -u 1000 -G appuser -D -h /app appuser

# Changing the ownership of the /app directory to the appuser
RUN chown -R appuser:appuser /app

# Switch to the appuser
USER appuser

# Specify the entrypoint and command for the container
ENTRYPOINT [ "tini", "--" ]
CMD [ "python3", "/app/martor_demo/manage.py", "runserver", "0.0.0.0:8000" ]
