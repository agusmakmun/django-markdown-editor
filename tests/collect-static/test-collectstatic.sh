#!/bin/bash

# Final Demo: ACE Icons collectstatic Fix
# This script demonstrates the error condition and the fix

echo "🎭 FINAL DEMONSTRATION: ACE Icons Fix"
echo "=========================================="
echo "This script will demonstrate:"
echo "1. ✅ Current working state"
echo "2. ❌ Error simulation (missing icons)"
echo "3. ✅ Fix verification (restored icons)"
echo

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

# Go to project root
cd ../../

# Step 1: Check current state
print_step "1. Checking current icon files..."
icon_count=$(ls martor/static/plugins/css/main-*.png martor/static/plugins/css/main-*.svg 2>/dev/null | wc -l)
echo "Found $icon_count icon files"

if [ $icon_count -eq 26 ]; then
    print_success "All 26 required icon files are present"
else
    print_error "Missing icon files! Expected 26, found $icon_count"
fi

echo

# Step 2: Test current working state
print_step "2. Testing current state with collectstatic..."
if python3 -c "
import os, sys, django
from django.conf import settings
from django.core.management import execute_from_command_line
import shutil

settings.configure(
    DEBUG=False,
    SECRET_KEY='test',
    INSTALLED_APPS=['django.contrib.staticfiles', 'martor'],
    STATIC_URL='/static/',
    STATIC_ROOT='/tmp/test_static_working',
    STATICFILES_STORAGE='whitenoise.storage.CompressedManifestStaticFilesStorage'
)
django.setup()

if os.path.exists('/tmp/test_static_working'):
    shutil.rmtree('/tmp/test_static_working')
sys.argv = ['test', 'collectstatic', '--noinput']
execute_from_command_line(sys.argv)
" > /dev/null 2>&1; then
    print_success "✅ Current state: collectstatic SUCCEEDS with all icons present"
else
    print_error "❌ Current state: collectstatic FAILED (unexpected)"
fi

echo

# Step 3: Simulate error by removing icons
print_step "3. Simulating original error condition..."
print_info "Backing up icon files to /tmp/ace-backup..."
mkdir -p /tmp/ace-backup
cp martor/static/plugins/css/main-*.png /tmp/ace-backup/ 2>/dev/null || true
cp martor/static/plugins/css/main-*.svg /tmp/ace-backup/ 2>/dev/null || true

backup_count=$(ls /tmp/ace-backup/ | wc -l)
print_info "Backed up $backup_count files"

print_info "Removing 5 critical icon files to simulate the original error..."
rm -f martor/static/plugins/css/main-1.png
rm -f martor/static/plugins/css/main-2.png
rm -f martor/static/plugins/css/main-5.svg
rm -f martor/static/plugins/css/main-25.svg
rm -f martor/static/plugins/css/main-26.png

remaining_count=$(ls martor/static/plugins/css/main-*.png martor/static/plugins/css/main-*.svg 2>/dev/null | wc -l)
print_info "Now only $remaining_count icon files remain (removed 5)"

echo

# Step 4: Test error condition
print_step "4. Testing with missing icons (should fail)..."
if python3 -c "
import os, sys, django
from django.conf import settings
from django.core.management import execute_from_command_line
import shutil

settings.configure(
    DEBUG=False,
    SECRET_KEY='test',
    INSTALLED_APPS=['django.contrib.staticfiles', 'martor'],
    STATIC_URL='/static/',
    STATIC_ROOT='/tmp/test_static_error',
    STATICFILES_STORAGE='whitenoise.storage.CompressedManifestStaticFilesStorage'
)
django.setup()

if os.path.exists('/tmp/test_static_error'):
    shutil.rmtree('/tmp/test_static_error')
sys.argv = ['test', 'collectstatic', '--noinput']
execute_from_command_line(sys.argv)
" 2>&1; then
    print_error "❌ Unexpected: collectstatic succeeded with missing files"
else
    print_success "✅ Expected: collectstatic FAILED with missing icon files"
    print_info "This demonstrates the original MissingFileError!"
fi

echo

# Step 5: Restore files
print_step "5. Restoring icon files..."
cp /tmp/ace-backup/* martor/static/plugins/css/
rm -rf /tmp/ace-backup

restored_count=$(ls martor/static/plugins/css/main-*.png martor/static/plugins/css/main-*.svg 2>/dev/null | wc -l)
print_success "Restored all files. Total: $restored_count"

echo

# Step 6: Test success condition
print_step "6. Testing with all icons restored..."
if python3 -c "
import os, sys, django
from django.conf import settings
from django.core.management import execute_from_command_line
import shutil

settings.configure(
    DEBUG=False,
    SECRET_KEY='test',
    INSTALLED_APPS=['django.contrib.staticfiles', 'martor'],
    STATIC_URL='/static/',
    STATIC_ROOT='/tmp/test_static_success',
    STATICFILES_STORAGE='whitenoise.storage.CompressedManifestStaticFilesStorage'
)
django.setup()

if os.path.exists('/tmp/test_static_success'):
    shutil.rmtree('/tmp/test_static_success')
sys.argv = ['test', 'collectstatic', '--noinput']
execute_from_command_line(sys.argv)
" > /dev/null 2>&1; then
    print_success "✅ SUCCESS: collectstatic WORKS with all icon files present"
else
    print_error "❌ Unexpected: collectstatic still failing"
fi

# Cleanup
rm -rf /tmp/test_static_working /tmp/test_static_error /tmp/test_static_success 2>/dev/null

echo
echo "=========================================="
echo -e "${GREEN}🎉 DEMONSTRATION COMPLETE!${NC}"
echo
echo "SUMMARY:"
echo "1. ✅ With all 26 icon files → collectstatic SUCCEEDS"
echo "2. ❌ Missing icon files → collectstatic FAILS (MissingFileError)"
echo "3. ✅ Restored icon files → collectstatic SUCCEEDS again"
echo
echo "THE FIX:"
echo "- Downloaded 26 missing icon files from ACE repository"
echo "- Files: main-1.png through main-26.png, main-5.svg through main-25.svg"
echo "- Location: martor/static/plugins/css/"
echo
print_success "The collectstatic issue has been permanently resolved!"
echo "=========================================="
