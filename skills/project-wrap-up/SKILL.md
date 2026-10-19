---
name: project-wrap-up
description: Save a project handoff when the user says they are done for now, wrapping up, or stopping work. Review recent work and ask at most three targeted questions to help resume in a future Codex session.
---

Work in the current project's root. Read AGENTS.md and .project-dashboard/handoff.md if present. Review the current session, `git log -3 --format='%h %s'`, `git status --short`, `git diff --stat`, and relevant diffs. For a GitHub-backed project, use available authenticated GitHub tools to inspect recent repository commits; otherwise use local commits and explicitly identify them as local. Do not fetch, commit, push, or discard work unless authorized. Handle non-Git projects using the session and local files. Do not read secrets, credentials, environment files, dependency directories, or unrelated files.

Draft a personalized summary of features and changes, unfinished work, hurdles, and the next concrete step. Distinguish observed facts from inferences and mark unknowns. Ask only about missing context, at most 2–3 focused questions total; omit questions when the session already establishes the answers. Never invent user answers. If answers are pending, retain the draft and clearly mark unanswered points.

Save the handoff in `.project-dashboard/handoff.md` in the project root using this structure:

# Project handoff
Updated: <ISO timestamp with timezone>
## Recent features and changes
## Last commits
<up to three commit hashes and subjects; identify local or remote source>
## Uncommitted work
<paths and meaningful context, without secrets>
## Hurdles and open questions
## Next session
<concrete first action, relevant paths, verification needed>
## Release checklist notes
<observations only; do not mark items complete without evidence>

Preserve any relevant unresolved context from the old handoff. Do not include credentials, tokens, private raw conversation transcripts, or unrelated personal data. End with a concise saved-file confirmation and the next action. The local dashboard reads this file directly when project details open.

If the root AGENTS.md does not already include resume guidance, append a small Project dashboard section instructing future Codex sessions to read `.project-dashboard/handoff.md` before work and invoke this skill when wrapping up. Preserve all existing instructions. Ask for filesystem approval only if the tool requires it.
