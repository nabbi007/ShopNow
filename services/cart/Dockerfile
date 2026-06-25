# Build with: docker build -f services/cart/Dockerfile services/
FROM python:3.12-slim AS builder
WORKDIR /build
COPY cart/requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

FROM python:3.12-slim AS runtime
RUN useradd --create-home appuser
USER appuser
WORKDIR /home/appuser/app
COPY --from=builder /install /usr/local
COPY --chown=appuser:appuser common ./common
COPY --chown=appuser:appuser cart/app ./app
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
