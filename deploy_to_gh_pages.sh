#!/bin/bash

# Update gh-pages
# ===============
#
# This script allows to automatically update the desktop on the gh-pages
# branch.
#
# To use it:
#
#   1. Be sure that you're on a clean (no staged files and no diff) branch.
#
#   2. Call this script.
#      Some user interactions will be needed to avoid doing unwanted commits.
#
#   3. That's it!
#      A commit should have been pushed to the gh-pages.

set -e

current_branch=$(git branch | sed -n -e 's/^\* \(.*\)/\1/p')

if [ "$current_branch" == "gh-pages" ]; then
  echo "ERROR: You're already on the \"gh-pages\" branch. Please checkout the branch you want to deploy instead."
  exit 1
fi

npm run build:min

if [ -n "$(git status --porcelain doc)" ]; then
  echo "ERROR: Please commit your modifications to \"$current_branch\""
  exit 1
fi

tmpDistDir=$(mktemp -d)

cp -rv dist/* "$tmpDistDir"

# update gh-pages
git checkout gh-pages
git pull origin gh-pages
cp -rv "$tmpDistDir"/* .

if [ -n "$(git status --porcelain)" ]; then
  echo "-- Current Status on gh-pages: --"
  echo ""
  git status

  while :; do
    echo ""
    echo "We will push the demo to gh-pages."
    REPLY=""
    read -p "do you want to continue [y/d/s/a/c/t/h] (h for help) ? " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Hh](elp)?$ ]]; then
      echo ""
      echo ""
      echo "+- help -------------------------------------------------+"
      echo "| y: commit and continue                                 |"
      echo "| d: see diff                                            |"
      echo "| s: see status                                          |"
      echo "| a: abort script from here                              |"
      echo "| c: checkout from this commit and go to the next one    |"
      echo "| t: stash this commit and go to the next one            |"
      echo "| h: see this help                                       |"
      echo "+--------------------------------------------------------+"
    elif [[ $REPLY =~ ^[Yy](es)?$ ]]; then
      git add --all
      git commit -m "Deploy new Desktop to the gh-pages"
      git push origin gh-pages
      break
    elif [[ $REPLY =~ ^[Dd](iff)?$ ]]; then
      git diff
    elif [[ $REPLY =~ ^[Ss](tatus)?$ ]]; then
      git status
    elif [[ $REPLY =~ ^[Aa](bort)?$ ]]; then
      echo "exiting"
      exit 0
    elif [[ $REPLY =~ ^[Cc](heckout)?$ ]]; then
      git checkout .
    elif [[ $REPLY =~ ^[Tt]$ ]]; then
      git stash save -u
      break
    fi
  done
else
  echo "nothing to do on the gh-pages branch"
fi

git checkout $current_branch
