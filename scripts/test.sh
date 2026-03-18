#!/usr/bin/env bash
set -euo pipefail

echo "Running Hardhat tests..."
npx hardhat test

echo "Test run complete."
