#!/usr/bin/env bash
# สคริปต์: push_to_worksla.sh
# ใช้เพื่อสเตจ, commit, และ push การเปลี่ยนแปลงไปยัง https://github.com/apirak-ja/worksla.git
# พร้อมตรวจสอบว่า branch ถูกสร้างบน remote เรียบร้อยแล้ว
#
# Usage:
#   ./push_to_worksla.sh [branch] [commit-message] [username] [password/token]
#
# Examples:
#   # Push branch ปัจจุบัน และให้สคริปต์ถาม username/password
#   ./push_to_worksla.sh
#
#   # Push ไปยัง branch 'develop' พร้อม commit message
#   ./push_to_worksla.sh develop "feat: add user authentication"

set -euo pipefail

# Parse options
USE_ORIGIN=false
if [[ "${1:-}" == "--use-origin" ]]; then
  USE_ORIGIN=true
  shift
fi

# --- การกำหนดค่าหลัก ---
# ตั้งค่า URL เริ่มต้นให้ชี้ไปที่ repository ที่ต้องการ
DEFAULT_REMOTE_URL="https://github.com/apirak-ja/worksla.git"
# --------------------

REMOTE_URL="${1:-$DEFAULT_REMOTE_URL}"
# หาก argument แรกไม่ใช่ URL (เช่น เป็นชื่อ branch) ให้ใช้ DEFAULT_REMOTE_URL
if [[ ! "$REMOTE_URL" == https://* ]] && [[ ! "$REMOTE_URL" == git@* ]]; then
  # เลื่อน argument ไปทางขวา
  # ./script.sh my-branch "message" -> ./script.sh <default-url> my-branch "message"
  set -- "$DEFAULT_REMOTE_URL" "$@"
fi

REMOTE_URL="${1:-$DEFAULT_REMOTE_URL}"
BRANCH="${2:-$(git rev-parse --abbrev-ref HEAD)}"
COMMIT_MSG="${3:-"chore: auto commit from script"}"
USERNAME="${4:-}"
PASSWORD="${5:-}"

# ฟังก์ชันช่วยเหลือ
err() { echo "ERROR: $*" >&2; exit 1; }
info() { echo "INFO: $*"; }

# ตรวจสอบว่าเป็น git repo
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  err "Current directory is not a git repository"
fi

# ตั้งค่า remote
if [[ "$USE_ORIGIN" == true ]]; then
  REMOTE_NAME="origin"
  URL_TO_USE="$(git remote get-url origin)"
  DISPLAY_URL="$URL_TO_USE"
  info "Using existing remote '$REMOTE_NAME' -> $DISPLAY_URL"
else
  # --- จัดการ Credential สำหรับ HTTPS ---
  if [[ "$REMOTE_URL" == https://* ]]; then
    info "HTTPS remote detected. Preparing for authentication."
    
    # ตรวจสอบ GITHUB_TOKEN ก่อน
    if [ -n "${GITHUB_TOKEN:-}" ]; then
      info "Using GITHUB_TOKEN from environment variable."
      USERNAME="${USERNAME:-git}"
      PASSWORD="$GITHUB_TOKEN"
    else
      if [ -z "$USERNAME" ]; then
        read -p "Enter username for $REMOTE_URL: " USERNAME
      fi
      
      if [ -z "$PASSWORD" ]; then
        read -sp "Enter password or Personal Access Token (PAT) for '$USERNAME': " PASSWORD
        echo # Newline after silent password input
      fi
    fi

    # สร้าง URL ใหม่พร้อม credential
    DOMAIN_AND_PATH="${REMOTE_URL#https://}"
    URL_TO_USE="https://$USERNAME:$PASSWORD@$DOMAIN_AND_PATH"
    DISPLAY_URL="https://$USERNAME:********@$DOMAIN_AND_PATH"
  else
    info "Non-HTTPS remote detected. Assuming SSH key authentication."
  fi
  # --- สิ้นสุดการจัดการ Credential ---

  # ตั้ง remote ชั่วคราวชื่อ 'target_remote'
  REMOTE_NAME="target_remote_for_push"
  info "Setting up temporary remote '$REMOTE_NAME' -> $DISPLAY_URL"
  # ลบ remote เก่า (ถ้ามี) เพื่อความสะอาด
  git remote remove "$REMOTE_NAME" >/dev/null 2>&1 || true
  git remote add "$REMOTE_NAME" "$URL_TO_USE"
fi

# --- ส่วนของการสแกนหา Credentials และ Commit ---
info "Scanning for files that may contain credentials..."
SECRET_PATTERN='password|passwd|pwd=|pass=|secret|api[_-]?key|access[_-]?token|access[_-]?key|token|private[_-]?key'
mapfile -t SECRET_FILES < <(grep -RIIlE --exclude-dir=.git "$SECRET_PATTERN" . || true)

if [ ${#SECRET_FILES[@]} -gt 0 ]; then
  info "Found potential secret-containing files:"
  for f in "${SECRET_FILES[@]}"; do
    fp="${f#./}"
    info " - $fp"
    if [ ! -f .gitignore ] || ! grep -Fxq "$fp" .gitignore; then
      echo "$fp" >> .gitignore
      info "   -> Added '$fp' to .gitignore"
    fi
    if git ls-files --error-unmatch -- "$fp" >/dev/null 2>&1; then
      git rm --cached -r -- "$fp" >/dev/null
      info "   -> Removed '$fp' from git index"
    fi
  done
  if [ -n "$(git status --porcelain .gitignore)" ]; then
    info "Committing .gitignore updates and credential file removals"
    git add .gitignore
    git commit -m "chore: Ignore and remove files with potential credentials" || true
  fi
else
  info "No potential credential files found."
fi

# Stage และ commit การเปลี่ยนแปลงที่เหลือ
if [ -n "$(git status --porcelain)" ]; then
  info "Staging and committing remaining changes..."
  git add -A
  git commit -m "$COMMIT_MSG" || info "No new changes to commit after staging."
else
  info "No changes to commit."
fi

# Push และตั้งค่า upstream
info "Pushing branch '$BRANCH' to $DISPLAY_URL"
git push -u "$REMOTE_NAME" "$BRANCH"

# ตรวจสอบว่า branch ถูกสร้างบน remote แล้ว
info "Verifying remote branch exists..."
if git ls-remote --heads "$REMOTE_NAME" "refs/heads/$BRANCH" | grep -q .; then
  info "✅ Success! Branch '$BRANCH' exists on remote repository."
else
  err "Failed to verify branch '$BRANCH' on remote after push."
fi

# ทำความสะอาด remote ชั่วคราว
if [[ "$USE_ORIGIN" != true ]]; then
  info "Cleaning up temporary remote '$REMOTE_NAME'"
  git remote remove "$REMOTE_NAME"
fi

info "Done."