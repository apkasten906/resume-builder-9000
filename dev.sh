#!/bin/bash
# Start both API and web servers for CI
npm run dev --workspace=packages/api &
npm run dev --workspace=apps/web &
wait
