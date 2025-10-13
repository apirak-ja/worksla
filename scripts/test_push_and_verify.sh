#!/usr/bin/env bash
# สคริปต์: test_push_and_verify.sh
# ทดสอบ scripts/push_and_verify.sh โดยใช้ bare repo ชั่วคราว

set -euo pipefail

ROOT_DIR="$(pwd)"
TEST_DIR="/tmp/worksla_test_$(date +%s)"
BARE_DIR="$TEST_DIR/bare.git"
CLONE_DIR="$TEST_DIR/clone"

mkdir -p "$BARE_DIR"
mkdir -p "$CLONE_DIR"

echo "Creating bare repository at $BARE_DIR"
git init --bare "$BARE_DIR"

# Clone current repo into clone dir
echo "Cloning current repo into $CLONE_DIR"
git clone "$ROOT_DIR" "$CLONE_DIR"

cd "$CLONE_DIR"

# Ensure working on a fresh branch
BRANCH_TEST="test-branch-$(date +%s)"

git checkout -b "$BRANCH_TEST"

# Make a test change
TEST_FILE="test_file_$(date +%s).txt"
echo "hello" > "$TEST_FILE"

# Configure a local git identity so commits succeed in CI/temp environments
git config user.email "test@example.com"
git config user.name "Test Bot"

# Run the push_and_verify script pointing to bare repo
chmod +x "$ROOT_DIR/scripts/push_and_verify.sh"

echo "Running push_and_verify.sh"
"$ROOT_DIR/scripts/push_and_verify.sh" "$BARE_DIR" "$BRANCH_TEST" "test: automated test commit"

# Verify on the bare repo by listing refs
if git ls-remote --heads "$BARE_DIR" | grep -q "$BRANCH_TEST"; then
  echo "Test: SUCCESS - branch found in bare repo"
else
  # Show ls-remote output for debugging
  echo "ls-remote output:" 
  git ls-remote --heads "$BARE_DIR" || true
  echo "Test: FAIL - branch not found in bare repo"
  exit 1
fi

# Clean up
cd "$ROOT_DIR"
rm -rf "$TEST_DIR"

echo "Test completed and cleaned up"
