#!/usr/bin/env bash

# Default values
VERBOSE=false
HEADED=false
REPORTER="dot"
TEST_FILE=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    --verbose|-v)
      VERBOSE=true
      shift
      ;;
    --headed|-h)
      HEADED=true
      shift
      ;;
    --reporter|-r)
      REPORTER="html"
      shift
      ;;
    --test-file|-f)
      TEST_FILE="$2"
      shift
      shift
      ;;
    --help|-h)
      echo "Run Playwright E2E Tests"
      echo ""
      echo "USAGE:"
      echo "    ./run-playwright-tests.sh [--verbose|-v] [--headed|-h] [--reporter|-r] [--test-file|-f <path>] [--help]"
      echo ""
      echo "OPTIONS:"
      echo "    --verbose, -v    Enable verbose logging for tests (sets PLAYWRIGHT_VERBOSE=true)"
      echo "    --headed, -h     Run in headed mode (show browser)"
      echo "    --reporter, -r   Use the HTML reporter instead of default dot reporter"
      echo "    --test-file, -f  Run specific test file (e.g. \"applications-add.spec.ts\")"
      echo "    --help           Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help to see available options"
      exit 1
      ;;
  esac
done

# Set environment variables based on arguments
if [ "$VERBOSE" = true ]; then
  export PLAYWRIGHT_VERBOSE=true
else
  export PLAYWRIGHT_VERBOSE=false
fi

# Configure options
HEADED_ARG=""
if [ "$HEADED" = true ]; then
  HEADED_ARG="--headed"
fi

REPORTER_ARG="--reporter=$REPORTER"

TEST_FILE_ARG=""
if [ -n "$TEST_FILE" ]; then
  TEST_FILE_ARG="./apps/web/tests/e2e/$TEST_FILE"
fi

# Display test run configuration
echo -e "\033[0;36mRunning Playwright tests with:\033[0m"
echo -e "\033[0;36m- Verbose logging: $([ "$VERBOSE" = true ] && echo "Enabled" || echo "Disabled")\033[0m"
echo -e "\033[0;36m- Headed mode: $([ "$HEADED" = true ] && echo "Enabled" || echo "Disabled")\033[0m"
echo -e "\033[0;36m- Reporter: $REPORTER\033[0m"
if [ -n "$TEST_FILE" ]; then
  echo -e "\033[0;36m- Test file: $TEST_FILE\033[0m"
fi
echo ""

# Run the tests
COMMAND="npx playwright test $HEADED_ARG $REPORTER_ARG $TEST_FILE_ARG"
echo -e "\033[0;32mExecuting: $COMMAND\033[0m"
eval "$COMMAND"

# Show location of report if HTML reporter was used
if [ "$REPORTER" = "html" ]; then
  echo -e "\n\033[0;33mHTML report is available at ./playwright-report/index.html\033[0m"
fi