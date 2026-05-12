import type { GitChapter, GitSection } from "@/types";

function s(
  id: string,
  label: string,
  tone: GitSection["tone"],
  extra: Partial<GitSection> = {}
): GitSection {
  return { id, label, tone, ...extra };
}

// Per-chapter accent colours (match the PDF's coloured top-bar per chapter)
const ACCENT = {
  blue:   "#58a6ff",
  cyan:   "#39c5cf",
  green:  "#3fb950",
  purple: "#a371f7",
  orange: "#d29922",
  red:    "#f85149",
  pink:   "#db61a2",
  yellow: "#e3b341",
  mint:   "#56d364",
};

export const GIT_CHAPTERS: GitChapter[] = [
  {
    num: 1,
    kind: "chapter",
    title: "Git Fundamentals — What Actually Happens",
    subtitle: "The object model: working tree, index, repo, remotes, commits, branches, SHAs",
    accentColor: ACCENT.blue,
    why:
      "You cannot use Git well without understanding its object model. When things break — and they will — you need to know what git is actually doing, not just which command to run.",
    sections: [
      s("intro", "Why this matters", "intro", {
        body:
          "You cannot use Git well without understanding its object model. When things break — and they will — you need to know what git is actually doing, not just which command to run.",
      }),
      s("concepts", "Core concepts", "concepts", {
        concepts: [
          { name: "Working Tree", body: "Your files on disk. Where you edit code." },
          { name: "Index / Staging Area", body: "Snapshot of what will go into the next commit. `git add` moves files here." },
          { name: "Local Repository", body: "`.git/` folder. Contains the full history as objects. Entirely offline." },
          { name: "Remote", body: "Another copy of the repo (GitHub). `origin` is the default name." },
          { name: "Commit Object", body: "A snapshot, not a diff. Contains: tree (file snapshot), parent SHA, author, message." },
          { name: "Branch", body: "A pointer to a commit SHA. Moving a branch just updates the pointer — it is cheap." },
          { name: "HEAD", body: "Points to your current branch (or a commit in detached state). It is just a file: `.git/HEAD`." },
          { name: "SHA", body: "Every object (commit, tree, blob) is named by the SHA-1 hash of its content. Immutable." },
        ],
      }),
      s("commands", "Commands", "commands", {
        commands: [
          { command: "git init / git clone", when: "Start a repo locally or copy one from remote." },
          { command: "git status", when: "What changed, what is staged, what is untracked." },
          { command: "git add -p", when: "Stage changes interactively — hunk by hunk. Never use `git add .` blindly." },
          { command: "git commit -m", when: "Commit staged changes with a message. Use conventional commits in companies." },
          { command: "git log --oneline --graph", when: "Visualise branch history as a graph. Essential for understanding where you are." },
          { command: "git diff / git diff --staged", when: "See unstaged vs staged changes. Know the difference." },
          { command: "git show", when: "See what a specific commit changed. Used constantly in code review and debugging." },
          { command: "git stash / git stash pop", when: "Temporarily shelve uncommitted work. Switch context, come back cleanly." },
        ],
      }),
      s("scenario", "Real scenario — your first day", "scenario", {
        body: "Clone, explore the branch structure, branch off, stage hunks, commit, push.",
        code: {
          lang: "bash",
          source: `# Your first day — clone, explore, make a change
git clone git@github.com:company/repo.git && cd repo
git log --oneline --graph --all      # understand the branch structure
git branch -a                        # see all branches including remote
git checkout -b feature/your-name-first-task
# make your change
git add -p                           # review every hunk before staging
git commit -m 'feat: add X per ticket PROJ-123'
git push -u origin feature/your-name-first-task`,
        },
      }),
      s("traps", "Traps — read these", "traps", {
        traps: [
          "Never `git add .` — you will accidentally commit `.env` files, secrets, build artifacts. Use `git add -p` always.",
          "`git commit --amend` rewrites history. Only use on commits not yet pushed to remote.",
          "`git push --force` on a shared branch will destroy colleagues' work. Never do it without `--force-with-lease`.",
        ],
      }),
      s("principle", "Principle", "principle", {
        body:
          "Git stores snapshots of your entire project, not diffs. A branch is 41 bytes — just a SHA pointer. Commits are immutable. 'Rewriting history' means creating new commits, not editing old ones.",
      }),
    ],
  },

  {
    num: 2,
    kind: "chapter",
    title: "Branching Strategy — How Real Teams Work",
    subtitle: "Trunk-Based vs Git Flow, feature branches, naming, protection rules",
    accentColor: ACCENT.cyan,
    why:
      "Every company has a branching strategy. You need to understand Trunk-Based Development and Git Flow, know which one your company uses, and never break the rules that protect `main`.",
    sections: [
      s("intro", "Why this matters", "intro", {
        body:
          "Every company has a branching strategy. You need to understand Trunk-Based Development and Git Flow, know which one your company uses, and never break the rules that protect `main`.",
      }),
      s("concepts", "Core concepts", "concepts", {
        concepts: [
          { name: "Trunk-Based Dev", body: "Everyone branches off `main`, merges back quickly (hours to days). CI runs on every commit. Fast." },
          { name: "Git Flow", body: "Long-lived `feature`, `develop`, `release`, `hotfix` branches. Slower, more ceremony. Common in enterprises." },
          { name: "Feature Branch", body: "Short-lived branch for one task. Named: `feature/TICKET-description` or `feat/description`." },
          { name: "Hotfix Branch", body: "Emergency fix branched from `main`/production. Merged to both `main` and `develop`." },
          { name: "Release Branch", body: "Stabilisation branch. Only bug fixes allowed. Tagged when released." },
          { name: "Branch Protection", body: "Rules on `main`/`develop`: require PR, require CI pass, require reviews, no force push." },
          { name: "Naming Conventions", body: "Company standard: `feature/`, `fix/`, `chore/`, `hotfix/`, `release/`. Follow it exactly." },
          { name: "Stale Branches", body: "Delete branches after merge. Keep the remote clean. Your company has hundreds of engineers." },
        ],
      }),
      s("commands", "Commands", "commands", {
        commands: [
          { command: "git checkout -b feature/PROJ-123-add-auth", when: "Create and switch to new branch from current HEAD." },
          { command: "git branch -d feature/done", when: "Delete local branch after merge." },
          { command: "git push origin --delete feature/done", when: "Delete remote branch after merge." },
          { command: "git fetch --prune", when: "Fetch + delete local refs to deleted remote branches." },
          { command: "git branch --merged main", when: "List branches fully merged into `main`. Safe to delete these." },
          { command: "git switch main && git pull", when: "Always pull latest `main` before creating a new branch." },
          { command: "git log main..HEAD", when: "See commits on your branch that are not yet in `main`." },
          { command: "git cherry-pick <sha>", when: "Apply a specific commit from another branch onto current branch." },
        ],
      }),
      s("scenario", "Real scenario — starting a new ticket the right way", "scenario", {
        body: "Pull main, branch off, work, rebase against latest main, push.",
        code: {
          lang: "bash",
          source: `# Starting a new ticket the right way
git switch main
git pull origin main                          # always start from latest main
git checkout -b feature/PROJ-456-user-auth
# work, commit frequently with good messages
git fetch origin                              # check if main has moved
git rebase origin/main                        # keep your branch up to date
git push -u origin feature/PROJ-456-user-auth
# open PR on GitHub`,
        },
      }),
      s("traps", "Traps — read these", "traps", {
        traps: [
          "Never work directly on `main`. Even if you have push access. Even for a 'tiny' fix.",
          "Long-lived branches (weeks) accumulate conflicts. Rebase against `main` at least daily.",
          "Branch names with slashes create pseudo-folders in git. `feature/foo` and `feature/foo/bar` can conflict.",
        ],
      }),
      s("principle", "Principle", "principle", {
        body:
          "The best branch strategy is the one your team enforces consistently. Your job is to learn it on day one and follow it without exception. Ask your tech lead: 'What is our branching strategy?' before your first commit.",
      }),
    ],
  },

  {
    num: 3,
    kind: "chapter",
    title: "Commits — Writing History Your Team Can Read",
    subtitle: "Conventional commits, atomic changes, blame, bisect, interactive rebase",
    accentColor: ACCENT.green,
    why:
      "Your commit history is documentation. In 6 months, someone (maybe you) will `git blame` a line that caused a production incident and read your commit message. Make it useful.",
    sections: [
      s("intro", "Why this matters", "intro", {
        body:
          "Your commit history is documentation. In 6 months, someone (maybe you) will `git blame` a line that caused a production incident and read your commit message. Make it useful.",
      }),
      s("concepts", "Core concepts", "concepts", {
        concepts: [
          { name: "Conventional Commits", body: "Standard: `type(scope): description`. Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`, `perf`." },
          { name: "Atomic Commits", body: "One logical change per commit. Not one file per commit, not one day per commit." },
          { name: "git blame", body: "Shows who changed each line and in which commit. Used constantly in debugging." },
          { name: "git bisect", body: "Binary search through commits to find which one introduced a bug. Requires clean history." },
          { name: "Commit body", body: "After the subject line: explain WHY, not what. The diff shows what. The message explains why." },
          { name: "Co-authored-by", body: "Credit pair programmers: `Co-authored-by: Name <email>`. GitHub renders this on commits." },
          { name: "Signed commits", body: "GPG or SSH signed commits. Some companies require this. Adds a Verified badge on GitHub." },
          { name: "Squash vs merge", body: "Squashing collapses branch into one commit. Merge preserves full history. Team decides." },
        ],
      }),
      s("commands", "Commands", "commands", {
        commands: [
          { command: "git commit -m 'feat(auth): add JWT refresh token rotation'", when: "Conventional commit format." },
          { command: "git commit --amend --no-edit", when: "Add staged changes to last commit without changing message." },
          { command: "git rebase -i HEAD~3", when: "Interactive rebase: reorder, squash, edit last 3 commits before pushing." },
          { command: "git blame src/auth.py", when: "See who last modified each line of a file." },
          { command: "git log --follow -p src/auth.py", when: "Full history of a file including renames." },
          { command: "git bisect start / good / bad", when: "Binary search for the commit that introduced a bug." },
          { command: "git shortlog -sn", when: "Count commits per author. Useful for understanding team contribution." },
          { command: "git log --grep='PROJ-123'", when: "Find all commits mentioning a ticket number." },
        ],
      }),
      s("scenario", "Real scenario — cleaning up messy commits before opening a PR", "scenario", {
        body: "Interactive rebase to squash WIP/fixup commits and reword unclear messages into a clean story.",
        code: {
          lang: "bash",
          source: `# Cleaning up messy commits before opening a PR
git log --oneline HEAD~5..HEAD     # see your last 5 commits
git rebase -i HEAD~5               # interactive rebase
# in editor: squash WIP commits, fixup typo commits, reword unclear messages
# result: clean logical commits that tell a story
git push --force-with-lease        # safe force push — only if nobody else is on this branch`,
        },
      }),
      s("traps", "Traps — read these", "traps", {
        traps: [
          "'WIP', 'fix', 'asdfgh' are not commit messages. Your manager reads these in PR review.",
          "Never rebase commits that are already on a shared remote branch others are working from.",
          "`git commit -a` stages ALL tracked files. You may accidentally commit partial work.",
        ],
      }),
      s("principle", "Principle", "principle", {
        body:
          "Write commit messages as if the person reading them has no context and is debugging a production incident at 2 am. They might be. Subject: what changed. Body: why it changed. Reference the ticket.",
      }),
    ],
  },

  {
    num: 4,
    kind: "chapter",
    title: "Pull Requests — The Core Collaboration Loop",
    subtitle: "Drafts, reviews, suggested changes, merge strategies, the gh CLI",
    accentColor: ACCENT.purple,
    why:
      "In a big company, every line of code that reaches `main` goes through a PR. PRs are not just code review — they are the record of why a change was made, who approved it, and what was discussed.",
    sections: [
      s("intro", "Why this matters", "intro", {
        body:
          "In a big company, every line of code that reaches `main` goes through a PR. PRs are not just code review — they are the record of why a change was made, who approved it, and what was discussed.",
      }),
      s("concepts", "Core concepts", "concepts", {
        concepts: [
          { name: "PR Description", body: "Template-driven at most companies. Fill it: what changed, why, how to test, screenshots if UI." },
          { name: "Draft PR", body: "Open early for visibility without requesting review. Signals: work in progress, feedback welcome." },
          { name: "Required Reviews", body: "Branch protection requires N approvals before merge. Usually 1-2 in most teams." },
          { name: "Review comments", body: "Inline on specific lines. Conversations must be resolved before merge in many setups." },
          { name: "Suggested Changes", body: "Reviewer proposes exact code change. Author applies with one click. Efficient for small fixes." },
          { name: "Requested Changes", body: "Reviewer blocks merge until concerns are addressed. Not personal — it is process." },
          { name: "PR checks", body: "CI must pass. Linting must pass. Required status checks block merge if they fail." },
          { name: "Merge strategies", body: "Merge commit (preserves history), Squash (one clean commit), Rebase (linear history)." },
        ],
      }),
      s("commands", "Commands", "commands", {
        commands: [
          { command: "gh pr create --title '...' --body '...'", when: "Create PR from CLI without opening browser." },
          { command: "gh pr view --web", when: "Open current branch's PR in browser." },
          { command: "gh pr checkout 123", when: "Checkout PR #123 locally to test it." },
          { command: "gh pr review --approve", when: "Approve a PR from CLI." },
          { command: "gh pr merge --squash", when: "Merge PR with squash strategy from CLI." },
          { command: "gh pr list --author @me", when: "See all your open PRs." },
          { command: "gh pr status", when: "See PRs that need your attention right now." },
          { command: "git fetch origin pull/123/head:pr-123", when: "Fetch a PR branch without `gh` CLI." },
        ],
      }),
      s("scenario", "Real scenario — opening a good PR that gets reviewed fast", "scenario", {
        body: "Push, create via gh, address review comments with focused commits, resolve conversations.",
        code: {
          lang: "bash",
          source: `# Opening a good PR that gets reviewed fast

# Push your branch
git push -u origin feature/PROJ-456-user-auth

# Create PR with gh CLI
gh pr create --title 'feat(auth): add JWT refresh token rotation' \\
  --body 'Closes #456. Adds sliding expiry on refresh tokens. See ADR-012.' \\
  --reviewer tech-lead-username

# After review comments:
git add -p && git commit -m 'fix: address review comment on token expiry'
git push                                # PR auto-updates
# Resolve each conversation on GitHub after addressing it`,
        },
      }),
      s("traps", "Traps — read these", "traps", {
        traps: [
          "Giant PRs (1000+ line diffs) do not get reviewed properly. Keep PRs under 400 lines of production code.",
          "Pushing more commits during review restarts the reviewer's mental context. Communicate before pushing.",
          "Never merge your own PR in a company setting unless explicitly allowed. Get approval first.",
        ],
      }),
      s("principle", "Principle", "principle", {
        body:
          "A PR is a conversation, not a submission for grading. The goal is to ship good code, not to win the argument. If a reviewer requests a change and you disagree, discuss — but assume good faith.",
      }),
    ],
  },

  {
    num: 5,
    kind: "chapter",
    title: "Merge Conflicts — Resolving Without Panic",
    subtitle: "Conflict markers, rebase vs merge conflicts, rerere, ours vs theirs",
    accentColor: ACCENT.orange,
    why:
      "Conflicts happen on every team. The engineer who handles them calmly and correctly is the one who gets trusted with more responsibility. Panic is optional. Understanding is not.",
    sections: [
      s("intro", "Why this matters", "intro", {
        body:
          "Conflicts happen on every team. The engineer who handles them calmly and correctly is the one who gets trusted with more responsibility. Panic is optional. Understanding is not.",
      }),
      s("concepts", "Core concepts", "concepts", {
        concepts: [
          { name: "Why conflicts happen", body: "Two people changed the same lines in different ways. Git cannot auto-decide which is correct." },
          { name: "Conflict markers", body: "`<<<<<<< HEAD` (your changes), `=======` (divider), `>>>>>>> branch` (their changes)." },
          { name: "Rebase vs merge conflicts", body: "Rebase replays your commits — each may conflict separately. Merge conflicts once at the end." },
          { name: "git mergetool", body: "Opens a visual diff tool (VS Code, vimdiff, etc.) to resolve conflicts with context." },
          { name: "git rerere", body: "Reuse Recorded Resolution. Git remembers how you resolved a conflict and auto-applies next time." },
          { name: "Ours vs theirs", body: "In a merge: ours = current branch, theirs = incoming. In a rebase: ours = upstream, theirs = your commits." },
          { name: "Binary conflicts", body: "Images, compiled files — cannot merge line by line. Choose one version explicitly." },
          { name: "Conflict prevention", body: "Rebase against `main` frequently. Small PRs. Communicate when touching shared files." },
        ],
      }),
      s("commands", "Commands", "commands", {
        commands: [
          { command: "git rebase origin/main", when: "Rebase your branch onto latest `main`. Most common conflict scenario." },
          { command: "git status", when: "After conflict: shows which files are conflicted (both modified)." },
          { command: "git diff", when: "Shows conflict markers in files. Read this before editing." },
          { command: "git add <file>", when: "Mark a conflict as resolved after editing the file." },
          { command: "git rebase --continue", when: "Continue rebase after resolving each commit's conflicts." },
          { command: "git rebase --abort", when: "Abort the entire rebase and return to pre-rebase state. Safe escape hatch." },
          { command: "git checkout --ours <file>", when: "Take your version entirely for a specific file." },
          { command: "git checkout --theirs <file>", when: "Take their version entirely for a specific file." },
        ],
      }),
      s("scenario", "Real scenario — resolving a rebase conflict on a shared file", "scenario", {
        body: "Fetch, rebase, resolve in editor, add, continue, force-with-lease.",
        code: {
          lang: "bash",
          source: `# Resolving a rebase conflict on a shared file
git fetch origin
git rebase origin/main
# CONFLICT: Merge conflict in src/config.py
git status                              # see conflicted files
code src/config.py                      # open in VS Code — look for <<<<<<< markers
# Edit: keep correct version, remove all markers
git add src/config.py
git rebase --continue
# if another conflict: repeat. if clean: push
git push --force-with-lease             # required after rebase`,
        },
      }),
      s("traps", "Traps — read these", "traps", {
        traps: [
          "`--force-with-lease` fails if someone else pushed to your branch since your last fetch. That is intentional — it protects them.",
          "Accepting 'ours' or 'theirs' entirely without reading both sides causes silent data loss.",
          "After `git rebase --abort`, your branch is exactly as before. It is always safe to abort and ask for help.",
        ],
      }),
      s("principle", "Principle", "principle", {
        body:
          "When you see a conflict, your job is to produce the correct code — not just to make the markers go away. Read both sides. Understand why both changes exist. Then write the right answer.",
      }),
    ],
  },

  {
    num: 6,
    kind: "chapter",
    title: "Code Review — Giving and Receiving",
    subtitle: "Nits vs blockers, LGTM, request-changes etiquette, async mentorship",
    accentColor: ACCENT.red,
    why:
      "Code review is how knowledge spreads in a company. Senior engineers mentor through review. Giving good reviews is a career accelerator. Receiving them without ego is a sign of maturity.",
    sections: [
      s("intro", "Why this matters", "intro", {
        body:
          "Code review is how knowledge spreads in a company. Senior engineers mentor through review. Giving good reviews is a career accelerator. Receiving them without ego is a sign of maturity.",
      }),
      s("concepts", "Core concepts", "concepts", {
        concepts: [
          { name: "Review as author", body: "Small PRs. Clear description. Self-review before requesting. Link to the ticket. No WIPs." },
          { name: "Review as reviewer", body: "Understand context before commenting. Distinguish blocking vs non-blocking feedback." },
          { name: "Nit:", body: "Prefix for minor style comments that are not blocking. Reviewer is flagging, not demanding." },
          { name: "Blocking comment", body: "Requires resolution before merge. Usually: bugs, security issues, correctness problems." },
          { name: "Approve with comments", body: "I approve this, but here are optional suggestions. Author can merge immediately." },
          { name: "LGTM", body: "Looks Good To Me. The informal approval. Still counts as a review in most companies." },
          { name: "Request Changes", body: "Reviewer is blocking the PR. They must re-review after author addresses comments." },
          { name: "Review etiquette", body: "Review code, not people. Ask questions instead of commands. Explain why, not just what." },
        ],
      }),
      s("commands", "Commands", "commands", {
        commands: [
          { command: "gh pr review --approve -b 'LGTM, left one nit'", when: "Approve with a comment." },
          { command: "gh pr review --request-changes -b 'See inline comments'", when: "Request changes." },
          { command: "gh pr comment -b 'Can you explain why X?'", when: "Add a general PR comment." },
          { command: "gh pr view 123", when: "See PR details from terminal." },
          { command: "gh pr checks", when: "See CI check status on current PR." },
          { command: "git log origin/main..HEAD --oneline", when: "What am I reviewing — commits on this branch." },
          { command: "git diff origin/main...HEAD", when: "Full diff of this branch vs `main`. What the reviewer sees." },
          { command: "gh pr diff", when: "See the PR diff from terminal." },
        ],
      }),
      s("scenario", "Real scenario — your first PR review at a new company", "scenario", {
        body: "Checkout the PR, read the ticket + description, run locally, leave contextual comments, approve with nits.",
        code: {
          lang: "bash",
          source: `# Your first PR review at a new company
gh pr checkout 247                                  # checkout the PR branch locally
git log origin/main..HEAD --oneline                 # understand what was changed and why
# read the PR description and linked ticket first
# run the code locally if it affects behaviour
# leave comments with context: 'This could cause X in edge case Y because...'
# mark non-blocking with 'Nit:' prefix
# ask questions: 'Why was this approach chosen over X?'
gh pr review --approve -b 'Solid work. Left two nits, both optional.'`,
        },
      }),
      s("traps", "Traps — read these", "traps", {
        traps: [
          "Reviewing without running the code catches style issues but misses runtime bugs. Checkout and test.",
          "'This is wrong' is not useful feedback. 'This will fail when X because Y, suggest Z instead' is.",
          "Approving PRs you did not read to unblock a colleague is worse than not reviewing at all.",
        ],
      }),
      s("principle", "Principle", "principle", {
        body:
          "The best comment a reviewer can leave is a question, not a command. 'I wonder if this handles the empty case?' invites collaboration. 'Handle the empty case' triggers defensiveness.",
      }),
    ],
  },

  {
    num: 7,
    kind: "chapter",
    title: "GitHub Issues, Projects, and Team Workflow",
    subtitle: "Triage, labels, milestones, closing keywords, Projects boards",
    accentColor: ACCENT.pink,
    why:
      "In a big company, GitHub Issues is how work is tracked. You need to triage, label, close, and link issues to PRs correctly. Projects boards give your manager visibility into what is in progress.",
    sections: [
      s("intro", "Why this matters", "intro", {
        body:
          "In a big company, GitHub Issues is how work is tracked. You need to triage, label, close, and link issues to PRs correctly. Projects boards give your manager visibility into what is in progress.",
      }),
      s("concepts", "Core concepts", "concepts", {
        concepts: [
          { name: "Issue", body: "A unit of work: bug report, feature request, task. Always link your PR to the issue that created it." },
          { name: "Closing keywords", body: "`Closes #123` in PR description auto-closes the issue when PR merges. Use it every time." },
          { name: "Labels", body: "`bug`, `enhancement`, `good first issue`, `priority:high`. Your team has a label taxonomy — learn it." },
          { name: "Assignees", body: "Who is responsible. Assign yourself when you pick up a ticket. Unassign if you drop it." },
          { name: "Milestones", body: "Group issues for a release or sprint. Used for tracking release readiness." },
          { name: "GitHub Projects", body: "Kanban/table view of issues across repos. Where your manager watches progress." },
          { name: "Issue Templates", body: "Company defines templates for bug reports and feature requests. Fill them completely." },
          { name: "Mentions", body: "`@username` in a comment notifies them. Use this when you need someone specific to see something." },
        ],
      }),
      s("commands", "Commands", "commands", {
        commands: [
          { command: "gh issue create --title '...' --label bug", when: "Create an issue from CLI." },
          { command: "gh issue list --assignee @me", when: "Your assigned issues." },
          { command: "gh issue view 123", when: "See issue details from terminal." },
          { command: "gh issue close 123 -c 'Fixed in PR #456'", when: "Close an issue with a comment." },
          { command: "gh issue edit 123 --add-label 'priority:high'", when: "Add a label to an issue." },
          { command: "gh issue develop 123", when: "Create a branch linked to the issue automatically." },
          { command: "gh project list", when: "See GitHub Projects in your org." },
          { command: "gh search issues 'is:open assignee:@me'", when: "Search your open issues." },
        ],
      }),
      s("scenario", "Real scenario — full ticket lifecycle at a company", "scenario", {
        body: "Pick up, assign yourself, branch off the issue, work, PR with closing keyword, auto-close on merge.",
        code: {
          lang: "bash",
          source: `# Full ticket lifecycle at a company

# 1. Pick up a ticket
gh issue view 456                              # read the full issue
gh issue edit 456 --add-assignee @me

# 2. Create a branch linked to the issue
gh issue develop 456 --checkout

# 3. Work, commit, push
git commit -m 'feat(auth): add refresh token PROJ-456'
git push -u origin feature/456-refresh-token

# 4. Open PR that closes the issue
gh pr create --title '...' --body 'Closes #456'

# 5. After merge — issue auto-closes. Update Projects board.`,
        },
      }),
      s("traps", "Traps — read these", "traps", {
        traps: [
          "Forgetting `Closes #123` means the issue stays open after merge. Someone else will pick it up again.",
          "Assigning yourself and going silent is worse than not assigning. Comment if blocked.",
          "Creating issues without labels or milestones makes sprint planning impossible for your tech lead.",
        ],
      }),
      s("principle", "Principle", "principle", {
        body:
          "GitHub Issues is your team's shared memory. A ticket with clear description, correct labels, linked PR, and a closing comment is a contribution that saves the next engineer 30 minutes of archaeology.",
      }),
    ],
  },

  {
    num: 8,
    kind: "chapter",
    title: "Advanced Git — The Commands You Need When Things Break",
    subtitle: "reflog, revert, reset, worktree, tag, undo recipes",
    accentColor: ACCENT.yellow,
    why:
      "You will eventually push the wrong thing, delete work, or need to undo a deployed commit. These are the commands that save you when standard git is not enough.",
    sections: [
      s("intro", "Why this matters", "intro", {
        body:
          "You will eventually push the wrong thing, delete work, or need to undo a deployed commit. These are the commands that save you when standard git is not enough.",
      }),
      s("concepts", "Core concepts", "concepts", {
        concepts: [
          { name: "git reflog", body: "Your local undo history. Every HEAD movement is logged here. The ultimate safety net." },
          { name: "git revert", body: "Creates a new commit that undoes a previous commit. Safe for shared branches. Does not rewrite history." },
          { name: "git reset --soft", body: "Move HEAD back N commits. Keep changes staged. Use to re-commit with better message." },
          { name: "git reset --hard", body: "Move HEAD back and DISCARD all changes. Destructive. Use with extreme caution." },
          { name: "git worktree", body: "Check out multiple branches simultaneously in separate directories. No stash required." },
          { name: "git submodule", body: "Embed another repo inside your repo. Common in large companies for shared libraries." },
          { name: "git tag", body: "Mark a specific commit as a release. Annotated tags include metadata. Push tags explicitly." },
          { name: "git archive", body: "Export repo contents as a zip without `.git` folder. Used for deployments or sharing." },
        ],
      }),
      s("commands", "Commands", "commands", {
        commands: [
          { command: "git reflog", when: "See every recent HEAD position. Find lost commits." },
          { command: "git checkout <sha>", when: "Go back to any commit to inspect it. Detached HEAD state — no edits." },
          { command: "git revert <sha>", when: "Safely undo a commit on a shared branch. Creates inverse commit." },
          { command: "git reset --soft HEAD~1", when: "Undo last commit, keep changes staged. Ready to re-commit." },
          { command: "git restore <file>", when: "Discard unstaged changes in a file. Replaces old `git checkout -- <file>`." },
          { command: "git clean -fd", when: "Delete untracked files and directories. Useful after a bad build." },
          { command: "git tag -a v1.0.0 -m 'Release 1.0.0' && git push --tags", when: "Create and push annotated tag." },
          { command: "git log --all --oneline | grep <text>", when: "Find a commit by message fragment." },
        ],
      }),
      s("scenario", "Real scenario — you accidentally committed secrets", "scenario", {
        body: "Rotate first, then either un-stage locally or coordinate a history rewrite if already pushed.",
        code: {
          lang: "bash",
          source: `# You accidentally committed secrets — here is what to do

# Scenario: you committed .env with real API keys
# FIRST: rotate the secret immediately — assume it is already compromised

# If not yet pushed:
git reset --soft HEAD~1                  # undo commit, keep changes staged
git restore --staged .env                # unstage .env
echo '.env' >> .gitignore
git add .gitignore && git commit -m 'chore: add .env to gitignore'

# If already pushed — tell your tech lead immediately
# The secret is now in git history on GitHub. Rotation is not optional.
# Use BFG Repo Cleaner or git filter-repo to purge from history
# Force push to all branches — coordinate with team
# GitHub will cache the removed content for 90 days — secrets must be rotated`,
        },
      }),
      s("traps", "Traps — read these", "traps", {
        traps: [
          "`git reset --hard` with unstaged changes loses them permanently. No undo. Check `git status` first.",
          "`git clean -fd` removes untracked files permanently. There is no trash. Run `git clean -nd` first to preview.",
          "Deleting a remote branch deletes it for everyone. Confirm with your team before deleting shared branches.",
        ],
      }),
      s("principle", "Principle", "principle", {
        body:
          "`git reflog` is your time machine. Every git operation that moves HEAD is logged there for 90 days. Lost a commit? Accidentally `reset --hard`? `git reflog` shows where HEAD was. `git checkout <sha>` brings it back.",
      }),
    ],
  },

  {
    num: 9,
    kind: "chapter",
    title: "GitHub at a Company — Unwritten Rules",
    subtitle: "Protected main, CODEOWNERS, Dependabot, audit log, README hygiene",
    accentColor: ACCENT.mint,
    why:
      "Technical skills get you hired. These habits get you trusted. Big company GitHub usage has unwritten rules that distinguish engineers who fit from those who create friction.",
    sections: [
      s("intro", "Why this matters", "intro", {
        body:
          "Technical skills get you hired. These habits get you trusted. Big company GitHub usage has unwritten rules that distinguish engineers who fit from those who create friction.",
      }),
      s("concepts", "Core concepts", "concepts", {
        concepts: [
          { name: "Protected main", body: "`main`/`master` is protected. Direct push = blocked. PR required. CI required. This is law." },
          { name: "CODEOWNERS", body: "Defines who must review changes to specific files. Auto-assigned on PR. You cannot bypass this." },
          { name: "Dependabot", body: "Auto-creates PRs for dependency updates. Your company may require you to review and merge these." },
          { name: "Security alerts", body: "GitHub scans for known vulnerable dependencies. Critical alerts require immediate action." },
          { name: "Audit log", body: "Every action in a GitHub org is logged. Force pushes, branch deletions, settings changes — all visible to admins." },
          { name: "Repository topics", body: "Tags on repos that help engineers find related projects. Add them to repos you own." },
          { name: "README standards", body: "Companies have README templates. A good README: purpose, setup, how to run tests, architecture link." },
          { name: "GitHub Discussions", body: "Async technical conversations. Better than Slack for decisions that need to be searchable later." },
        ],
      }),
      s("commands", "Commands", "commands", {
        commands: [
          { command: "gh repo view", when: "See repo details, description, topics." },
          { command: "gh repo clone org/repo", when: "Clone using org context." },
          { command: "gh secret set MY_SECRET", when: "Set a repo secret from CLI." },
          { command: "gh ruleset list", when: "See branch protection rules." },
          { command: "gh api /repos/{owner}/{repo}/branches/main/protection", when: "Read protection rules via API." },
          { command: "gh audit-log --include push", when: "View org audit log (admin only)." },
          { command: "gh repo archive", when: "Archive a repo — makes it read-only. Useful for deprecated projects." },
          { command: "gh repo set-default", when: "Set default remote for `gh` CLI in a repo." },
        ],
      }),
      s("scenario", "Real scenario — what to do your first week at a new company", "scenario", {
        body: "Read README + CONTRIBUTING + CODEOWNERS, study branching, copy commit/PR style, ship a tiny first PR.",
        code: {
          lang: "bash",
          source: `# What to do your first week at a new company

# 1. Understand the repo structure
gh repo view company/main-repo
cat README.md && cat CONTRIBUTING.md
cat .github/CODEOWNERS

# 2. Understand the branching strategy
git log --oneline --graph --all | head -30
gh ruleset list                              # see what is protected

# 3. Find your team's conventions
git log --oneline -20                        # read 20 recent commit messages — copy the style
gh pr list --limit 10                        # read recent PRs — copy the description style

# 4. Make a tiny first PR
# Fix a typo in docs. Open a PR. Follow the template exactly.
# This is your first impression in code review.`,
        },
      }),
      s("traps", "Traps — read these", "traps", {
        traps: [
          "Bypassing CODEOWNERS review — even if technically possible — will create lasting trust problems.",
          "Force pushing without team coordination on any shared branch will interrupt everyone working on it.",
          "Ignoring security alerts in repos you own. GitHub sends them for a reason. They are your responsibility.",
        ],
      }),
      s("principle", "Principle", "principle", {
        body:
          "In a big company, your GitHub activity is visible to everyone. Your commit messages, PR descriptions, and review comments are your professional reputation in code form. Write them accordingly.",
      }),
    ],
  },

  // ─── Survival cheat sheet ────────────────────────────────────────────────
  {
    num: 10,
    kind: "cheatsheet",
    title: "Survival Cheat Sheet — Commands You Will Use Every Day",
    subtitle: "Print this. Put it on your desk. You will stop needing it in 3 weeks.",
    accentColor: ACCENT.blue,
    sections: [
      s("intro", "How to use this", "intro", {
        body:
          "These are the commands you reach for on the job, every single day. Memorise the pattern — when something breaks, read `git status` and `git log` before asking anyone. The answer is almost always there.",
      }),
      s("commands", "Daily commands", "commands", {
        commands: [
          { command: "git log --oneline --graph --all", when: "Understand the whole branch picture at a glance." },
          { command: "git status", when: "What is staged, unstaged, untracked — always check before committing." },
          { command: "git add -p", when: "Stage changes hunk by hunk — never blindly add everything." },
          { command: "git stash / git stash pop", when: "Shelve work, context switch, come back clean." },
          { command: "git rebase origin/main", when: "Keep your branch current — run this daily on long-lived branches." },
          { command: "git revert <sha>", when: "Safe undo on shared branches — does not rewrite history." },
          { command: "git reflog", when: "Find anything you lost — your complete local undo history." },
          { command: "git log --follow -p <file>", when: "Full history of a file including across renames." },
          { command: "git bisect start/good/bad", when: "Binary search for the commit that broke something." },
          { command: "git blame <file>", when: "Who last changed each line — used in debugging constantly." },
          { command: "gh pr create / view / checkout", when: "Full PR lifecycle from the terminal." },
          { command: "gh issue develop <n> --checkout", when: "Create and checkout a branch linked to an issue." },
          { command: "git push --force-with-lease", when: "Force push safely — fails if someone else pushed since your last fetch." },
          { command: "git clean -nd (preview)", when: "See what `git clean -fd` would delete before it deletes it." },
          { command: "git diff origin/main...HEAD", when: "See exactly what your branch changes vs `main`." },
        ],
      }),
      s("principle", "Closing principle", "principle", {
        body:
          "Git does not care about your feelings. Learn the model, not the magic words. When something breaks, read `git status` and `git log` before asking anyone. The answer is almost always there.",
      }),
    ],
  },
];

// ─── Getters ────────────────────────────────────────────────────────────────

export function getGitChapter(num: number): GitChapter | undefined {
  return GIT_CHAPTERS.find((c) => c.num === num);
}
