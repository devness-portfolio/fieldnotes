# Fieldnotes — personal project dashboard

Source: [devness-portfolio/fieldnotes](https://github.com/devness-portfolio/fieldnotes).

A local Mac dashboard for discovering projects and resuming work with Codex. No dependencies or cloud storage are required.

## Run

```sh
cd /Users/devness/project-dashboard
python3 server.py
```

Open http://127.0.0.1:8765. The server listens only on your Mac. Stop it with Ctrl-C. Projects and release checklists are saved in `data/projects.json`; back up this folder to preserve them.

Choose **Discover projects** to scan project folders under your home directory and public repos belonging to `devness-portfolio`. Review recommendations before adding. Recent activity means a commit within 90 days; unfinished work means uncommitted changes. Discovery skips hidden/system/dependency folders and symlinks, and limits traversal depth. Some folders may be inaccessible under macOS privacy permissions. GitHub API network/rate-limit failures are shown alongside local results. Private GitHub repos and automatic discovery of nontechnical projects are not yet supported. Add those manually.

Each project has a category, description, optional local folder and repository, release checklist, and optional date. Each checklist item contributes equally to the displayed percentage. Local project details show up to three commits, uncommitted paths, and `.project-dashboard/handoff.md` when present. Repo-only entries currently require a local checkout for live commit context.

The Midnight Electric palette includes light and dark modes. Use the appearance button in the header to switch; your choice is remembered in this browser. On first visit, it follows your system appearance.

## Project pipeline

Fieldnotes Focus opens on **Active work** (Ready to start and In development). **All stages** includes Backlog, Ready to start, In development, Completed for now, and On hold. **Up next** shows Ready to start projects; **Start working** moves one to In development.

Switch between Board and Grid. In Board, drag a project card by its body or drag grip into a stage column; highlighted columns show drop targets. Grid includes a stage filter. Every card also has a stage dropdown for keyboard and touch use. Category and search filters apply across views.

Open a project title to manage its release tasks. Tasks have their own stage board and dropdowns. A project marked Completed for now automatically returns to In development if any task is unfinished, including when adding or reopening a task. This rule also applies to existing projects when the dashboard loads. Other project stages remain manual. Completed for now tasks count toward release progress. When every task is complete, a button offers to mark the project completed for now; this never happens automatically. Move projects or tasks back to any stage when revisiting them.

Existing projects without a stage appear in Backlog. Previously checked checklist items count as Completed for now; unchecked items appear in Backlog. Stages save in the existing local data file when changed.

## Enable Codex continuity in another project

This checkout already contains resume instructions and the wrap-up skill. For another approved project:

To install both the skill and resume instructions while preserving existing instructions, run:

```sh
python3 /Users/devness/project-dashboard/setup_project.py /absolute/path/to/project
```

Or install manually:

1. Copy `skills/project-wrap-up/SKILL.md` into that project's `.agents/skills/project-wrap-up/SKILL.md` so Codex can discover it.
2. Append the following to its root `AGENTS.md`, preserving existing instructions:

```markdown
## Project dashboard continuity
At session start, read `.project-dashboard/handoff.md` if present. Verify the context against current files before proceeding. When I say “I'm done for now” or ask to wrap up, use the project-wrap-up skill. Review recent commits, local changes, and this session; draft a handoff and ask at most three questions about missing context. Save the result to `.project-dashboard/handoff.md`.
```

3. Start a fresh Codex session in that project. When finishing, say “I'm done for now.” The dashboard reads its saved handoff whenever you reopen project details.

The skill uses session context available to Codex; the dashboard cannot itself access Codex conversations. It does not commit or push your work. Review handoffs before committing them to shared repositories, or add `.project-dashboard/` to that project's `.gitignore` for local-only handoffs.

## Checks

```sh
python3 -m unittest discover -s tests
node --check web/app.js
node tests/test_pipeline.cjs
```
