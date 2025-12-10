# Environment configuration

This frontend reads backend API base URL from environment variables:

Priority:
1) REACT_APP_API_BASE
2) REACT_APP_BACKEND_URL

Example .env entries (do not commit secrets):
REACT_APP_API_BASE=https://api.example.com
# or as a fallback
REACT_APP_BACKEND_URL=https://api.example.com

Other environment variables available (may be used in later steps):
REACT_APP_FRONTEND_URL=
REACT_APP_WS_URL=
REACT_APP_NODE_ENV=
REACT_APP_NEXT_TELEMETRY_DISABLED=
REACT_APP_ENABLE_SOURCE_MAPS=
REACT_APP_PORT=
REACT_APP_TRUST_PROXY=
REACT_APP_LOG_LEVEL=
REACT_APP_HEALTHCHECK_PATH=
REACT_APP_FEATURE_FLAGS=
REACT_APP_EXPERIMENTS_ENABLED=
