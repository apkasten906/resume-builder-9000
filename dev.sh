#!/bin/bash
# Start both API and web servers for CI
 # Always clean Next.js cache before dev
 if [ -d "./apps/web/.next/cache" ]; then
	 rm -rf ./apps/web/.next/cache
 fi
npm run dev --workspace=packages/api &
npm run dev --workspace=apps/web &
wait
