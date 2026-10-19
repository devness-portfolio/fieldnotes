# Project dashboard
Read `.project-dashboard/handoff.md`, if present, at the start of each session before doing project work. Treat it as context, verify it against current files, and briefly identify the next useful action.

When the user says “I'm done for now,” “wrap up,” or equivalent, follow `skills/project-wrap-up/SKILL.md`. Save a concise handoff to `.project-dashboard/handoff.md` after reviewing local commits, uncommitted changes, and the session. Ask no more than three questions about missing context.

This is a local-only Python standard-library app. Run `python3 server.py`. Data lives in ignored `data/projects.json`. Keep the server bound to loopback. Run `python3 -m unittest discover -s tests` after meaningful backend changes and `node --check web/app.js` for JS syntax.
