# ──────────────────────────────────────────────
# Stage 1 – dependency installer
# ──────────────────────────────────────────────
FROM python:3.12-slim AS builder

WORKDIR /app

# Install only the packages needed to compile dependencies,
# then clean up the apt cache in the same layer.
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Install into an isolated prefix so the runtime stage
# can copy just the installed packages, nothing else.
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

FROM python:3.12-slim AS runtime

# Run as a non-root user – a core container security best practice.
RUN useradd --create-home appuser
USER appuser
WORKDIR /home/appuser/app

# Copy only the pre-installed packages from the builder stage.
COPY --from=builder /install /usr/local

# Copy application source code.
COPY --chown=appuser:appuser app/ ./app/

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
