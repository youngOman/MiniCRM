FROM python:3.13-slim

# 設定工作目錄
WORKDIR /app

# 安裝系統依賴
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    pkg-config \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 安裝 uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# 複製專案檔案並安裝 Python 依賴
COPY pyproject.toml uv.lock ./

# 設定 uv 環境變數並同步依賴
ENV UV_PROJECT_ENVIRONMENT=/opt/venv
RUN uv sync --frozen

# 設定 PATH 包含虛擬環境
ENV PATH="/opt/venv/bin:$PATH"

# 建立非 root 使用者
RUN adduser --disabled-password --gecos '' appuser

# 設定 Django 環境變數
ENV DJANGO_SETTINGS_MODULE=crm_backend.settings

# 複製 backend 目錄內容至 app 目錄
COPY ./backend .

# 複製客服資料生成腳本
# COPY ./create_customer_service_data.py /app/

# 建立靜態檔案目錄並設定權限
RUN mkdir -p /app/staticfiles && \
    chown -R appuser:appuser /app && \
    chown -R appuser:appuser /opt/venv

# 切換到非 root 使用者
USER appuser

# 暴露端口
EXPOSE 8000

# 健康檢查
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/admin/', timeout=10)" || exit 1

# 啟動命令（生產環境建議用 gunicorn）
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]