#!/bin/bash
# Clear TypeScript Cache - Clears various TypeScript caches to resolve compilation issues

# Default values
 SHOULD_CLEAR_NODE_MODULES=false
 SHOULD_CLEAR_VSCODE=false
 SHOULD_CLEAR_TSSERVER=false
 SHOULD_SHOW_HELP=false
 SHOULD_CLEAR_ALL=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --all|-a)
  SHOULD_CLEAR_ALL=true
      shift
      ;;
    --node-modules|-n)
  SHOULD_CLEAR_NODE_MODULES=true
      shift
      ;;
    --vscode|-v)
  SHOULD_CLEAR_VSCODE=true
      shift
      ;;
    --tsserver|-t)
  SHOULD_CLEAR_TSSERVER=true
      shift
      ;;
    --help|-h)
  SHOULD_SHOW_HELP=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
  SHOULD_SHOW_HELP=true
      shift
      ;;
  esac
done

# Show help if requested or no cache types specified
if [ "$SHOULD_SHOW_HELP" = true ] || [ "$SHOULD_CLEAR_ALL" = false ] && [ "$SHOULD_CLEAR_NODE_MODULES" = false ] && [ "$SHOULD_CLEAR_VSCODE" = false ] && [ "$SHOULD_CLEAR_TSSERVER" = false ]; then
  echo "Clear TypeScript Cache"
  echo
  echo "USAGE:"
  echo "    ./clear-ts-cache.sh [--all|-a] [--node-modules|-n] [--vscode|-v] [--tsserver|-t] [--help|-h]"
  echo
  echo "OPTIONS:"
  echo "    --all, -a           Clear all TypeScript caches"
  echo "    --node-modules, -n  Clear Node modules cache (node_modules/.cache)"
  echo "    --vscode, -v        Clear VS Code TypeScript cache"
  echo "    --tsserver, -t      Clear TypeScript server cache"
  echo "    --help, -h          Show this help message"
  echo
  echo "EXAMPLES:"
  echo "    ./clear-ts-cache.sh --all"
  echo "    ./clear-ts-cache.sh --node-modules --vscode"
  exit 0
fi

# Set options based on --all flag
if [ "$SHOULD_CLEAR_ALL" = true ]; then
  SHOULD_CLEAR_NODE_MODULES=true
  SHOULD_CLEAR_VSCODE=true
  SHOULD_CLEAR_TSSERVER=true
fi

# Initialize counters
SUCCESS=0
FAILED=0

# Function to remove a cache directory
remove_cache_directory() {
  local PATH_TO_REMOVE="$1"
  local DESCRIPTION="$2"

  echo -n "Clearing $DESCRIPTION... "

  if [ -d "$PATH_TO_REMOVE" ]; then
    if rm -rf "$PATH_TO_REMOVE"; then
      echo -e "\033[32mDone!\033[0m"
      return 0
    else
      echo -e "\033[31mFailed!\033[0m"
      return 1
    fi
  else
    echo -e "\033[33mNot found (already clean)\033[0m"
    return 0
  fi
}

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Clear Node modules cache if requested
if [ "$SHOULD_CLEAR_NODE_MODULES" = true ]; then
  NODE_MODULE_CACHE_PATHS=(
    "$PROJECT_ROOT/node_modules/.cache"
    "$PROJECT_ROOT/apps/web/node_modules/.cache"
    "$PROJECT_ROOT/packages/api/node_modules/.cache"
    "$PROJECT_ROOT/packages/core/node_modules/.cache"
  )

  for CACHE_PATH in "${NODE_MODULE_CACHE_PATHS[@]}"; do
    if remove_cache_directory "$CACHE_PATH" "Node modules cache at $CACHE_PATH"; then
      ((SUCCESS++))
    else
      ((FAILED++))
    fi
  done
fi

# Clear VS Code TypeScript cache if requested
if [ "$SHOULD_CLEAR_VSCODE" = true ]; then
  # VS Code cache locations are OS-dependent
  if [ "$(uname)" == "Darwin" ]; then
    # macOS
    VSCODE_CACHE="$HOME/Library/Application Support/Code/Cache/Cache_Data"
  elif [ "$(uname)" == "Linux" ]; then
    # Linux
    VSCODE_CACHE="$HOME/.config/Code/Cache/Cache_Data"
  else
    # Default to workspace-specific cache
    VSCODE_CACHE=""
  fi

  # Workspace-specific VS Code cache
  WORKSPACE_CACHE="$PROJECT_ROOT/.vscode/.cache"

  if [ -n "$VSCODE_CACHE" ]; then
    if remove_cache_directory "$VSCODE_CACHE" "VS Code cache"; then
      ((SUCCESS++))
    else
      ((FAILED++))
    fi
  fi

  if remove_cache_directory "$WORKSPACE_CACHE" "VS Code workspace cache"; then
    ((SUCCESS++))
  else
    ((FAILED++))
  fi
fi

# Clear TypeScript server cache if requested
if [ "$SHOULD_CLEAR_TSSERVER" = true ]; then
  if [ "$(uname)" == "Darwin" ]; then
    # macOS
    TS_CACHE_PATHS=(
      "$HOME/Library/Caches/TypeScript"
      "/tmp/typescript-*"
    )
  elif [ "$(uname)" == "Linux" ]; then
    # Linux
    TS_CACHE_PATHS=(
      "$HOME/.cache/typescript"
      "/tmp/typescript-*"
    )
  else
    # Unknown OS, use general locations
    TS_CACHE_PATHS=(
      "/tmp/typescript-*"
    )
  fi

  for CACHE_PATH in "${TS_CACHE_PATHS[@]}"; do
    # Special handling for glob patterns
    if [[ "$CACHE_PATH" == *"*"* ]]; then
      for ACTUAL_PATH in $CACHE_PATH; do
        if [ -d "$ACTUAL_PATH" ]; then
          if remove_cache_directory "$ACTUAL_PATH" "TypeScript server cache at $ACTUAL_PATH"; then
            ((SUCCESS++))
          else
            ((FAILED++))
          fi
        fi
      done
    else
      if remove_cache_directory "$CACHE_PATH" "TypeScript server cache at $CACHE_PATH"; then
        ((SUCCESS++))
      else
        ((FAILED++))
      fi
    fi
  done
fi

# Display summary
echo
echo -e "\033[36mCache Clearing Summary:\033[0m"
echo -e "\033[32m- Successful operations: $SUCCESS\033[0m"
if [ $FAILED -gt 0 ]; then
  echo -e "\033[31m- Failed operations: $FAILED\033[0m"
fi

echo
echo -e "\033[36mRecommended Next Steps:\033[0m"
echo "1. Restart VS Code if it's running"
echo "2. Restart any running TypeScript compilers or watchers"
echo "3. If using dev server, restart it with 'npm run dev'"

exit $FAILED
