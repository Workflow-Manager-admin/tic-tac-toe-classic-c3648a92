#!/bin/bash
cd /tmp/kavia/workspace/code-generation/tic-tac-toe-classic-c3648a92/frontend_react
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

