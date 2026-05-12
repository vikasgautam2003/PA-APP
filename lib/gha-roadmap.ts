import type { GhaChapter, GhaSection } from "@/types";

function s(
  id: string,
  label: string,
  tone: GhaSection["tone"],
  extra: Partial<GhaSection> = {}
): GhaSection {
  return { id, label, tone, ...extra };
}

// ─── 8 chapters + 1 capstone ────────────────────────────────────────────────

export const GHA_CHAPTERS: GhaChapter[] = [
  {
    num: 1,
    kind: "chapter",
    title: "Core Concepts — How GitHub Actions Actually Works",
    subtitle: "The runner lifecycle, workflow resolution, and execution model",
    whyMatters:
      "Most people copy YAML without understanding the execution model. By the end of this chapter you will understand the runner lifecycle, how GitHub resolves workflow files, and why certain things fail before you write a single workflow.",
    miniProjectTitle: "Mini Project 1 — Hello Pipeline",
    miniProjectDesc:
      "First real workflow. Understand the execution flow by reading the logs step by step.",
    sections: [
      s("intro", "Why this matters", "intro", {
        body:
          "Most people copy YAML without understanding the execution model. By the end of this chapter you will understand the runner lifecycle, how GitHub resolves workflow files, and why certain things fail before you write a single workflow.",
      }),
      s("concepts", "Core concepts", "concepts", {
        concepts: [
          { name: "Workflow", body: "A YAML file in `.github/workflows/`. Triggered by events. Contains one or more jobs." },
          { name: "Event", body: "What triggers the workflow — `push`, `pull_request`, `schedule`, `workflow_dispatch`, `repository_dispatch`, etc." },
          { name: "Job", body: "A set of steps that runs on a single runner. Jobs run in parallel by default. Use `needs:` to serialise." },
          { name: "Step", body: "A single task inside a job — either a shell command (`run:`) or an action (`uses:`)." },
          { name: "Runner", body: "The VM that executes the job. GitHub-hosted: `ubuntu-latest`, `windows-latest`, `macos-latest`. Or self-hosted." },
          { name: "Action", body: "A reusable unit of work. Can be a Docker container action, JavaScript action, or composite action." },
          { name: "Context", body: "Runtime objects: `github`, `env`, `job`, `steps`, `runner`, `secrets`, `inputs`. Accessed via `${{ context.property }}`." },
          { name: "Expression", body: "Evaluated at runtime: `${{ }}` syntax. Functions: `contains()`, `startsWith()`, `toJSON()`, `fromJSON()`." },
        ],
      }),
      s("yaml", "Mini Project 1 — Hello Pipeline (YAML)", "yaml", {
        body:
          "First real workflow. Save as `.github/workflows/hello.yml`. Trigger via push to main or manually from the UI.",
        code: {
          lang: "yaml",
          source: `# .github/workflows/hello.yml
name: Hello Pipeline

on:
  push:
    branches: [main]
  workflow_dispatch:   # manual trigger from GitHub UI

jobs:
  hello:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Print context
        run: |
          echo "Branch: \${{ github.ref_name }}"
          echo "Commit: \${{ github.sha }}"
          echo "Actor:  \${{ github.actor }}"
          echo "Event:  \${{ github.event_name }}"

      - name: Show runner info
        run: |
          echo OS: \${{ runner.os }}
          uname -a
          df -h`,
        },
      }),
      s("tasks", "Hands-on tasks", "tasks", {
        tasks: [
          "Trigger it via push. Read the full log — understand every line GitHub prints before your steps run.",
          "Trigger it via `workflow_dispatch`. Note the difference in `github.event_name` context.",
          "Add a step that intentionally fails (`exit 1`). Watch subsequent steps skip. Understand default behaviour.",
          "Add `continue-on-error: true` to the failing step. Watch the job complete despite the failure.",
        ],
      }),
      s("principle", "Principle", "principle", {
        body:
          "The runner downloads your repo, installs the actions, then executes steps sequentially. Each step runs in the same shell session — environment variables set in one step persist to the next via `$GITHUB_ENV`.",
      }),
    ],
  },

  {
    num: 2,
    kind: "chapter",
    title: "Triggers — When Workflows Run",
    subtitle: "Push, PR, schedule, dispatch, paths, and concurrency control",
    whyMatters:
      "Wrong trigger design is the most common cause of broken pipelines — workflows running too often, not running on the right branches, or never running at all. You will know every trigger and its options.",
    miniProjectTitle: "Mini Project 2 — Smart Triggers",
    miniProjectDesc:
      "Build a workflow that only runs when relevant files change, with manual override and concurrency control.",
    sections: [
      s("intro", "Why this matters", "intro", {
        body:
          "Wrong trigger design is the most common cause of broken pipelines — workflows running too often, not running on the right branches, or never running at all. You will know every trigger and its options.",
      }),
      s("concepts", "Core concepts", "concepts", {
        concepts: [
          { name: "push / pull_request", body: "Most common. Filter by `branches:`, `tags:`, `paths:` — only run when relevant files change." },
          { name: "workflow_dispatch", body: "Manual trigger. Supports `inputs:` so you can pass parameters when running from the UI or API." },
          { name: "schedule", body: "Cron syntax. Runs on UTC. Use for nightly builds, cleanup jobs, dependency audits." },
          { name: "workflow_call", body: "Makes a workflow reusable — callable from another workflow. The basis of DRY pipelines." },
          { name: "repository_dispatch", body: "Triggered by external HTTP POST to GitHub API. Use for cross-repo or external system triggers." },
          { name: "release", body: "Triggers on GitHub release events — `published`, `created`, `prereleased`. Use for release pipelines." },
          { name: "paths filter", body: "`on.push.paths: ['src/**', '*.py']` — only triggers if matching files changed. Saves minutes per run." },
          { name: "concurrency", body: "`concurrency: group` prevents duplicate runs. `cancel-in-progress: true` kills the stale run automatically." },
        ],
      }),
      s("yaml", "Mini Project 2 — Smart Triggers (YAML)", "yaml", {
        body:
          "A workflow that fires on relevant pushes and PRs, has a manual override with inputs, runs nightly, and cancels stale runs.",
        code: {
          lang: "yaml",
          source: `name: Smart CI

on:
  push:
    branches: [main, 'feature/**']
    paths:
      - 'src/**'
      - 'tests/**'
      - 'requirements*.txt'
  pull_request:
    branches: [main]
    paths:
      - 'src/**'
  workflow_dispatch:
    inputs:
      skip_tests:
        description: 'Skip test suite'
        type: boolean
        default: false
  schedule:
    - cron: '0 2 * * 1'   # every Monday 2 am UTC

concurrency:
  group: \${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: true

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        if: \${{ !inputs.skip_tests }}
        run: echo 'running tests...'`,
        },
      }),
      s("tasks", "Hands-on tasks", "tasks", {
        tasks: [
          "Push a change to a non-`src/` file (e.g. README). Verify the workflow does NOT trigger.",
          "Push a change to `src/`. Verify it triggers.",
          "Open two PRs rapidly. Watch concurrency cancel the first run when the second starts.",
          "Trigger manually with `skip_tests: true`. Verify the test step is skipped via the `if:` condition.",
        ],
      }),
      s("principle", "Principle", "principle", {
        body:
          "`paths:` filtering happens BEFORE a runner is allocated — pure savings, no compute cost. Concurrency groups are per-workflow per-ref by default, which is the right granularity for CI.",
      }),
    ],
  },

  {
    num: 3,
    kind: "chapter",
    title: "Jobs, Steps, and Dependency Graphs",
    subtitle: "Parallelism, matrix, gates, services, and conditional execution",
    whyMatters:
      "Multi-job pipelines are where GitHub Actions gets powerful. Parallelism, sequential gates, fan-out/fan-in patterns, and conditional execution are all job-level concepts.",
    miniProjectTitle: "Mini Project 3 — Parallel CI with Matrix and Gates",
    miniProjectDesc:
      "Fan-out testing across Python versions, fan-in to a single deploy gate.",
    sections: [
      s("intro", "Why this matters", "intro", {
        body:
          "Multi-job pipelines are where GitHub Actions gets powerful. Parallelism, sequential gates, fan-out/fan-in patterns, and conditional execution are all job-level concepts.",
      }),
      s("concepts", "Core concepts", "concepts", {
        concepts: [
          { name: "needs:", body: "Declares job dependency. Job B runs only after Job A completes. Creates a DAG of jobs." },
          { name: "outputs:", body: "Pass data between jobs. Job A sets output, Job B reads via `needs.job-a.outputs.key`." },
          { name: "matrix:", body: "Run the same job with different parameter combinations — OS, language version, region." },
          { name: "services:", body: "Spin up Docker containers as sidecars — databases, caches — available to all steps in the job." },
          { name: "if: conditions", body: "Control whether a job or step runs. Uses expression syntax: `github.event_name == 'push'`." },
          { name: "environment:", body: "Link a job to a GitHub Environment for protection rules and scoped secrets." },
          { name: "timeout-minutes:", body: "Kill a job after N minutes. Default 360. Always set this explicitly in production." },
          { name: "strategy.fail-fast", body: "In matrix jobs: `false` = all variants run even if one fails. Default `true` cancels all on first failure." },
        ],
      }),
      s("yaml", "Mini Project 3 — Parallel CI (YAML)", "yaml", {
        body:
          "Lint → matrix test (3 Python versions) with a Postgres sidecar → deploy gate that only runs on main.",
        code: {
          lang: "yaml",
          source: `name: Matrix CI
on: [push]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pip install ruff && ruff check .

  test:
    needs: lint
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        python: ['3.10', '3.11', '3.12']
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: \${{ matrix.python }}
      - run: pip install -r requirements.txt && pytest
        env:
          DATABASE_URL: postgresql://postgres:test@localhost/test

  deploy-gate:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - run: echo 'All matrix variants passed. Ready to deploy.'`,
        },
      }),
      s("tasks", "Hands-on tasks", "tasks", {
        tasks: [
          "Introduce a syntax error in your code. Watch `lint` fail and `test` never start.",
          "Make one Python version fail in the test matrix. With `fail-fast: false`, watch the others complete.",
          "Push to a feature branch. Watch `deploy-gate` skip due to the `if:` condition.",
          "Add an output from the `test` job and read it in `deploy-gate` via `needs.test.outputs`.",
        ],
      }),
      s("principle", "Principle", "principle", {
        body:
          "Jobs in a `needs` chain share no filesystem. Use `actions/upload-artifact` and `actions/download-artifact` to pass build artifacts between jobs. `outputs:` is only for small scalar values (strings, booleans).",
      }),
    ],
  },

  {
    num: 4,
    kind: "chapter",
    title: "Secrets, Variables, and Security",
    subtitle: "OIDC, least privilege, script injection, and pull_request_target traps",
    whyMatters:
      "Secret leaks from CI pipelines are a top-10 breach vector. You will implement proper secret handling, OIDC keyless auth to AWS, and understand every attack surface in GitHub Actions.",
    miniProjectTitle: "Mini Project 4 — OIDC Keyless AWS Deploy",
    miniProjectDesc:
      "Deploy to AWS without any stored credentials. GitHub mints a JWT; AWS validates it via OIDC.",
    sections: [
      s("intro", "Why this matters", "intro", {
        body:
          "Secret leaks from CI pipelines are a top-10 breach vector. You will implement proper secret handling, OIDC keyless auth to AWS, and understand every attack surface in GitHub Actions.",
      }),
      s("concepts", "Core concepts", "concepts", {
        concepts: [
          { name: "Secrets", body: "Encrypted at rest. Never printed in logs (GitHub masks them). Scoped: repo, environment, or org." },
          { name: "Variables", body: "Plaintext config values. Use for non-sensitive config: region, image tag, feature flags." },
          { name: "GITHUB_TOKEN", body: "Auto-generated per run. Scoped to the repo. Use for git operations, creating PRs, posting comments." },
          { name: "OIDC", body: "Keyless auth to cloud providers. GitHub mints a JWT; AWS/GCP validates it. No stored credentials." },
          { name: "Script injection", body: "Never interpolate `${{ github.event.issue.title }}` directly into `run:` commands — attackers control it." },
          { name: "permissions:", body: "Restrict `GITHUB_TOKEN` scope per job: `contents: read`, `id-token: write`. Principle of least privilege." },
          { name: "Environment secrets", body: "Scoped to a specific environment. Required reviewers gate access — production secrets need approval." },
          { name: "pull_request_target", body: "Runs in context of base repo — has secrets. Dangerous with untrusted PRs. Know the attack." },
        ],
      }),
      s("yaml", "Mini Project 4 — OIDC Keyless AWS Deploy (YAML)", "yaml", {
        body:
          "Zero stored credentials. The IAM role's trust policy validates the OIDC subject claim from GitHub.",
        code: {
          lang: "yaml",
          source: `name: OIDC Deploy

on:
  push:
    branches: [main]

permissions:
  id-token: write   # required for OIDC
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production   # requires reviewer approval
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials via OIDC
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789:role/github-actions-role
          aws-region: us-east-1
          # NO access key or secret key — OIDC only

      - name: Deploy
        run: |
          aws s3 sync ./dist s3://my-bucket --delete
          aws cloudfront create-invalidation \\
            --distribution-id $CF_ID --paths '/*'
        env:
          CF_ID: \${{ vars.CLOUDFRONT_DISTRIBUTION_ID }}`,
        },
      }),
      s("tasks", "Hands-on tasks", "tasks", {
        tasks: [
          "Create the IAM role in AWS with a trust policy allowing your repo's OIDC subject claim.",
          "Add a condition `StringEquals aws:RequestedRegion: us-east-1` to the role trust policy.",
          "Try running the workflow from a feature branch. It must fail — the role trust policy only allows main.",
          "Add required reviewers to the production environment. Watch the workflow pause for approval.",
        ],
      }),
      s("principle", "Principle", "principle", {
        body:
          "OIDC subject claim format: `repo:OWNER/REPO:ref:refs/heads/main`. This is what you scope the IAM trust policy to. Long-lived AWS credentials stored as GitHub secrets are a security liability — OIDC eliminates them.",
      }),
    ],
  },

  {
    num: 5,
    kind: "chapter",
    title: "Caching, Artifacts, and Performance",
    subtitle: "Make pipelines 3-5x faster with proper caching patterns",
    whyMatters:
      "A slow pipeline kills developer velocity. Dependency installs that take 3 minutes every run are a solved problem. You will implement caching patterns that make pipelines 3-5x faster.",
    miniProjectTitle: "Mini Project 5 — Fast Python Pipeline with Cache",
    miniProjectDesc:
      "Cut a 3-minute pip install to under 10 seconds on cache hit.",
    sections: [
      s("intro", "Why this matters", "intro", {
        body:
          "A slow pipeline kills developer velocity. Dependency installs that take 3 minutes every run are a solved problem. You will implement caching patterns that make pipelines 3-5x faster.",
      }),
      s("concepts", "Core concepts", "concepts", {
        concepts: [
          { name: "actions/cache", body: "Cache directories keyed by hash. Cache hit = skip the install. Miss = install and save." },
          { name: "Cache key", body: "Primary key must be exact match. `restore-keys:` provides fallback partial matches." },
          { name: "actions/upload-artifact", body: "Save build output between jobs or for download after the run." },
          { name: "actions/download-artifact", body: "Retrieve artifacts uploaded earlier in the workflow." },
          { name: "Cache scope", body: "Caches scoped to branch. PRs can read from base branch cache but not write to it." },
          { name: "Cache limits", body: "10 GB per repo. LRU eviction. Caches not accessed in 7 days are deleted automatically." },
          { name: "setup-* actions", body: "`actions/setup-python`, `setup-node`, `setup-go` all have built-in `cache:` input. Use it." },
          { name: "Save on failure", body: "`cache:` always saves even if subsequent steps fail — useful for test result caches." },
        ],
      }),
      s("yaml", "Mini Project 5 — Fast Python Pipeline (YAML)", "yaml", {
        body:
          "Built-in pip cache via `setup-python` + coverage artifact uploaded even on failure.",
        code: {
          lang: "yaml",
          source: `name: Fast CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: 'pip'                              # built-in pip cache
          cache-dependency-path: 'requirements*.txt'

      - name: Install dependencies
        run: pip install -r requirements.txt -r requirements-dev.txt

      - name: Run tests
        run: pytest --tb=short -q

      - name: Upload coverage report
        uses: actions/upload-artifact@v4
        if: always()                                # upload even if tests fail
        with:
          name: coverage-\${{ github.sha }}
          path: htmlcov/
          retention-days: 14`,
        },
      }),
      s("tasks", "Hands-on tasks", "tasks", {
        tasks: [
          "Run the pipeline twice. Compare the 'Install dependencies' step duration. First run: 60-90 s. Second: under 10 s.",
          "Change one line in `requirements.txt`. Watch the cache miss and full reinstall.",
          "Add a second job that downloads the coverage artifact and posts a summary comment on the PR.",
          "Measure total workflow time before and after caching. Document the saving as a specific number.",
        ],
      }),
      s("principle", "Principle", "principle", {
        body:
          "Cache key design: hash the lockfile, not the requirements file. `requirements.txt` can change without changing the install result. `pip freeze > lockfile && hash that` is the right primary key.",
      }),
    ],
  },

  {
    num: 6,
    kind: "chapter",
    title: "Reusable Workflows and Composite Actions",
    subtitle: "DRY pipelines — define once, call from many repos",
    whyMatters:
      "Copy-pasting YAML across repos is a maintenance nightmare. When your deploy process changes, you update one place. Reusable workflows and composite actions are how professional teams do DRY pipelines.",
    miniProjectTitle: "Mini Project 6 — Reusable Deploy Workflow",
    miniProjectDesc:
      "Extract your deploy logic into a reusable workflow. Call it from multiple repos.",
    sections: [
      s("intro", "Why this matters", "intro", {
        body:
          "Copy-pasting YAML across repos is a maintenance nightmare. When your deploy process changes, you update one place. Reusable workflows and composite actions are how professional teams do DRY pipelines.",
      }),
      s("concepts", "Core concepts", "concepts", {
        concepts: [
          { name: "Reusable workflow", body: "`workflow_call` trigger. Called from another workflow with `uses: org/repo/.github/workflows/file.yml@main`." },
          { name: "inputs / outputs", body: "Reusable workflows declare typed inputs and outputs — same as function signatures." },
          { name: "secrets: inherit", body: "Pass all caller secrets to the reusable workflow without listing them explicitly." },
          { name: "Composite action", body: "`action.yml` in any repo. Bundles multiple steps into one reusable action. No separate runner." },
          { name: "JavaScript action", body: "Runs directly on runner with Node.js. Fastest. Full access to `@actions/core` toolkit." },
          { name: "Docker action", body: "Runs in a container. Consistent environment. Slower due to container pull." },
          { name: "action.yml", body: "Metadata file defining action inputs, outputs, and `runs:` configuration." },
          { name: "Versioning", body: "Pin actions to SHA, not branch: `uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683`." },
        ],
      }),
      s("yaml", "Mini Project 6 — Reusable Deploy Workflow (YAML)", "yaml", {
        body:
          "One workflow in a shared repo, called by application repos with typed inputs and inherited secrets.",
        code: {
          lang: "yaml",
          source: `# .github/workflows/reusable-deploy.yml  (in shared repo)
name: Reusable Deploy

on:
  workflow_call:
    inputs:
      environment:
        required: true
        type: string
      image-tag:
        required: true
        type: string
    secrets:
      AWS_ROLE_ARN:
        required: true
    outputs:
      deployed-url:
        value: \${{ jobs.deploy.outputs.url }}

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: \${{ inputs.environment }}
    outputs:
      url: \${{ steps.deploy.outputs.url }}
    steps:
      - name: Deploy image
        id: deploy
        run: |
          URL=$(./scripts/deploy.sh \${{ inputs.image-tag }} \${{ inputs.environment }})
          echo "url=$URL" >> $GITHUB_OUTPUT

# In caller repo:
# jobs:
#   deploy-prod:
#     uses: myorg/shared/.github/workflows/reusable-deploy.yml@main
#     with:
#       environment: production
#       image-tag: \${{ needs.build.outputs.tag }}
#     secrets:
#       AWS_ROLE_ARN: \${{ secrets.AWS_ROLE_ARN }}`,
        },
      }),
      s("tasks", "Hands-on tasks", "tasks", {
        tasks: [
          "Create the reusable workflow in a shared repo. Call it from two different application repos.",
          "Add an input validation step: fail if `image-tag` is empty or doesn't match a semver pattern.",
          "Use the `deployed-url` output in the caller to post a deployment comment on the PR.",
          "Pin the caller to a specific SHA of the reusable workflow — never `@main` in production callers.",
        ],
      }),
      s("principle", "Principle", "principle", {
        body:
          "Reusable workflows run on their OWN runner — they are isolated. Composite actions run in the CALLER's runner — they share the filesystem and environment. Choose based on whether isolation matters.",
      }),
    ],
  },

  {
    num: 7,
    kind: "chapter",
    title: "Docker Build and Publish Pipelines",
    subtitle: "Multi-platform, layer caching, scanning, attestations, GHCR",
    whyMatters:
      "Building, tagging, scanning, and pushing Docker images is a core pipeline pattern. You will implement multi-platform builds, layer caching, vulnerability scanning, and GHCR publishing.",
    miniProjectTitle: "Mini Project 7 — Production Docker Pipeline",
    miniProjectDesc:
      "Build, scan, attest, and push a multi-platform image to GHCR with layer caching.",
    sections: [
      s("intro", "Why this matters", "intro", {
        body:
          "Building, tagging, scanning, and pushing Docker images is a core pipeline pattern. You will implement multi-platform builds, layer caching, vulnerability scanning, and GHCR publishing.",
      }),
      s("concepts", "Core concepts", "concepts", {
        concepts: [
          { name: "docker/build-push-action", body: "The standard action for building and pushing images. Supports multi-platform, cache, attestations." },
          { name: "docker/setup-buildx-action", body: "Required for advanced features: multi-platform, cache export, BuildKit." },
          { name: "GHCR", body: "GitHub Container Registry. `ghcr.io/owner/image`. Authenticated with `GITHUB_TOKEN` automatically." },
          { name: "Cache mounts", body: "`type=gha` exports BuildKit cache to GitHub Actions cache. Dramatically speeds rebuilds." },
          { name: "Multi-platform", body: "`platforms: linux/amd64,linux/arm64`. Build once, run on Apple Silicon and x86 servers." },
          { name: "Image scanning", body: "`trivy` or `grype` scan the built image for CVEs before pushing. Fail on HIGH/CRITICAL." },
          { name: "Attestations", body: "`actions/attest-build-provenance` signs the image with build provenance. Supply-chain security." },
          { name: "Tagging strategy", body: "Tag with: SHA (immutable), branch name (mutable), semver (releases), `latest` (dangerous)." },
        ],
      }),
      s("yaml", "Mini Project 7 — Production Docker Pipeline (YAML)", "yaml", {
        body:
          "Build → push (skipped on PRs) → scan → attest. Multi-platform, GHA layer cache, semver + SHA tags.",
        code: {
          lang: "yaml",
          source: `name: Docker Build & Push
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read
  packages: write
  id-token: write   # for attestations

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3

      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}

      - name: Docker metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/\${{ github.repository }}
          tags: |
            type=sha,prefix=sha-
            type=ref,event=branch
            type=semver,pattern={{version}}

      - name: Build and push
        id: build
        uses: docker/build-push-action@v6
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          push: \${{ github.event_name != 'pull_request' }}
          tags: \${{ steps.meta.outputs.tags }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Scan image for CVEs
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ghcr.io/\${{ github.repository }}:sha-\${{ github.sha }}
          exit-code: 1
          severity: HIGH,CRITICAL

      - name: Attest build provenance
        uses: actions/attest-build-provenance@v1
        if: github.event_name != 'pull_request'
        with:
          subject-name: ghcr.io/\${{ github.repository }}
          subject-digest: \${{ steps.build.outputs.digest }}`,
        },
      }),
      s("tasks", "Hands-on tasks", "tasks", {
        tasks: [
          "First run: note build time without cache. Second run: compare cache-hit time. Document the delta.",
          "Deliberately add a package with a known HIGH CVE to your Dockerfile. Watch Trivy fail the pipeline.",
          "On a PR, verify the image is built but NOT pushed (`push: false` on PR events).",
          "Create a GitHub release with a semver tag (`v1.0.0`). Watch the image get tagged with the version.",
        ],
      }),
      s("principle", "Principle", "principle", {
        body:
          "Never tag production images with `:latest` in pipelines. `latest` is mutable and tells you nothing about what version is deployed. Use SHA tags for immutability, semver tags for release tracking.",
      }),
    ],
  },

  {
    num: 8,
    kind: "chapter",
    title: "Full CI/CD — The Complete Pipeline",
    subtitle: "Lint → test → build → staging → smoke → prod approval → notify",
    whyMatters:
      "Individual pipeline components are only useful assembled into a complete CI/CD system. This chapter shows the full production pipeline: test, build, deploy to staging, smoke test, promote to production.",
    miniProjectTitle: "Mini Project 8 — Full Production CI/CD Pipeline",
    miniProjectDesc:
      "Complete pipeline: lint → test (matrix) → build Docker → deploy staging → smoke test → deploy prod (with approval) → notify.",
    sections: [
      s("intro", "Why this matters", "intro", {
        body:
          "Individual pipeline components are only useful assembled into a complete CI/CD system. This chapter shows the full production pipeline: test, build, deploy to staging, smoke test, promote to production.",
      }),
      s("concepts", "Core concepts", "concepts", {
        concepts: [
          { name: "Deployment environments", body: "Staging and production as separate GitHub Environments with protection rules and scoped secrets." },
          { name: "Required reviewers", body: "Production environment requires human approval before the deploy job starts." },
          { name: "Deployment status", body: "GitHub Deployments API tracks what is deployed where — visible on PRs and branches." },
          { name: "Smoke tests", body: "Post-deploy validation job: does the app actually respond? Is the health endpoint returning 200?" },
          { name: "Rollback job", body: "If smoke tests fail, trigger rollback automatically — re-deploy the previous image SHA." },
          { name: "workflow_run", body: "Trigger a workflow when another workflow completes — decouple CI from CD." },
          { name: "Status checks", body: "Required status checks on branch protection — PRs cannot merge unless CI passes." },
          { name: "Notification", body: "Post Slack/Teams message on deploy completion or failure using a secrets-stored webhook URL." },
        ],
      }),
      s("yaml", "Mini Project 8 — Full CI/CD (YAML)", "yaml", {
        body:
          "End-to-end: lint → matrix test → Docker build to GHCR → ECS staging deploy → curl-based smoke test → prod deploy with approval gate → Slack notify.",
        code: {
          lang: "yaml",
          source: `name: Full CI/CD
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read
  packages: write
  id-token: write
  deployments: write

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.12', cache: pip }
      - run: pip install ruff mypy && ruff check . && mypy src/

  test:
    needs: lint
    runs-on: ubuntu-latest
    strategy:
      matrix: { python: ['3.11','3.12'] }
      fail-fast: false
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '\${{ matrix.python }}', cache: pip }
      - run: pip install -r requirements.txt && pytest --cov=src --cov-fail-under=80

  build:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    outputs:
      image-tag: \${{ steps.meta.outputs.version }}
      digest:    \${{ steps.build.outputs.digest }}
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}
      - id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/\${{ github.repository }}
          tags: type=sha,prefix=
      - id: build
        uses: docker/build-push-action@v6
        with:
          push: true
          tags: \${{ steps.meta.outputs.tags }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: \${{ secrets.AWS_STAGING_ROLE }}
          aws-region: us-east-1
      - run: |
          aws ecs update-service --cluster staging \\
            --service myapp \\
            --force-new-deployment

  smoke-test:
    needs: deploy-staging
    runs-on: ubuntu-latest
    steps:
      - name: Wait for deployment
        run: sleep 30
      - name: Health check
        run: |
          STATUS=$(curl -s -o /dev/null -w '%{http_code}' https://staging.myapp.com/health)
          if [ "$STATUS" != "200" ]; then
            echo "Health check failed: $STATUS"
            exit 1
          fi

  deploy-prod:
    needs: smoke-test
    runs-on: ubuntu-latest
    environment: production   # requires reviewer approval
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: \${{ secrets.AWS_PROD_ROLE }}
          aws-region: us-east-1
      - run: |
          aws ecs update-service --cluster production \\
            --service myapp \\
            --force-new-deployment

  notify:
    needs: [deploy-prod]
    runs-on: ubuntu-latest
    if: always()
    steps:
      - name: Slack notification
        uses: slackapi/slack-github-action@v2
        with:
          webhook: \${{ secrets.SLACK_WEBHOOK_URL }}
          webhook-type: incoming-webhook
          payload: |
            {"text": "Deploy \${{ needs.deploy-prod.result }}: \${{ github.repository }}@\${{ github.sha }}"}`,
        },
      }),
      s("tasks", "Hands-on tasks", "tasks", {
        tasks: [
          "Merge a PR. Watch the entire chain: lint → test → build → staging → smoke → prod approval → prod deploy.",
          "Deliberately break the health-check endpoint. Watch `smoke-test` fail and `deploy-prod` never start.",
          "Reject the production approval. Verify the workflow stops and logs the manual rejection.",
          "Add a rollback job triggered if `smoke-test` fails: re-deploy the previously known-good image tag.",
        ],
      }),
      s("principle", "Principle", "principle", {
        body:
          "The production deploy job must always be gated by: (1) all tests passing, (2) staging smoke test passing, (3) human approval. Any pipeline that deploys to production without all three is not a production pipeline.",
      }),
    ],
  },

  // ─── CAPSTONE ─────────────────────────────────────────────────────────────
  {
    num: 9,
    kind: "capstone",
    title: "Capstone — Production-Grade CI/CD Platform",
    subtitle:
      "Combine everything into a real multi-repo CI/CD platform — your portfolio piece",
    sections: [
      s("intro", "Goal", "intro", {
        body:
          "Build a real multi-repo CI/CD platform that combines everything from chapters 1-8: shared actions, reusable workflows, OIDC, multi-platform Docker, layer caching, multi-environment deploys with approvals, observability, and (optionally) self-hosted runners. Treat this as your portfolio piece.",
      }),
      s("principle", "What 'done' means", "principle", {
        body:
          "A pipeline is not done when it works. It is done when it fails safely, deploys reliably, and any engineer on the team can debug it from the logs alone.",
      }),
    ],
    deliverables: [
      {
        title: "Shared Actions Repo",
        body:
          "Create `myorg/actions` with: composite actions for common setup steps, reusable workflows for deploy and notify, versioned with semver tags.",
      },
      {
        title: "Application Repo Pipeline",
        body:
          "Full CI/CD using the shared workflows: lint + type-check + test (matrix) + coverage gate + Docker build + GHCR push + ECS deploy to staging + smoke test + manual approval + prod deploy.",
      },
      {
        title: "Security Hardening",
        body:
          "OIDC for all AWS auth (zero stored credentials), `GITHUB_TOKEN` minimal permissions per job, Trivy image scanning with CVE gate, artifact attestations, Dependabot for action version updates.",
      },
      {
        title: "Performance Optimisation",
        body:
          "Dependency caching on all jobs, Docker layer caching via BuildKit + GHA cache, path filters so only relevant changes trigger CI, concurrency groups cancelling stale runs.",
      },
      {
        title: "Observability",
        body:
          "Workflow duration tracking, failure-rate dashboard using GitHub API + Grafana, Slack alerts for prod deploy start/success/failure, required status checks enforced on main branch.",
      },
      {
        title: "Self-Hosted Runner (bonus)",
        body:
          "Deploy an Actions Runner Controller on a k3s cluster. Route GPU- or memory-intensive jobs to self-hosted. Compare cost vs GitHub-hosted at scale.",
      },
      {
        title: "Deliverables Checklist",
        body:
          "README with architecture diagram showing the full pipeline flow; all secrets managed via OIDC (zero long-lived credentials); total CI time under 4 minutes from push to staging deploy; production deploy requires human approval every time; pipeline failure sends Slack alert within 60 seconds; documented fallback plan if GitHub Actions is unavailable.",
      },
    ],
  },
];

// ─── Getters ────────────────────────────────────────────────────────────────

export function getGhaChapter(num: number): GhaChapter | undefined {
  return GHA_CHAPTERS.find((c) => c.num === num);
}
