"""Install local Codex continuity without changing existing instructions."""
import argparse
from pathlib import Path
ROOT=Path(__file__).resolve().parent
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('project',type=Path,help='Existing project root')
a=parser.parse_args(); target=a.project.expanduser().resolve()
if not target.is_dir(): parser.error('Project folder does not exist')
skill=target/'.agents/skills/project-wrap-up/SKILL.md'
skill.parent.mkdir(parents=True,exist_ok=True)
source=(ROOT/'skills/project-wrap-up/SKILL.md').read_text()
if skill.exists() and skill.read_text()!=source: parser.error('A different project-wrap-up skill exists; review it before replacing')
skill.write_text(source)
instructions=target/'AGENTS.md'; existing=instructions.read_text() if instructions.exists() else ''
if '## Project dashboard continuity' not in existing:
    instructions.write_text(existing.rstrip()+'''\n\n## Project dashboard continuity
At session start, read `.project-dashboard/handoff.md` if present. Verify the context against current files before proceeding. When the user says “I'm done for now” or asks to wrap up, use the project-wrap-up skill at `.agents/skills/project-wrap-up/SKILL.md`. Review recent commits, local changes, and the current session; draft a handoff and ask at most three questions about missing context. Save the result to `.project-dashboard/handoff.md`.
''')
print(f'Codex continuity enabled in {target}. Start a fresh Codex session to load the skill.')
