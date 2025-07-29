FROM python:3.11-slim

# 設定工作目錄
WORKDIR /app

# 安裝系統依賴
RUN apt-get update && apt-get install -y \
    build-essential \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# 建立非 root 使用者
RUN adduser --disabled-password --gecos '' appuser

# 複製需求檔案並安裝 Python 依賴
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 複製 backend 目錄內容至 app 目錄
COPY ./backend .

# 建立靜態檔案目錄並設定權限
RUN mkdir -p /app/staticfiles && \
    chown -R appuser:appuser /app

# 切換到非 root 使用者
USER appuser

# 暴露端口
EXPOSE 8000

# 健康檢查
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health/', timeout=10)" || exit 1

# 啟動命令（生產環境建議用 gunicorn）
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]