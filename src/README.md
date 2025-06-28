# 🚀 FastAPI Project with `uv`

This is a FastAPI-based backend project that uses [`uv`](https://github.com/astral-sh/uv) for dependency management and a virtual environment setup. This guide walks you through setup, usage, and contribution instructions.

---

## 📦 Prerequisites

### ✅ Install `uv`

Follow the installation instructions from the official documentation:  
👉 [UV Installation Guide](https://docs.astral.sh/uv/#installation)

You may also install it via:

```bash
curl -Ls https://astral.sh/uv/install.sh | sh
```

Or, using `brew` (on macOS/Linux):
```bash
brew install astral-sh/uv/uv
```

## 🛠️ Setup Instructions
### 1. 🔄 Syncing Dependencies
To install all project dependencies (and create a `.venv` if it doesn't exist):
```bash
uv sync
```
### 2. 🧪 Activate Virtual Environment
After syncing dependencies, activate the virtual environment:
```bash
source .venv/bin/activate
```

## ➕ Adding New Dependencies

You can add dependencies using `uv add`, which will update the `pyproject.toml`, lockfile, and the environment automatically:
```bash
uv add <package-name>
```

### Examples
```bash
uv add fastapi
uv add uvicorn
uv add python-dotenv
```
Refer to the guide for more details:
[Working on Projects](https://docs.astral.sh/uv/guides/projects/#working-on-projects)

## 🚀 Running the Backend Server
To start the development server with hot reload:
```bash
uvicorn main:app --reload
```
Make sure you're in the root directory of the project and the virtual environment is activated.

## 📚 Resources
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [uv docs](https://docs.astral.sh/uv/)
- [Uvicorn Docs](https://www.uvicorn.org/)

## 💡 Tip

Run uv sync regularly to ensure your environment is up to date with the lockfile.