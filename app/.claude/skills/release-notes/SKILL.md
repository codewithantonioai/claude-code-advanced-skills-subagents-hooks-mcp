---
name: release-notes
description: Write release notes for the changes since the last tag
disable-model-invocation: true
---

## Commits since the last release

!`git log --oneline $(git describe --tags --abbrev=0)..HEAD`

## Instructions

Add a section for version $ARGUMENTS at the top of CHANGELOG.md
(create the file if it doesn't exist). Group the commits above under
Added, Changed and Fixed. Write one short line per change, for users,
without commit hashes. Then show me the new section.
