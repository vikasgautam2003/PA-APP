import type { AiePhase } from "@/types";

export const AIE_PHASES: AiePhase[] = [
  {
    num: 1,
    phaseLabel: "PHASE 0",
    kind: "phase",
    title: "Prerequisites & Dev Setup",
    subtitle:
      "Before writing a single line of AI code, lock in your environment and foundations.",
    miniProjectTitle: "Dev Environment Setup",
    miniProjectDesc: "Configure a complete AI dev environment from scratch:",
    miniProjectChecklist: [
      "Install pyenv + uv, create a Python 3.11 venv",
      "Set up VS Code with Ruff, Black, Pylance",
      "Create a GitHub repo with .gitignore + pre-commit hooks",
      "Write a docker-compose.yml: FastAPI + Redis + Postgres",
      "Add a GitHub Actions workflow that runs pytest on push",
    ],
    sections: [
      {
        id: "p0-os-terminal",
        label: "0.1 Operating System & Terminal",
        heading: "Linux / macOS Terminal Mastery",
        tone: "bullets",
        bullets: [
          "bash/zsh file ops pipes grep awk sed curl wget",
          "SSH tmux screen for remote GPU servers",
          "Environment variables .env files dotenv management",
          "Cron jobs for scheduled AI tasks",
        ],
        sources: [
          {
            label: "The Missing Semester of CS — MIT",
            url: "https://missing.csail.mit.edu",
          },
          {
            label: "Linux Command Line Book (free)",
            url: "https://linuxcommand.org/tlcl.php",
          },
        ],
      },
      {
        id: "p0-python-env",
        label: "0.2 Python Environment",
        heading: "Python Setup for AI Engineering",
        tone: "bullets",
        bullets: [
          "pyenv manage multiple Python versions (3.10, 3.11, 3.12)",
          "uv ultra-fast package manager (replaces pip + venv)",
          "poetry dependency management and packaging",
          "Jupyter / JupyterLab exploration and prototyping",
          "VS Code extensions Pylance, Ruff, Black formatter",
        ],
        sources: [
          { label: "uv docs", url: "https://docs.astral.sh/uv/" },
          {
            label: "Real Python — Virtual Environments",
            url: "https://realpython.com/python-virtual-environments-a-primer/",
          },
        ],
      },
      {
        id: "p0-git-version-control",
        label: "0.3 Git & Version Control",
        heading: "Git for AI Projects",
        tone: "bullets",
        bullets: [
          "Branching strategy for prompt versioning (feat/prompt-v2)",
          "Git LFS for model weights and large datasets",
          ".gitignore for API keys, .env, __pycache__, *.pyc",
          "Pre-commit hooks black, ruff, detect-secrets",
          "GitHub Actions CI for running evals on every PR",
        ],
        sources: [
          {
            label: "Pro Git Book (free)",
            url: "https://git-scm.com/book/en/v2",
          },
          {
            label: "GitHub Actions Docs",
            url: "https://docs.github.com/en/actions",
          },
        ],
      },
      {
        id: "p0-docker-basics",
        label: "0.4 Docker Basics",
        heading: "Containerisation Fundamentals",
        tone: "bullets",
        bullets: [
          "Dockerfile FROM, RUN, COPY, CMD, EXPOSE",
          "docker-compose for local multi-service dev (app + redis + postgres)",
          "Multi-stage builds to keep AI service images lean",
          ".dockerignore to exclude model caches and test data",
        ],
        sources: [
          {
            label: "Docker Official Getting Started",
            url: "https://docs.docker.com/get-started/",
          },
          {
            label: "Play with Docker (browser labs)",
            url: "https://labs.play-with-docker.com",
          },
        ],
      },
    ],
  },
  {
    num: 2,
    phaseLabel: "PHASE 1",
    kind: "phase",
    title: "Python & Software Engineering Foundations",
    subtitle:
      "AI engineering is software engineering first. These are the SWE skills that separate engineers from notebook hackers.",
    miniProjectTitle: "AI-Ready FastAPI Service",
    miniProjectDesc:
      "Build a production-ready FastAPI scaffold that every AI service will extend:",
    miniProjectChecklist: [
      "POST /chat endpoint — accepts messages[], returns StreamingResponse",
      "Pydantic models for request/response validation",
      "Redis middleware for request-level rate limiting (10 req/min per IP)",
      "pytest suite mocking OpenAI SDK — 100% pass without API key",
      "Dockerised: docker-compose up spins up app + redis",
    ],
    sections: [
      {
        id: "p1-python-deep-dive",
        label: "1.1 Python Deep Dive",
        heading: "Python Internals for AI Engineers",
        tone: "bullets",
        bullets: [
          "Type hints full typing module — TypeVar, Generic, Protocol, Literal",
          "Dataclasses and Pydantic v2 data validation for LLM inputs/outputs",
          "Async/await asyncio, aiohttp, httpx — critical for concurrent LLM calls",
          "Generators and iterators streaming token-by-token from LLM APIs",
          "Decorators retry logic, logging, auth wrappers",
          "Context managers resource cleanup (DB connections, file handles)",
          "functools lru_cache, partial, reduce for AI pipelines",
        ],
        sources: [
          {
            label: "Fluent Python 2nd Ed",
            url: "https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/",
          },
          {
            label: "Python Docs — asyncio",
            url: "https://docs.python.org/3/library/asyncio.html",
          },
          {
            label: "Pydantic v2 Docs",
            url: "https://docs.pydantic.dev/latest/",
          },
        ],
      },
      {
        id: "p1-fastapi",
        label: "1.2 FastAPI",
        heading: "FastAPI for AI Services",
        tone: "bullets",
        bullets: [
          "Path operations, request/response models with Pydantic",
          "Dependency injection shared DB connections, auth tokens",
          "Background tasks for async LLM processing",
          "StreamingResponse for token streaming to frontend",
          "WebSockets for real-time chat interfaces",
          "Middleware CORS, rate limiting, request logging",
          "OpenAPI auto-docs /docs and /redoc endpoints",
        ],
        sources: [
          {
            label: "FastAPI Official Docs",
            url: "https://fastapi.tiangolo.com",
          },
          {
            label: "FastAPI Tutorial — testdriven.io",
            url: "https://testdriven.io/blog/fastapi-tutorial/",
          },
        ],
      },
      {
        id: "p1-databases",
        label: "1.3 Databases",
        heading: "Databases for AI Systems",
        tone: "bullets",
        bullets: [
          "PostgreSQL pgvector extension for vector storage",
          "SQLAlchemy 2.0 async ORM for AI service persistence",
          "Redis caching LLM responses, session state, rate limit counters",
          "SQLite lightweight local storage for prototypes",
          "Migrations Alembic for schema versioning",
        ],
        sources: [
          {
            label: "SQLAlchemy 2.0 Docs",
            url: "https://docs.sqlalchemy.org/en/20/",
          },
          { label: "Redis Docs", url: "https://redis.io/docs/" },
        ],
      },
      {
        id: "p1-testing",
        label: "1.4 Testing",
        heading: "Testing AI Systems",
        tone: "bullets",
        bullets: [
          "pytest fixtures, parametrize, conftest.py",
          "pytest-asyncio async test support for AI endpoints",
          "httpx TestClient for FastAPI endpoint testing",
          "unittest.mock and pytest-mock mock LLM API calls in tests",
          "VCR.py / respx record and replay HTTP calls for deterministic tests",
          "Coverage.py aim for >80% on non-LLM code",
        ],
        sources: [
          { label: "pytest Docs", url: "https://docs.pytest.org/en/stable/" },
          {
            label: "Real Python — pytest",
            url: "https://realpython.com/pytest-python-testing/",
          },
        ],
      },
    ],
  },
  {
    num: 3,
    phaseLabel: "PHASE 2",
    kind: "phase",
    title: "LLM Fundamentals — How Models Actually Work",
    subtitle:
      "You don't need to implement a transformer from scratch, but you MUST understand how they work well enough to debug production issues.",
    miniProjectTitle: "Token Budget Calculator",
    miniProjectDesc:
      "Build a CLI tool that estimates cost BEFORE sending any LLM request:",
    miniProjectChecklist: [
      "Accept prompt text + model name as input",
      "Use tiktoken to count tokens accurately",
      "Look up input/output price per model from a config dict",
      "Estimate cost assuming 2x output tokens for output",
      "Add a --budget flag that aborts if estimated cost > threshold",
    ],
    sections: [
      {
        id: "p2-transformer-architecture",
        label: "2.1 Transformer Architecture",
        heading: "Attention Mechanism",
        tone: "bullets",
        bullets: [
          "Self-attention Q, K, V matrices — how tokens attend to each other",
          "Multi-head attention why multiple heads, what each head learns",
          "Scaled dot-product attention why divide by sqrt(d_k)",
          "Causal masking why decoder-only models can't see future tokens",
          "Flash Attention memory-efficient attention for long contexts",
          "Positional encoding sinusoidal (original) vs RoPE vs ALiBi",
          "Layer norm pre-norm vs post-norm placement and stability",
          "Feed-forward layers role in storing factual knowledge",
          "KV cache what it is, why it matters for inference speed",
        ],
        sources: [
          {
            label: "The Illustrated Transformer — Jay Alammar",
            url: "https://jalammar.github.io/illustrated-transformer/",
          },
          {
            label: "Attention Is All You Need (paper)",
            url: "https://arxiv.org/abs/1706.03762",
          },
          {
            label: "Karpathy — nanoGPT walkthrough (YouTube)",
            url: "https://youtube.com/watch?v=kCc8FmEb1nY",
          },
          {
            label: "3Blue1Brown — Transformers (YouTube)",
            url: "https://youtube.com/watch?v=wjZofJX0v4M",
          },
        ],
      },
      {
        id: "p2-tokenisation",
        label: "2.2 Tokenisation",
        heading: "Tokenisation Deep Dive",
        tone: "bullets",
        bullets: [
          "Byte-Pair Encoding (BPE) how vocab is built from character merges",
          "WordPiece (BERT), Unigram (T5), SentencePiece — differences",
          "tiktoken OpenAI's tokeniser — cl100k_base, o200k_base",
          "Token counting for cost estimation BEFORE sending requests",
          "Why 1 token ≈ 0.75 words in English, different for code/CJK",
          "Special tokens <|im_start|>, <|endoftext|>, BOS, EOS, PAD",
          "Tokenisation gotchas numbers, URLs, emojis, rare languages",
        ],
        sources: [
          {
            label: "tiktoken GitHub + examples",
            url: "https://github.com/openai/tiktoken",
          },
          {
            label: "Tokenizer Playground — Hugging Face",
            url: "https://huggingface.co/spaces/Xenova/the-tokenizer-playground",
          },
          {
            label: "BPE Algorithm Explained",
            url: "https://huggingface.co/learn/nlp-course/chapter6/5",
          },
        ],
      },
      {
        id: "p2-autoregressive-generation",
        label: "2.3 Autoregressive Generation",
        heading: "Sampling & Decoding Strategies",
        tone: "bullets",
        bullets: [
          "Greedy decoding always pick argmax — deterministic but repetitive",
          "Temperature >1 = more random, <1 = more focused, 0 = greedy",
          "Top-k sampling only consider k most probable tokens",
          "Top-p (nucleus) sampling dynamic cutoff by cumulative probability",
          "Min-p sampling newer approach, better coherence at high temp",
          "Repetition penalty / frequency penalty / presence penalty",
          "Beam search why it's rarely used in chat (expensive, not better)",
          "Logit bias force or suppress specific tokens",
          "Stop sequences halt generation on custom strings",
        ],
        sources: [
          {
            label: "HuggingFace — How to Generate",
            url: "https://huggingface.co/blog/how-to-generate",
          },
          {
            label: "OpenAI API Params Docs",
            url: "https://platform.openai.com/docs/api-reference/chat",
          },
        ],
      },
      {
        id: "p2-context-windows",
        label: "2.4 Context Windows",
        heading: "Context Window Engineering",
        tone: "bullets",
        bullets: [
          "What a context window is the model's 'working memory'",
          "Current limits GPT-4o 128K, Claude 3.5 200K, Gemini 1.5 1M",
          "Lost in the middle retrieval degrades for info in middle of context",
          "Context window ≠ effective context — attention dilutes with length",
          "Strategies sliding window, summarisation, RAG, hierarchical",
          "Cost input tokens are priced — long contexts are expensive",
        ],
        sources: [
          {
            label: "Lost in the Middle (paper)",
            url: "https://arxiv.org/abs/2307.03172",
          },
          {
            label: "Anthropic — Long Context Tips",
            url: "https://docs.anthropic.com/en/docs/build-with-claude/long-context-tips",
          },
        ],
      },
      {
        id: "p2-model-families",
        label: "2.5 Model Families — Production Differences",
        heading: "Model Families — Production Differences",
        tone: "table",
        table: {
          headers: ["Model", "Context", "Strengths", "Weaknesses", "Best For"],
          rows: [
            [
              "GPT-4o",
              "128K",
              "Tool use, vision, speed",
              "Cost",
              "Production default",
            ],
            [
              "Claude 3.5 Sonnet",
              "200K",
              "Coding, long context, safety",
              "Anthropic rate limits",
              "Code gen, long docs",
            ],
            [
              "Gemini 1.5 Pro",
              "1M",
              "Huge context, multimodal",
              "Consistency",
              "Video/doc analysis",
            ],
            [
              "Llama 3.1 70B",
              "128K",
              "Open source, self-host",
              "Needs GPU infra",
              "On-prem / fine-tune",
            ],
            [
              "Mistral Large",
              "32K",
              "Multilingual, efficient",
              "Smaller ecosystem",
              "EU data residency",
            ],
            [
              "GPT-4o-mini",
              "128K",
              "Cheap, fast",
              "Lower quality",
              "High-volume tasks",
            ],
          ],
        },
        sources: [
          {
            label: "Artificial Analysis — Model Benchmarks",
            url: "https://artificialanalysis.ai",
          },
          {
            label: "LMSYS Chatbot Arena Leaderboard",
            url: "https://chat.lmsys.org/?leaderboard",
          },
          {
            label: "OpenRouter Model Pricing",
            url: "https://openrouter.ai/models",
          },
        ],
      },
    ],
  },
  {
    num: 4,
    phaseLabel: "PHASE 3",
    kind: "phase",
    title: "Prompt Engineering (Production Level)",
    subtitle:
      "Prompting in production is not the same as prompting in ChatGPT. It's an engineering discipline with versioning, testing, and failure modes.",
    miniProjectTitle: "Prompt Version Manager",
    miniProjectDesc: "Build a mini prompt management system:",
    miniProjectChecklist: [
      "YAML file stores prompt versions with metadata (version, author, date, notes)",
      "load_prompt(name, version) function with fallback to 'latest'",
      "pytest suite each prompt version has 5 test cases with expected output format",
      "CLI python prompts.py test --prompt=chat_v2 runs eval suite",
      "Diff command shows what changed between two prompt versions",
    ],
    sections: [
      {
        id: "p3-prompting-techniques",
        label: "3.1 Prompting Techniques",
        heading: "Core Techniques with Production Context",
        tone: "bullets",
        bullets: [
          "Zero-shot works for well-scoped tasks with capable models",
          "Few-shot 3–10 examples dramatically improve consistency and format",
          "Chain-of-thought (CoT) 'Think step by step' — improves reasoning",
          "Zero-shot CoT just append 'Let's think step by step'",
          "Self-consistency generate N responses, vote on best answer",
          "Tree-of-thought (ToT) explore multiple reasoning branches",
          "ReAct interleave reasoning + tool use (foundation of agents)",
          "Least-to-most prompting decompose → solve parts → combine",
          "Generated Knowledge ask model to generate facts before answering",
          "Directional Stimulus Prompting give hints toward desired output",
        ],
        sources: [
          {
            label: "Prompt Engineering Guide — DAIR.AI",
            url: "https://promptingguide.ai",
          },
          {
            label: "OpenAI Prompt Engineering Guide",
            url: "https://platform.openai.com/docs/guides/prompt-engineering",
          },
          {
            label: "Anthropic Prompt Engineering",
            url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview",
          },
          {
            label: "Chain-of-Thought Paper",
            url: "https://arxiv.org/abs/2201.11903",
          },
        ],
      },
      {
        id: "p3-system-prompts",
        label: "3.2 System Prompts",
        heading: "Structuring System Prompts for Production",
        tone: "bullets",
        bullets: [
          "Role definition persona, expertise level, communication style",
          "Constraints and guardrails what NOT to do (equally important)",
          "Output format specification JSON schema, markdown, plain text",
          "Context injection dynamic values via f-strings or Jinja2 templates",
          "Instruction hierarchy user can't override system constraints",
          "Length control specify max response length explicitly",
          "Tone and register formal, casual, technical — be specific",
          "Fallback behaviour what to say when uncertain or out-of-scope",
        ],
        sources: [
          {
            label: "Anthropic System Prompt Examples",
            url: "https://docs.anthropic.com/en/docs/system-prompts",
          },
          {
            label: "LangChain Prompt Templates",
            url: "https://python.langchain.com/docs/modules/model_io/prompts/",
          },
        ],
      },
      {
        id: "p3-structured-output",
        label: "3.3 Structured Output",
        heading: "Getting Reliable JSON from LLMs",
        tone: "bullets",
        bullets: [
          "JSON mode OpenAI response_format={type: json_object}",
          "Structured outputs (OpenAI) pass full JSON schema, guaranteed valid",
          "Function calling / tool use model outputs structured tool invocations",
          "Pydantic + instructor library parse + validate LLM JSON automatically",
          "Retry on parse failure catch ValidationError, send error back to model",
          "Output schemas in system prompt as JSON schema string (fallback)",
        ],
        sources: [
          {
            label: "instructor library (Python)",
            url: "https://python.useinstructor.com",
          },
          {
            label: "OpenAI Structured Outputs",
            url: "https://platform.openai.com/docs/guides/structured-outputs",
          },
          {
            label: "Outlines library — constrained generation",
            url: "https://github.com/outlines-dev/outlines",
          },
        ],
      },
      {
        id: "p3-prompt-injection-security",
        label: "3.4 Prompt Injection & Security",
        heading: "Prompt Injection Attacks and Defences",
        tone: "bullets",
        bullets: [
          "Direct injection user manipulates system prompt via crafted input",
          "Indirect injection malicious content in documents retrieved by RAG",
          "Defences input sanitisation, privilege separation, output validators",
          "Instruction hierarchy distinguish system vs user vs tool content",
          "Canary tokens embed secret strings, alert if they appear in output",
          "Sandboxing never execute LLM output as code without validation",
        ],
        sources: [
          {
            label: "OWASP LLM Top 10",
            url: "https://owasp.org/www-project-top-10-for-large-language-model-applications/",
          },
          {
            label: "Prompt Injection Attacks — Simon Willison",
            url: "https://simonwillison.net/2022/Sep/12/prompt-injection/",
          },
        ],
      },
      {
        id: "p3-prompt-management",
        label: "3.5 Prompt Management",
        heading: "Prompt Versioning in Production",
        tone: "bullets",
        bullets: [
          "Store prompts in version control — never hardcode in app code",
          "Prompt registries LangSmith Hub, PromptLayer, custom DB table",
          "Semantic versioning for prompts v1.0.0, v1.1.0 with changelogs",
          "A/B testing prompts send 10% traffic to new prompt, compare evals",
          "Rollback ability to revert to previous prompt version in <5 minutes",
          "Environment-specific prompts dev/staging/prod variants",
        ],
        sources: [
          {
            label: "LangSmith Hub — Prompt Registry",
            url: "https://smith.langchain.com/hub",
          },
          { label: "PromptLayer", url: "https://promptlayer.com" },
        ],
      },
    ],
  },
  {
    num: 5,
    phaseLabel: "PHASE 4",
    kind: "phase",
    title: "LLM APIs, SDKs & Cost Engineering",
    subtitle:
      "The API layer is where most AI engineers spend their day. Master it deeply — retries, streaming, cost tracking, provider switching.",
    miniProjectTitle: "Multi-Provider LLM Client",
    miniProjectDesc:
      "Build a production-grade LLM client with full resilience and cost tracking:",
    miniProjectChecklist: [
      "LiteLLM wrapper one interface for OpenAI, Anthropic, Gemini",
      "Retry decorator 3 attempts with exponential backoff on rate limits",
      "Fallback chain primary → secondary → tertiary model",
      "Cost tracker logs tokens + cost to SQLite per call",
      "Budget enforcer raises BudgetExceededError if daily limit hit",
      "Async-native all calls use asyncio for concurrent requests",
    ],
    sections: [
      {
        id: "p4-provider-apis",
        label: "4.1 Provider APIs",
        heading: "Provider APIs",
        tone: "table",
        table: {
          headers: ["Feature", "OpenAI", "Anthropic", "Google (Gemini)"],
          rows: [
            ["Python SDK", "openai", "anthropic", "google-generativeai"],
            ["Streaming", "stream=True", "stream=True", "stream=True"],
            ["Function calling", "tools=[]", "tools=[]", "tools=[]"],
            ["System prompt", "role=system msg", "system= param", "system_instruction"],
            ["JSON mode", "response_format", "Not native", "response_mime_type"],
            [
              "Rate limits",
              "Per-minute tokens",
              "Per-minute tokens",
              "Per-minute requests",
            ],
            ["Batching", "Batch API (50% off)", "Not available", "Batch API"],
            [
              "Token counting",
              "tiktoken library",
              "count_tokens API",
              "count_tokens method",
            ],
          ],
        },
        sources: [
          {
            label: "OpenAI API Reference",
            url: "https://platform.openai.com/docs/api-reference",
          },
          {
            label: "Anthropic API Reference",
            url: "https://docs.anthropic.com/en/api",
          },
          {
            label: "Google AI Studio / Gemini API",
            url: "https://ai.google.dev/api",
          },
        ],
      },
      {
        id: "p4-streaming",
        label: "4.2 Streaming",
        heading: "Token Streaming — Why and How",
        tone: "bullets",
        bullets: [
          "Why stream perceived latency drops from 10s → instant for users",
          "Server-Sent Events (SSE) HTTP streaming, one-way, simple",
          "WebSockets bidirectional, needed for interrupt/cancel",
          "OpenAI for chunk in client.chat.completions.create(stream=True)",
          "Anthropic with client.messages.stream() as stream",
          "FastAPI StreamingResponse with async generator",
          "Frontend ReadableStream API, EventSource for SSE",
          "Buffering strategy stream tokens, flush every N or on whitespace",
        ],
        sources: [
          {
            label: "OpenAI Streaming Guide",
            url: "https://platform.openai.com/docs/api-reference/streaming",
          },
          {
            label: "FastAPI StreamingResponse",
            url: "https://fastapi.tiangolo.com/advanced/custom-response/#streamingresponse",
          },
        ],
      },
      {
        id: "p4-resilience-patterns",
        label: "4.3 Resilience Patterns",
        heading: "Retry, Fallback, Circuit Breaker",
        tone: "bullets",
        bullets: [
          "Exponential backoff with jitter prevents thundering herd on rate limits",
          "tenacity library @retry decorator with wait_exponential, stop_after_attempt",
          "Rate limit handling catch RateLimitError (429), back off, retry",
          "Timeout handling set request_timeout=30, catch ReadTimeoutError",
          "Fallback chains GPT-4o fails → GPT-4o-mini → Claude Haiku",
          "Circuit breaker pattern stop calling broken provider for 60s",
        ],
        sources: [
          { label: "tenacity library", url: "https://tenacity.readthedocs.io" },
          {
            label: "LiteLLM — provider-agnostic client",
            url: "https://docs.litellm.ai",
          },
        ],
      },
      {
        id: "p4-cost-engineering",
        label: "4.4 Cost Engineering",
        heading: "Token Cost Tracking and Optimisation",
        tone: "bullets",
        bullets: [
          "Log usage.prompt_tokens + usage.completion_tokens on every call",
          "Input vs output token price difference (output 2–4x more expensive)",
          "Cost per request = (input_tokens * input_price + output_tokens * output_price) / 1M",
          "Budget guardrails per-user, per-session, per-feature daily limits",
          "Prompt compression LLMLingua, selective context, summary injection",
          "Model tiering route simple tasks to mini models (10x cheaper)",
          "Caching semantic cache avoids re-calling LLM for similar queries",
          "Batching OpenAI Batch API for non-real-time workloads (50% discount)",
        ],
        sources: [
          {
            label: "LiteLLM Pricing Data",
            url: "https://docs.litellm.ai/docs/completion/token_usage",
          },
          { label: "OpenAI Pricing", url: "https://openai.com/pricing" },
          {
            label: "LLMLingua — Prompt Compression",
            url: "https://github.com/microsoft/LLMLingua",
          },
        ],
      },
      {
        id: "p4-model-pricing-reference",
        label: "4.5 Model Pricing Reference",
        heading: "Model Pricing Reference",
        tone: "table",
        table: {
          headers: ["Model", "Input ($/1M)", "Output ($/1M)", "Notes"],
          rows: [
            ["GPT-4o", "$2.50", "$10.00", "Production default"],
            ["GPT-4o-mini", "$0.15", "$0.60", "High-volume tasks"],
            ["Claude Sonnet 3.5", "$3.00", "$15.00", "Coding, long context"],
            ["Claude Haiku 3.5", "$0.80", "$4.00", "Fast, cheap"],
            ["Gemini 1.5 Flash", "$0.075", "$0.30", "Ultra cheap"],
            ["Llama 3.1 70B (Together)", "$0.88", "$0.88", "Open source"],
          ],
        },
      },
    ],
  },
  {
    num: 6,
    phaseLabel: "PHASE 5",
    kind: "phase",
    title: "RAG — Retrieval Augmented Generation",
    subtitle:
      "RAG is the #1 pattern for grounding LLMs in real data. Almost every production AI system uses it. Master every layer.",
    miniProjectTitle: "Production RAG System",
    miniProjectDesc:
      "Build a full RAG pipeline over a real document corpus (use Rocketlane docs or any PDF set):",
    miniProjectChecklist: [
      "Ingest pipeline load PDFs → recursive text split → embed with text-embedding-3-small",
      "Store in Qdrant (local Docker) with metadata: filename, page, chunk_index",
      "Hybrid search dense vector + BM25 with RRF merging",
      "Cohere Rerank rerank top-20 → top-3 before generation",
      "FastAPI endpoint POST /query returns answer + source citations",
      "Ragas evaluation faithfulness > 0.85 on 20 test questions",
    ],
    sections: [
      {
        id: "p5-why-rag-exists",
        label: "5.1 Why RAG Exists",
        heading: "The Knowledge Problem",
        tone: "bullets",
        bullets: [
          "Knowledge cutoff models don't know what happened after training",
          "Hallucination models confidently invent facts not in their training data",
          "Private data company docs, internal wikis can't be in public training data",
          "Fine-tuning alternative expensive, static, doesn't update in real-time",
          "RAG solution retrieve relevant context at query time, inject into prompt",
        ],
      },
      {
        id: "p5-full-rag-pipeline",
        label: "5.2 Full RAG Pipeline",
        heading: "Every Step in the RAG Pipeline",
        tone: "bullets",
        bullets: [
          "INGEST load documents (PDF, HTML, DOCX, CSV) → extract text",
          "CHUNK split text into overlapping chunks (e.g. 512 tokens, 10% overlap)",
          "EMBED convert each chunk to a dense vector via embedding model",
          "STORE insert vectors + metadata into vector database",
          "RETRIEVE embed query, similarity search → top-k chunks",
          "RERANK optional cross-encoder rerank of top-k to top-3",
          "AUGMENT inject retrieved chunks into prompt as context",
          "GENERATE LLM generates answer grounded in retrieved context",
        ],
        sources: [
          {
            label: "LangChain RAG Tutorial",
            url: "https://python.langchain.com/docs/tutorials/rag/",
          },
          {
            label: "LlamaIndex RAG Guide",
            url: "https://docs.llamaindex.ai/en/stable/understanding/rag/",
          },
          {
            label: "Pinecone Learn — RAG",
            url: "https://www.pinecone.io/learn/retrieval-augmented-generation/",
          },
          { label: "RAG Survey Paper", url: "https://arxiv.org/abs/2312.10997" },
        ],
      },
      {
        id: "p5-chunking-strategies",
        label: "5.3 Chunking Strategies",
        heading: "Chunking Strategies",
        tone: "table",
        table: {
          headers: ["Strategy", "How It Works", "Best For", "Pitfall"],
          rows: [
            [
              "Fixed-size",
              "Split by token/char count with overlap",
              "Simple docs, quick setup",
              "Cuts sentences mid-thought",
            ],
            [
              "Sentence",
              "Split on sentence boundaries (NLTK/spaCy)",
              "Prose, articles, reports",
              "Uneven chunk sizes",
            ],
            [
              "Recursive",
              "Try paragraph → sentence → word splits",
              "Mixed content",
              "Slower, more complex",
            ],
            [
              "Semantic",
              "Embed + cluster by topic similarity",
              "Dense technical docs",
              "Expensive at ingest time",
            ],
            [
              "Late chunking",
              "Embed full doc, then pool chunk embeddings",
              "Long structured docs",
              "Needs special models",
            ],
            [
              "Hierarchical",
              "Parent-child: retrieve child, send parent",
              "Books, long reports",
              "More complex retrieval",
            ],
          ],
        },
      },
      {
        id: "p5-embedding-models",
        label: "5.4 Embedding Models",
        heading: "Embedding Models",
        tone: "table",
        table: {
          headers: ["Model", "Dims", "Context", "Best For"],
          rows: [
            ["text-embedding-3-small", "1536", "8191", "Default OpenAI, balanced"],
            ["text-embedding-3-large", "3072", "8191", "High accuracy tasks"],
            ["Cohere embed-v3", "1024", "512", "Multilingual, semantic"],
            ["BGE-M3 (HuggingFace)", "1024", "8192", "Open source, self-host"],
            ["E5-large-v2", "1024", "512", "Strong benchmarks, free"],
            ["nomic-embed-text", "768", "8192", "Long context, open source"],
          ],
        },
        sources: [
          {
            label: "MTEB Leaderboard — Embedding Benchmarks",
            url: "https://huggingface.co/spaces/mteb/leaderboard",
          },
          {
            label: "OpenAI Embeddings Guide",
            url: "https://platform.openai.com/docs/guides/embeddings",
          },
          {
            label: "sentence-transformers library",
            url: "https://sbert.net",
          },
        ],
      },
      {
        id: "p5-vector-databases",
        label: "5.5 Vector Databases",
        heading: "Vector Databases",
        tone: "table",
        table: {
          headers: ["DB", "Hosting", "Filter", "Scale", "Best For"],
          rows: [
            ["Pinecone", "Managed cloud", "Metadata", "Billions", "Production, no-ops"],
            [
              "Qdrant",
              "Self-host / cloud",
              "Rich filters",
              "100M+",
              "Control, rich payloads",
            ],
            [
              "Weaviate",
              "Self-host / cloud",
              "GraphQL",
              "Billions",
              "Multi-modal, hybrid",
            ],
            ["pgvector", "Your Postgres", "Full SQL", "Millions", "Already have Postgres"],
            ["Chroma", "Local / cloud", "Basic", "Millions", "Prototyping, simple"],
            [
              "Milvus",
              "Self-host / cloud",
              "Advanced",
              "Billions",
              "High-scale, enterprise",
            ],
          ],
        },
        sources: [
          { label: "Qdrant Docs", url: "https://qdrant.tech/documentation/" },
          {
            label: "pgvector GitHub",
            url: "https://github.com/pgvector/pgvector",
          },
          { label: "Pinecone Docs", url: "https://docs.pinecone.io" },
          { label: "Chroma Docs", url: "https://docs.trychroma.com" },
        ],
      },
      {
        id: "p5-advanced-retrieval",
        label: "5.6 Advanced Retrieval",
        heading: "Hybrid Search + Reranking",
        tone: "bullets",
        bullets: [
          "Hybrid search dense (semantic) + sparse (BM25 keyword) retrieval",
          "Reciprocal Rank Fusion (RRF) merge rankings from both retrievers",
          "BM25 term-frequency based, great for exact keyword matches",
          "Reranking cross-encoder scores query-chunk pairs (much more accurate)",
          "Cohere Rerank hosted API, pass query + docs, returns ranked list",
          "FlashRank local reranker, no API needed",
          "HyDE generate hypothetical document, embed that for retrieval",
          "Multi-query generate 3 phrasings of query, union of results",
          "Self-RAG LLM decides when to retrieve, critiques its own output",
        ],
        sources: [
          {
            label: "Cohere Rerank Docs",
            url: "https://docs.cohere.com/docs/reranking",
          },
          { label: "HyDE Paper", url: "https://arxiv.org/abs/2212.10496" },
          {
            label: "Advanced RAG — LlamaIndex",
            url: "https://docs.llamaindex.ai/en/stable/optimizing/advanced_retrieval/",
          },
        ],
      },
      {
        id: "p5-rag-evaluation-ragas",
        label: "5.7 RAG Evaluation — Ragas",
        heading: "Measuring RAG Quality",
        tone: "bullets",
        bullets: [
          "Faithfulness is the answer supported by retrieved context? (no hallucination)",
          "Answer Relevancy does the answer address the question?",
          "Context Precision are retrieved chunks actually relevant?",
          "Context Recall did we retrieve all necessary info?",
          "Answer Correctness is the answer factually correct? (needs ground truth)",
          "Ragas framework compute all metrics automatically with LLM-as-judge",
        ],
        sources: [
          { label: "Ragas Docs + GitHub", url: "https://docs.ragas.io" },
          { label: "Ragas Paper", url: "https://arxiv.org/abs/2309.15217" },
        ],
      },
    ],
  },
  {
    num: 7,
    phaseLabel: "PHASE 6",
    kind: "phase",
    title: "Agentic AI Systems",
    subtitle:
      "Agents are LLMs that decide which tools to call, in which order, to complete a goal. This is where AI stops being a chatbot and starts being a coworker.",
    miniProjectTitle: "Research Agent with Tool Calling",
    miniProjectDesc:
      "Build an agent that researches a topic and produces a structured report:",
    miniProjectChecklist: [
      "Tools web_search, read_url, save_to_file, create_summary",
      "LangGraph workflow research_node → evaluate_node → write_node",
      "Human-in-loop pause after research, show findings, ask to continue",
      "Memory store past research sessions in Chroma, retrieve on similar topics",
      "Guardrails max 10 tool calls per run, timeout after 120s",
      "Output structured JSON report with sources, summary, confidence score",
    ],
    sections: [
      {
        id: "p6-what-is-an-agent",
        label: "6.1 What Is an Agent?",
        heading: "The Four Components of an Agent",
        tone: "bullets",
        bullets: [
          "LLM BRAIN decides what to do next based on goal + history",
          "TOOLS functions the LLM can call (search, code exec, APIs, DB queries)",
          "MEMORY short-term (context window) + long-term (vector store)",
          "LOOP observe → think → act → observe again until goal is reached",
        ],
        sources: [
          {
            label: "Anthropic — Building Effective Agents",
            url: "https://www.anthropic.com/research/building-effective-agents",
          },
          {
            label: "LangGraph Docs",
            url: "https://langchain-ai.github.io/langgraph/",
          },
          { label: "ReAct Paper", url: "https://arxiv.org/abs/2210.03629" },
        ],
      },
      {
        id: "p6-tool-calling",
        label: "6.2 Tool Calling / Function Calling",
        heading: "How Tool Calling Works at the API Level",
        tone: "bullets",
        bullets: [
          "Define tools as JSON schemas name, description, parameters",
          "Model returns tool_calls [{name, arguments}] instead of text",
          "Your code executes the function, returns result as tool message",
          "Model sees result, decides call another tool or generate final answer",
          "Parallel tool calls model can call multiple tools simultaneously",
          "Tool choice auto (model decides), required (must call a tool), specific tool",
          "Error handling return error message in tool result, let model retry",
        ],
        sources: [
          {
            label: "OpenAI Function Calling",
            url: "https://platform.openai.com/docs/guides/function-calling",
          },
          {
            label: "Anthropic Tool Use",
            url: "https://docs.anthropic.com/en/docs/build-with-claude/tool-use",
          },
          {
            label: "Pydantic AI — type-safe agents",
            url: "https://ai.pydantic.dev",
          },
        ],
      },
      {
        id: "p6-agent-frameworks",
        label: "6.3 Agent Frameworks",
        heading: "LangGraph — Stateful Agent Workflows",
        tone: "bullets",
        bullets: [
          "Graph nodes Python functions (LLM calls, tool executions, routers)",
          "Graph edges conditional routing based on node output",
          "State TypedDict passed through all nodes, persists across steps",
          "Checkpointing save state to DB for pause/resume and human-in-loop",
          "Subgraphs nested agent workflows for modularity",
          "Streaming stream individual node outputs to frontend",
          "Persistence PostgresSaver / SqliteSaver for long-running workflows",
          "CrewAI — Role-Based Multi-Agent",
          "Agents each has a role, goal, backstory, and tools",
          "Tasks specific objectives assigned to agents",
          "Crews group of agents that collaborate on a workflow",
          "Process sequential (one agent → next) or hierarchical (manager orchestrates)",
          "When to use CrewAI vs LangGraph CrewAI for role-based collaboration, LangGraph for complex state machines",
        ],
        sources: [
          {
            label: "LangGraph Full Tutorial",
            url: "https://langchain-ai.github.io/langgraph/tutorials/introduction/",
          },
          {
            label: "LangGraph Academy (free)",
            url: "https://academy.langchain.com/courses/intro-to-langgraph",
          },
          { label: "CrewAI Docs", url: "https://docs.crewai.com" },
          {
            label: "CrewAI GitHub",
            url: "https://github.com/crewAIInc/crewAI",
          },
        ],
      },
      {
        id: "p6-mcp",
        label: "6.4 MCP — Model Context Protocol",
        heading: "What MCP Is and When to Use It",
        tone: "bullets",
        bullets: [
          "MCP open protocol for connecting LLMs to external data/tools",
          "Architecture host (Claude/GPT) ↔ MCP server (your tool provider)",
          "Transport stdio (local) or SSE (remote) connections",
          "Resources data sources the LLM can read (files, DB records)",
          "Tools functions the LLM can call via MCP",
          "Prompts reusable prompt templates exposed via MCP",
          "Use MCP when building tool ecosystems, IDE integrations, multi-app tooling",
          "Don't use MCP when simple single-app tool calling is enough",
        ],
        sources: [
          { label: "MCP Official Docs", url: "https://modelcontextprotocol.io" },
          {
            label: "MCP Python SDK",
            url: "https://github.com/modelcontextprotocol/python-sdk",
          },
          {
            label: "Anthropic MCP Blog",
            url: "https://www.anthropic.com/news/model-context-protocol",
          },
        ],
      },
      {
        id: "p6-agent-memory",
        label: "6.5 Agent Memory",
        heading: "Four Types of Agent Memory",
        tone: "bullets",
        bullets: [
          "In-context (working) messages in the context window — short-term, expensive",
          "External semantic vector store of past interactions — searchable long-term",
          "Episodic chronological log of past sessions — 'what did I do last Tuesday'",
          "Procedural stored instructions/rules — 'always format output as JSON'",
          "MemGPT / mem0 frameworks for automatic memory management",
          "Conversation summarisation compress old messages to save context tokens",
        ],
        sources: [
          {
            label: "mem0 — Memory Layer for AI",
            url: "https://docs.mem0.ai",
          },
          { label: "MemGPT Paper", url: "https://arxiv.org/abs/2310.08560" },
          {
            label: "LangGraph Memory",
            url: "https://langchain-ai.github.io/langgraph/concepts/memory/",
          },
        ],
      },
      {
        id: "p6-agent-failure-modes",
        label: "6.6 Agent Failure Modes",
        heading: "What Goes Wrong with Agents",
        tone: "bullets",
        bullets: [
          "Infinite loops agent keeps calling tools without reaching goal",
          "Hallucinated tool calls invents tools or arguments that don't exist",
          "Context overflow conversation grows until hitting context limit",
          "Tool chaining errors wrong output format propagates through tool chain",
          "Goal misalignment agent optimises for wrong subgoal",
          "Defences max_iterations limit, output validators, human-in-loop checkpoints",
          "ALWAYS set a max_iterations or max_steps limit. An unbounded agent can run for hours and cost hundreds of dollars.",
        ],
      },
      {
        id: "p6-human-in-the-loop",
        label: "6.7 Human-in-the-Loop",
        heading: "When and How to Interrupt Agents",
        tone: "bullets",
        bullets: [
          "Interrupt before approve high-stakes tool calls (send email, delete data)",
          "Interrupt after review agent output before proceeding",
          "LangGraph interrupt() pause execution, serialize state, wait for human",
          "Approval patterns UI approval button, Slack message, email confirmation",
          "Time-boxed auto-approve after N minutes if no human response",
        ],
      },
    ],
  },
  {
    num: 8,
    phaseLabel: "PHASE 7",
    kind: "phase",
    title: "Evals — The Non-Negotiable Chapter",
    subtitle:
      "You cannot deploy an AI system without evals. Without them, you are flying blind. This chapter is as important as RAG.",
    miniProjectTitle: "Full Eval Suite for a Chat System",
    miniProjectDesc:
      "Build a complete evaluation framework for any LLM application:",
    miniProjectChecklist: [
      "Golden dataset 50 Q&A pairs with expected format and content",
      "Unit evals JSON schema validation, response length, no PII in output",
      "LLM-as-judge GPT-4o-mini scores helpfulness (1-5) + reasoning",
      "Ragas metrics faithfulness + answer relevancy for RAG outputs",
      "GitHub Action run evals on every push, post score summary as PR comment",
      "Dashboard CSV log of all eval runs, plotted with matplotlib",
    ],
    sections: [
      {
        id: "p7-types-of-evals",
        label: "7.1 Types of Evals",
        heading: "Types of Evals",
        tone: "table",
        table: {
          headers: ["Eval Type", "How It Works", "When to Use", "Cost"],
          rows: [
            [
              "Unit Evals",
              "Deterministic: exact match, regex, JSON schema",
              "Output format, refusals, routing",
              "Zero API cost",
            ],
            [
              "Model-Graded",
              "LLM judges quality on a rubric (1-5 scale)",
              "Quality, coherence, relevance",
              "Low (cheap model)",
            ],
            [
              "Human Evals",
              "Humans rate or rank model outputs",
              "High-stakes decisions, calibration",
              "Highest",
            ],
            [
              "A/B Evals",
              "Send traffic to two prompts, compare metrics",
              "Prompt upgrades in production",
              "Medium",
            ],
            [
              "Regression Evals",
              "Run golden set on every code/prompt change",
              "CI/CD gates before deployment",
              "Low",
            ],
          ],
        },
      },
      {
        id: "p7-llm-as-judge",
        label: "7.2 LLM-as-Judge",
        heading: "Using an LLM to Grade LLM Outputs",
        tone: "bullets",
        bullets: [
          "System prompt assign role (expert evaluator), criteria (faithfulness, quality)",
          "Scoring ask for score 1–5 + reasoning before score (CoT for calibration)",
          "Calibration compare LLM judge scores to human scores on 100 examples",
          "Bias mitigation randomise position of candidates (position bias), use swaps",
          "Reference-based provide ground truth answer, ask if output matches",
          "Reference-free ask if output is good standalone without ground truth",
          "Judge model use a strong model (GPT-4o) to judge weaker model outputs",
        ],
        sources: [
          {
            label: "MT-Bench + LLM Judge Paper",
            url: "https://arxiv.org/abs/2306.05685",
          },
          {
            label: "Braintrust Eval Framework",
            url: "https://www.braintrust.dev",
          },
          {
            label: "LangSmith Evals",
            url: "https://docs.smith.langchain.com/evaluation",
          },
          {
            label: "PromptFoo — Open Source Evals",
            url: "https://www.promptfoo.dev",
          },
          { label: "Ragas — RAG Evals", url: "https://docs.ragas.io" },
        ],
      },
      {
        id: "p7-building-eval-datasets",
        label: "7.3 Building Eval Datasets",
        heading: "What Goes in an Eval Set",
        tone: "bullets",
        bullets: [
          "Golden set manually verified input → expected output pairs (start with 50)",
          "Adversarial set edge cases, inputs designed to break the prompt",
          "Regression set cases that previously failed and were fixed",
          "Distribution set representative sample of real production queries",
          "Synthetic generation use LLM to generate diverse test cases, then verify",
          "Quality 50 excellent examples > 500 mediocre ones",
        ],
      },
      {
        id: "p7-eval-driven-development",
        label: "7.4 Eval-Driven Development",
        heading: "Writing Evals Before Changing Prompts",
        tone: "bullets",
        bullets: [
          "Write failing eval first (the thing you want to improve)",
          "Change prompt, run evals, verify the failing case now passes",
          "Ensure no regressions on the rest of the golden set",
          "CI gate GitHub Action runs eval suite on every PR, fails if score drops",
          "Metrics to track pass rate, average score, latency p50/p99, cost/query",
          "Dashboard plot metrics over time to see prompt quality trends",
          "Eval-driven development is to AI what TDD is to software. Write the eval first, then write the prompt.",
        ],
      },
    ],
  },
  {
    num: 9,
    phaseLabel: "PHASE 8",
    kind: "phase",
    title: "Fine-Tuning",
    subtitle:
      "Fine-tuning is not the first tool to reach for. Understand when it's the right choice and how to do it correctly when it is.",
    miniProjectTitle: "Fine-Tune Llama 3.1 8B on Custom Data",
    miniProjectDesc: "Fine-tune an open source model for a specific task:",
    miniProjectChecklist: [
      "Generate 500 training examples using GPT-4o (your task: Rocketlane API Q&A)",
      "Format as chat completions JSON, validate schema on every row",
      "QLoRA fine-tune using Unsloth on Google Colab A100 (free)",
      "Eval compare fine-tuned vs base model on 50 held-out examples",
      "LLM-as-judge GPT-4o scores both, fine-tuned must win by >10 points",
      "Serve via Ollama locally or Together AI inference endpoint",
    ],
    sections: [
      {
        id: "p8-decision-framework",
        label: "8.1 Decision Framework",
        heading: "Decision Framework",
        tone: "table",
        table: {
          headers: ["Problem", "Best Solution", "Why"],
          rows: [
            ["Model doesn't know recent facts", "RAG", "Dynamic, no retraining"],
            [
              "Inconsistent output format",
              "Structured outputs + prompting",
              "Faster, cheaper",
            ],
            ["Need specific writing style", "Few-shot prompting first", "Try this first"],
            ["Style prompting not enough", "Fine-tune on style examples", "Baked in"],
            [
              "Domain-specific task (med, legal)",
              "Fine-tune on domain data",
              "Systematic improvement",
            ],
            [
              "Reduce prompt length (cost)",
              "Fine-tune + shorter system prompt",
              "Valid use case",
            ],
            ["Need specific knowledge", "RAG first, FT if RAG fails", "RAG is more flexible"],
          ],
        },
      },
      {
        id: "p8-supervised-fine-tuning",
        label: "8.2 Supervised Fine-Tuning (SFT)",
        heading: "SFT Concepts Every AI Engineer Needs",
        tone: "bullets",
        bullets: [
          "Data format {messages: [{role, content}]} — chat completions format",
          "Training loop forward pass → loss (cross entropy on output tokens) → backprop → update",
          "Overfitting model memorises training data — validate with held-out set",
          "Epochs 3–5 typically sufficient, more = overfitting risk",
          "Learning rate 1e-5 to 1e-4 for fine-tuning (lower than pretraining)",
          "Evaluation compare fine-tuned vs base model on your eval set",
        ],
        sources: [
          {
            label: "OpenAI Fine-Tuning Guide",
            url: "https://platform.openai.com/docs/guides/fine-tuning",
          },
          {
            label: "HuggingFace SFT Tutorial",
            url: "https://huggingface.co/docs/trl/en/sft_trainer",
          },
          {
            label: "Together AI Fine-Tuning",
            url: "https://docs.together.ai/docs/fine-tuning",
          },
        ],
      },
      {
        id: "p8-lora-qlora",
        label: "8.3 LoRA & QLoRA",
        heading: "Parameter-Efficient Fine-Tuning",
        tone: "bullets",
        bullets: [
          "LoRA train low-rank adapter matrices (rank 8-64) instead of full weights",
          "Parameter count LoRA adds ~0.1% of original model parameters",
          "Why it works most weight updates lie in low-dimensional subspaces",
          "QLoRA quantise base model to 4-bit, train LoRA adapters on top",
          "Memory QLoRA fine-tunes a 70B model on a single 48GB GPU",
          "PEFT library HuggingFace's Parameter-Efficient Fine-Tuning toolkit",
          "Merging merge adapter weights into base model for inference",
          "Rank selection higher rank = more capacity but more params (start with r=16)",
        ],
        sources: [
          { label: "LoRA Paper", url: "https://arxiv.org/abs/2106.09685" },
          { label: "QLoRA Paper", url: "https://arxiv.org/abs/2305.14314" },
          {
            label: "PEFT Library Docs",
            url: "https://huggingface.co/docs/peft",
          },
          {
            label: "Axolotl — Fine-tuning framework",
            url: "https://github.com/axolotl-ai-cloud/axolotl",
          },
          {
            label: "Unsloth — Fast fine-tuning",
            url: "https://github.com/unslothai/unsloth",
          },
        ],
      },
      {
        id: "p8-dataset-preparation",
        label: "8.4 Dataset Preparation",
        heading: "Data Quality is Everything",
        tone: "bullets",
        bullets: [
          "Quality over quantity 1,000 perfect examples > 100,000 mediocre ones",
          "Deduplication remove near-duplicate examples (use MinHash LSH)",
          "Format consistency every example in exact same JSON structure",
          "Balance don't over-represent one type of response",
          "Validation split 10-20% held out for evaluation during training",
          "Data generation use GPT-4 to generate training examples (distillation)",
          "Filtering remove examples where output is wrong or low quality",
        ],
      },
      {
        id: "p8-catastrophic-forgetting",
        label: "8.5 Catastrophic Forgetting",
        heading: "What It Is and How to Mitigate",
        tone: "bullets",
        bullets: [
          "Definition model forgets general capabilities while learning task-specific ones",
          "Example after fine-tuning on medical Q&A, model can't write code anymore",
          "Mitigation 1 mix general data with task-specific data (10-20% general)",
          "Mitigation 2 LoRA — adapters don't touch base weights, preserves general knowledge",
          "Mitigation 3 lower learning rate to reduce magnitude of weight updates",
          "Detection eval on general benchmarks (MMLU) before and after fine-tuning",
          "Always eval on BOTH your task AND general benchmarks after fine-tuning. A specialist that can't do anything else is often worse than the base model with good prompting.",
        ],
      },
    ],
  },
  {
    num: 10,
    phaseLabel: "PHASE 9",
    kind: "phase",
    title: "AI System Architecture & System Design",
    subtitle:
      "This is the chapter that makes you an engineer, not just an API caller. AI system design interviews will test everything here.",
    miniProjectTitle: "Design + Build a ChatGPT Clone",
    miniProjectDesc:
      "Full-stack AI chat application with production architecture:",
    miniProjectChecklist: [
      "FastAPI backend stateful sessions stored in Postgres",
      "Redis session cache + rate limiting (100 messages/user/day)",
      "Celery worker handles long-running document analysis tasks",
      "SSE streaming tokens stream to React frontend in real-time",
      "Model router simple questions → GPT-4o-mini, complex → GPT-4o",
      "Semantic cache GPTCache reduces API calls by 30%+ on test queries",
      "Docker-compose all services in one command",
    ],
    sections: [
      {
        id: "p9-core-architecture-patterns",
        label: "9.1 Core Architecture Patterns",
        heading: "Stateless vs Stateful AI Services",
        tone: "bullets",
        bullets: [
          "Stateless no server-side session — client sends full history every request",
          "Stateful server maintains conversation state (DB or cache backed)",
          "Stateless pros simple, horizontally scalable, no sticky sessions",
          "Stateful pros server can truncate/summarise, user can resume sessions",
          "Hybrid stateless service + external state store (Redis or Postgres)",
          "Session ID pattern client sends session_id, server fetches history from DB",
        ],
      },
      {
        id: "p9-async-inference-patterns",
        label: "9.2 Async Inference Patterns",
        heading: "Task Queues for Long LLM Jobs",
        tone: "bullets",
        bullets: [
          "Problem LLM calls take 10–60s — synchronous HTTP times out",
          "Solution accept request → enqueue task → return job_id immediately",
          "Client polls GET /jobs/{id} or subscribes to webhook",
          "Celery + Redis Python task queue, 10 lines of code",
          "BullMQ (Node.js alternative), Inngest (managed), Temporal (enterprise)",
          "Retry on failure Celery automatically retries failed tasks",
          "Dead letter queue tasks that fail 3x go here for inspection",
        ],
        sources: [
          { label: "Celery Docs", url: "https://docs.celeryq.dev" },
          {
            label: "Temporal Workflow Engine",
            url: "https://temporal.io/docs",
          },
          {
            label: "System Design — Async Processing",
            url: "https://bytebytego.com",
          },
        ],
      },
      {
        id: "p9-streaming-architecture",
        label: "9.3 Streaming Architecture",
        heading: "Getting Tokens to the UI in Real-Time",
        tone: "bullets",
        bullets: [
          "SSE (Server-Sent Events) simple HTTP, one-way, browser native EventSource",
          "WebSockets bidirectional — needed for mid-stream cancellation",
          "FastAPI + StreamingResponse async generator yields token by token",
          "Nginx config for SSE disable buffering (proxy_buffering off)",
          "Frontend ReadableStream, getReader(), pump tokens into UI",
          "Backpressure slow UI client — server buffers N tokens then drops",
          "Queue-based streaming LLM → Redis queue → SSE endpoint → client",
        ],
      },
      {
        id: "p9-caching-strategies",
        label: "9.4 Caching Strategies",
        heading: "Caching Strategies",
        tone: "table",
        table: {
          headers: ["Cache Type", "What It Caches", "Hit Rate", "Use When"],
          rows: [
            [
              "Exact cache",
              "Identical prompts → same response",
              "Low (5–15%)",
              "Repeated FAQ queries",
            ],
            [
              "Semantic cache",
              "Similar prompts via vector similarity",
              "Medium (20–40%)",
              "Paraphrased same questions",
            ],
            [
              "Prompt prefix cache",
              "Shared system prompt prefix",
              "High (60–80%)",
              "Long system prompts",
            ],
            [
              "Response cache",
              "Full LLM response by hash",
              "Low",
              "Idempotent, deterministic queries",
            ],
          ],
        },
        sources: [
          {
            label: "GPTCache — Semantic Caching",
            url: "https://github.com/zilliztech/GPTCache",
          },
          {
            label: "Anthropic Prompt Caching",
            url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching",
          },
          {
            label: "Redis Caching Patterns",
            url: "https://redis.io/docs/manual/patterns/",
          },
        ],
      },
      {
        id: "p9-multi-model-routing",
        label: "9.5 Multi-Model Routing",
        heading: "Route Queries to the Right Model",
        tone: "bullets",
        bullets: [
          "Intent classifier cheap model classifies query complexity (simple/medium/hard)",
          "Simple → GPT-4o-mini, Medium → GPT-4o, Hard → GPT-4o + reasoning",
          "Rule-based routing keyword triggers, prompt length, user tier",
          "Cost savings 70% of queries often qualify for cheap model",
          "LiteLLM Router built-in routing with load balancing and fallbacks",
          "A/B routing 5% to new model, compare quality metrics",
        ],
      },
      {
        id: "p9-context-management",
        label: "9.6 Context Management",
        heading: "Managing Conversation History at Scale",
        tone: "bullets",
        bullets: [
          "Sliding window keep last N messages, drop oldest",
          "Token-budget truncation keep messages until token limit, then truncate from old end",
          "Summarisation compress old messages into a summary, inject at top",
          "Importance-based keep system + last 3 + most relevant past messages",
          "LangGraph managed conversation history with automatic truncation",
          "Cost implication every extra token in history costs money per request",
        ],
      },
      {
        id: "p9-system-design-interview-patterns",
        label: "9.7 System Design Interview Patterns",
        heading: "How to Answer 'Design a ChatGPT Clone'",
        tone: "bullets",
        bullets: [
          "Step 1 clarify requirements — users, messages/sec, latency targets",
          "Step 2 high-level components — API Gateway → App Server → LLM Provider → DB",
          "Step 3 data model — users, sessions, messages tables",
          "Step 4 streaming — SSE pipeline from LLM to client",
          "Step 5 scale — load balancer, horizontal app servers, Redis for sessions",
          "Step 6 reliability — retry logic, fallback providers, circuit breakers",
          "Step 7 cost — caching, model tiering, rate limiting per user",
          "Step 8 observability — logging, tracing, cost dashboards",
        ],
        sources: [
          {
            label: "ByteByteGo System Design",
            url: "https://bytebytego.com",
          },
          {
            label: "Designing ML Systems (book)",
            url: "https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/",
          },
          {
            label: "System Design Interview (book)",
            url: "https://www.amazon.com/System-Design-Interview-insiders-Second/dp/B08CMF2CQF",
          },
          { label: "MLOps Community", url: "https://mlops.community" },
        ],
      },
    ],
  },
  {
    num: 11,
    phaseLabel: "PHASE 10",
    kind: "phase",
    title: "Observability, Security & Safety",
    subtitle:
      "You can't improve what you can't measure. And you can't ship what isn't secure. These are not optional in production.",
    miniProjectTitle: "Security Hardening Layer",
    miniProjectDesc:
      "Add a full security and observability layer to your chat service:",
    miniProjectChecklist: [
      "Presidio middleware redact PII from all inputs before sending to LLM",
      "Prompt injection detector flag and block injection attempts",
      "Langfuse integration trace every LLM call with full metadata",
      "Cost alert Slack webhook fires if hourly cost > $5",
      "Output validator Guardrails AI blocks toxic or off-topic responses",
      "OWASP audit document which defences map to which LLM Top 10 items",
    ],
    sections: [
      {
        id: "p10-logging-schema",
        label: "10.1 What to Log on Every LLM Call",
        heading: "Minimum Required Logging Schema",
        tone: "bullets",
        bullets: [
          "request_id UUID for tracing across services",
          "user_id + session_id for per-user cost and usage analytics",
          "model which model was actually called (may differ from requested)",
          "input_tokens + output_tokens for cost calculation",
          "cost_usd calculated at log time, not retrieved from API",
          "latency_ms total wall clock time for the LLM call",
          "prompt_version which prompt template was used",
          "success / error_type for error rate dashboards",
          "feature_flag which experiment variant this call belongs to",
        ],
        sources: [
          {
            label: "Langfuse — Open Source LLM Observability",
            url: "https://langfuse.com/docs",
          },
          {
            label: "LangSmith Tracing",
            url: "https://docs.smith.langchain.com/observability",
          },
          {
            label: "Helicone — LLM Observability",
            url: "https://docs.helicone.ai",
          },
          {
            label: "OpenLLMetry — OpenTelemetry for LLMs",
            url: "https://github.com/traceloop/openllmetry",
          },
        ],
      },
      {
        id: "p10-guardrails",
        label: "10.2 Guardrails",
        heading: "Input and Output Validation",
        tone: "bullets",
        bullets: [
          "Guardrails AI define validators, run on input and/or output",
          "Input guards PII detection, prompt injection detection, topic filter",
          "Output guards JSON schema validation, toxicity, factual consistency",
          "NeMo Guardrails Colang language for dialog flows and safety rails",
          "Custom validators regex patterns, classifier models, semantic similarity",
          "Fail-open vs fail-closed fail-open returns degraded response, fail-closed blocks",
          "Latency cost guards add 50–200ms — parallelise where possible",
        ],
        sources: [
          {
            label: "Guardrails AI Docs",
            url: "https://docs.guardrailsai.com",
          },
          {
            label: "NeMo Guardrails GitHub",
            url: "https://github.com/NVIDIA/NeMo-Guardrails",
          },
          {
            label: "Rebuff — Prompt Injection Detection",
            url: "https://github.com/protectai/rebuff",
          },
        ],
      },
      {
        id: "p10-pii-detection-redaction",
        label: "10.3 PII Detection & Redaction",
        heading: "Protecting User Data Sent to External LLMs",
        tone: "bullets",
        bullets: [
          "Detect names, emails, phone numbers, SSNs, credit cards, addresses",
          "Microsoft Presidio open source PII detection + anonymisation",
          "spaCy NER detect PII entities with NLP models",
          "Redaction replace PII with [REDACTED] or placeholder tokens",
          "Fake substitution replace 'John Smith' with 'Alex Johnson' (reversible)",
          "Data residency check provider ToS for data retention policies",
          "Anthropic no training on API data by default",
          "Azure OpenAI data stays in your Azure region",
        ],
        sources: [
          {
            label: "Microsoft Presidio",
            url: "https://microsoft.github.io/presidio/",
          },
          {
            label: "Anthropic Data Privacy",
            url: "https://privacy.anthropic.com",
          },
          {
            label: "OpenAI Data Controls",
            url: "https://openai.com/policies/api-data-usage-policies",
          },
        ],
      },
      {
        id: "p10-owasp-llm-top-10",
        label: "10.4 OWASP LLM Top 10 (2025)",
        heading: "OWASP LLM Top 10 (2025)",
        tone: "table",
        table: {
          headers: ["#", "Vulnerability", "Key Defence"],
          rows: [
            ["LLM01", "Prompt Injection", "Input sanitisation, privilege separation"],
            ["LLM02", "Insecure Output Handling", "Output validation, sandboxed execution"],
            ["LLM03", "Training Data Poisoning", "Data provenance, anomaly detection"],
            ["LLM04", "Model Denial of Service", "Rate limiting, max token limits"],
            ["LLM05", "Supply Chain Vulnerabilities", "Dependency scanning, model signing"],
            ["LLM06", "Sensitive Info Disclosure", "PII redaction, output filtering"],
            ["LLM07", "Insecure Plugin Design", "Tool permission scoping, sandboxing"],
            ["LLM08", "Excessive Agency", "Minimal permissions, human-in-loop"],
            ["LLM09", "Overreliance", "Confidence scores, human review workflows"],
            ["LLM10", "Model Theft", "Access controls, output watermarking"],
          ],
        },
        sources: [
          {
            label: "OWASP LLM Top 10",
            url: "https://owasp.org/www-project-top-10-for-large-language-model-applications/",
          },
          {
            label: "OWASP LLM Top 10 2025 (PDF)",
            url: "https://genai.owasp.org",
          },
        ],
      },
    ],
  },
  {
    num: 12,
    phaseLabel: "PHASE 11",
    kind: "phase",
    title: "Production Deployment Patterns",
    subtitle:
      "Getting AI from your laptop to production requires deployment patterns specific to LLM workloads. Different from normal services.",
    miniProjectTitle: "Production Deployment Pipeline",
    miniProjectDesc:
      "Deploy your RAG + chat service to production with full deployment ops:",
    miniProjectChecklist: [
      "Dockerise FastAPI + Celery + Redis in docker-compose",
      "Deploy to Railway or Fly.io one command deployment",
      "GitHub Actions CI/CD test → build → push Docker image → deploy",
      "Feature flag enable streaming only for 'beta' users",
      "Locust load test find saturation point at current model settings",
      "Runbook document rollback steps for prompt regression incidents",
    ],
    sections: [
      {
        id: "p11-containerising-ai-services",
        label: "11.1 Containerising AI Services",
        heading: "Docker Best Practices for AI",
        tone: "bullets",
        bullets: [
          "Base image python:3.11-slim (not python:3.11 — saves 500MB)",
          "Multi-stage build build stage installs deps, runtime stage runs app",
          "Layer caching COPY requirements.txt first, then RUN pip install",
          "Non-root user run as app user, not root (security)",
          "Secrets never in Dockerfile or image — use env vars or secrets manager",
          "Health check HEALTHCHECK CMD curl /health for orchestrator auto-restart",
          "GPU support nvidia/cuda base image + --gpus all for inference containers",
        ],
        sources: [
          {
            label: "Docker Best Practices for Python",
            url: "https://docs.docker.com/language/python/",
          },
          {
            label: "FastAPI in Docker",
            url: "https://fastapi.tiangolo.com/deployment/docker/",
          },
        ],
      },
      {
        id: "p11-self-hosted-inference",
        label: "11.2 Self-Hosted Inference",
        heading: "Self-Hosted Inference",
        tone: "table",
        table: {
          headers: ["Tool", "Best For", "GPU Required", "Key Feature"],
          rows: [
            [
              "vLLM",
              "High-throughput production",
              "Yes",
              "PagedAttention, continuous batching",
            ],
            [
              "Ollama",
              "Local dev, quick prototyping",
              "Optional",
              "One command model download",
            ],
            [
              "llama.cpp",
              "CPU inference, embedded",
              "No (CPU OK)",
              "Quantisation, minimal deps",
            ],
            [
              "TGI (HuggingFace)",
              "HF model serving",
              "Yes",
              "Streaming, OpenAI compat API",
            ],
            [
              "LMStudio",
              "Desktop local inference",
              "Optional",
              "GUI, easy model management",
            ],
          ],
        },
        sources: [
          { label: "vLLM Docs", url: "https://docs.vllm.ai" },
          { label: "Ollama GitHub", url: "https://github.com/ollama/ollama" },
          {
            label: "Modal — Serverless GPU Inference",
            url: "https://modal.com/docs",
          },
          {
            label: "Replicate — Model Hosting",
            url: "https://replicate.com/docs",
          },
        ],
      },
      {
        id: "p11-deployment-strategies",
        label: "11.3 Deployment Strategies",
        heading: "AI-Specific Deployment Patterns",
        tone: "bullets",
        bullets: [
          "Blue/green for prompt changes both versions live, switch traffic atomically",
          "Canary deployment 5% traffic to new prompt, monitor metrics, ramp up",
          "Feature flags decouple deploy from release — ship code, enable later",
          "Rollback plan revert to previous prompt/model version in <5 minutes",
          "Zero-downtime deployment Kubernetes rolling update, health check gates",
          "Model version pinning pin to specific model version (gpt-4o-2024-08-06)",
        ],
        sources: [
          {
            label: "LaunchDarkly — Feature Flags",
            url: "https://launchdarkly.com/docs/",
          },
          {
            label: "Kubernetes Rolling Updates",
            url: "https://kubernetes.io/docs/concepts/workloads/controllers/deployment/",
          },
          {
            label: "Fly.io — Easy App Deployment",
            url: "https://fly.io/docs/",
          },
          {
            label: "Railway — FastAPI Deployment",
            url: "https://docs.railway.app",
          },
        ],
      },
      {
        id: "p11-load-testing-ai-endpoints",
        label: "11.4 Load Testing AI Endpoints",
        heading: "Why AI Load Testing is Different",
        tone: "bullets",
        bullets: [
          "LLM latency variance is massive p50=2s, p99=30s — normal load testers mislead",
          "Token throughput measure tokens/second, not just requests/second",
          "Concurrent sessions how many simultaneous streaming connections?",
          "Cost under load 1000 concurrent users at $0.01/request = $600/hour",
          "Locust Python load testing, write realistic user scenarios",
          "k6 JavaScript load testing, good for SSE streaming tests",
          "Saturation point find where latency p99 exceeds SLA",
        ],
        sources: [
          { label: "Locust Docs", url: "https://docs.locust.io" },
          { label: "k6 Load Testing", url: "https://k6.io/docs/" },
        ],
      },
    ],
  },
  {
    num: 13,
    phaseLabel: "CAPSTONE",
    kind: "capstone",
    title: "Build Your Own ChatGPT + Agentic System",
    subtitle:
      "This is not a tutorial. This is the real thing. Every system you build from Phase 0–11 converges here.",
    deliverables: [
      {
        title: "Chat Interface",
        body: "Chat interface with streaming (your own ChatGPT).",
      },
      {
        title: "RAG Pipeline",
        body: "RAG pipeline with hybrid search + reranking over real documents.",
      },
      {
        title: "Agentic Workflow",
        body: "Agentic workflow with tool calling + human-in-loop approval.",
      },
      {
        title: "Eval Suite",
        body: "Full eval suite: unit + LLM-as-judge + regression tests.",
      },
      {
        title: "Observability",
        body: "All calls traced, cost tracked per user per request.",
      },
      {
        title: "Security",
        body: "PII redaction, prompt injection defence, rate limiting.",
      },
      {
        title: "Production Deployment",
        body: "Docker + CI/CD + load tested.",
      },
    ],
    sections: [
      {
        id: "cap-what-you-are-building",
        label: "What You Are Building",
        heading: "What You Are Building",
        tone: "bullets",
        bullets: [
          "Chat interface with streaming (your own ChatGPT)",
          "RAG pipeline with hybrid search + reranking over real documents",
          "Agentic workflow with tool calling + human-in-loop approval",
          "Full eval suite: unit + LLM-as-judge + regression tests",
          "Observability: all calls traced, cost tracked per user per request",
          "Security: PII redaction, prompt injection defence, rate limiting",
          "Production deployment: Docker + CI/CD + load tested",
        ],
      },
      {
        id: "cap-architecture-breakdown",
        label: "Architecture Breakdown",
        heading: "Architecture Breakdown",
        tone: "table",
        table: {
          headers: ["Component", "Tech Stack", "Spec"],
          rows: [
            [
              "API Layer",
              "FastAPI + uvicorn",
              "POST /chat, POST /agent, GET /jobs/{id}",
            ],
            [
              "LLM Client",
              "LiteLLM + tenacity",
              "Multi-provider, retry, cost tracking",
            ],
            [
              "RAG Pipeline",
              "Qdrant + text-embedding-3-small",
              "Hybrid BM25 + dense + Cohere rerank",
            ],
            [
              "Agent Workflow",
              "LangGraph",
              "ReAct loop, 5 tools, human-in-loop checkpoint",
            ],
            [
              "Task Queue",
              "Celery + Redis",
              "Async document indexing, long agent runs",
            ],
            ["Streaming", "FastAPI SSE", "Token-by-token to React frontend"],
            ["Cache", "Redis + GPTCache", "Semantic cache, exact cache"],
            ["Observability", "Langfuse", "All calls traced, cost per user"],
            [
              "Security",
              "Presidio + Guardrails AI",
              "PII redaction, output validation",
            ],
            [
              "Evals",
              "Ragas + custom + PromptFoo",
              "CI-gated regression suite",
            ],
            [
              "Deployment",
              "Docker + Railway / Fly.io",
              "Blue/green, feature flags",
            ],
          ],
        },
      },
      {
        id: "cap-milestone-checklist",
        label: "Milestone Checklist",
        heading: "Milestone Checklist",
        tone: "tasks",
        tasks: [
          "M1 — Scaffold: FastAPI + Docker running, POST /chat returning streamed response",
          "M2 — RAG: Documents indexed in Qdrant, hybrid search returning citations",
          "M3 — Agent: LangGraph agent with web_search + RAG + code_exec tools",
          "M4 — Human-in-Loop: Agent pauses on dangerous actions, waits for approval",
          "M5 — Evals: 50 golden test cases, Ragas faithfulness > 0.85",
          "M6 — Observability: Langfuse dashboard showing cost per user per day",
          "M7 — Security: Presidio PII redaction on all inputs, injection detection",
          "M8 — Deployment: Live URL, CI/CD pipeline, load tested to 50 concurrent users",
        ],
      },
      {
        id: "cap-success-criteria",
        label: "Success Criteria — You Pass If",
        heading: "Success Criteria — You Pass If",
        tone: "bullets",
        bullets: [
          "A new user can sign up, ask a question, and get a streamed answer in <3s p50",
          "RAG faithfulness score > 0.85 on your eval set",
          "Agent completes a 5-step research task without hitting infinite loop",
          "Eval suite runs in CI and blocks merges on score regression",
          "You can explain every architectural decision to a senior engineer",
          "Total build cost logged: you know exactly what the capstone cost to run",
        ],
      },
    ],
  },
  {
    num: 14,
    phaseLabel: "APPENDIX",
    kind: "appendix",
    title: "Interview Prep — Top 100 AI Engineer Questions",
    subtitle:
      "Top questions across all major AI engineer interview categories. Every question here is answerable after completing this roadmap.",
    sections: [
      {
        id: "appendix-llm-fundamentals",
        label: "LLM Fundamentals",
        heading: "LLM Fundamentals",
        tone: "bullets",
        bullets: [
          "Explain the attention mechanism. What is Q, K, V?",
          "Why does temperature > 1 increase randomness? Walk through the math.",
          "What is the difference between top-p and top-k sampling?",
          "How does the KV cache work and why does it matter for inference speed?",
          "What is BPE tokenisation? Why do numbers tokenise inefficiently?",
          "What is positional encoding and why is RoPE better than sinusoidal?",
          "Why does context length matter for cost AND quality?",
        ],
      },
      {
        id: "appendix-rag",
        label: "RAG",
        heading: "RAG",
        tone: "bullets",
        bullets: [
          "Design a RAG system for a 10M-document enterprise knowledge base.",
          "What chunking strategy would you use for legal contracts? Why?",
          "Explain reciprocal rank fusion. When does hybrid search beat pure vector search?",
          "What is 'lost in the middle' and how do you mitigate it?",
          "How do you evaluate a RAG system? What metrics do you track?",
          "When would you choose Qdrant over pgvector? Walk through your decision.",
        ],
      },
      {
        id: "appendix-agents",
        label: "Agents",
        heading: "Agents",
        tone: "bullets",
        bullets: [
          "Explain the ReAct pattern. Draw the observe-think-act loop.",
          "How does tool calling work at the API level? Walk through a full cycle.",
          "What are the failure modes of agents in production? How do you mitigate?",
          "When would you use LangGraph vs CrewAI vs a simple loop?",
          "How do you implement human-in-the-loop in an agent workflow?",
          "Design an agent that monitors GitHub PRs and writes review comments.",
        ],
      },
      {
        id: "appendix-evals",
        label: "Evals",
        heading: "Evals",
        tone: "bullets",
        bullets: [
          "Why can't you use accuracy alone to evaluate an LLM system?",
          "How do you implement LLM-as-judge? What are its failure modes?",
          "Describe your eval-driven development workflow for prompt changes.",
          "What is Ragas faithfulness and how is it calculated?",
          "How do you catch prompt regressions before they reach production?",
        ],
      },
      {
        id: "appendix-system-design",
        label: "System Design",
        heading: "System Design",
        tone: "bullets",
        bullets: [
          "Design a system that handles 10,000 concurrent chat users.",
          "How would you architect multi-tenant LLM cost isolation?",
          "Design a streaming response pipeline from LLM to React frontend.",
          "How do you implement semantic caching? What's the similarity threshold?",
          "Design an eval CI/CD pipeline that gates production deployments.",
          "How do you implement per-user token budget enforcement at scale?",
        ],
      },
      {
        id: "appendix-security-safety",
        label: "Security & Safety",
        heading: "Security & Safety",
        tone: "bullets",
        bullets: [
          "What is prompt injection? How do you defend against indirect injection in RAG?",
          "Name all 10 OWASP LLM vulnerabilities and a defence for each.",
          "How do you prevent PII from reaching external LLM APIs?",
          "What's the difference between fail-open and fail-closed guardrails? When to use each?",
        ],
      },
      {
        id: "appendix-final-resources",
        label: "Final Resources",
        heading: "Final Resources",
        tone: "bullets",
        sources: [
          {
            label: "Anthropic Cookbook — Production AI Patterns",
            url: "https://github.com/anthropics/anthropic-cookbook",
          },
          {
            label: "OpenAI Cookbook",
            url: "https://github.com/openai/openai-cookbook",
          },
          {
            label: "LangChain Hub — Prompt Library",
            url: "https://smith.langchain.com/hub",
          },
          {
            label: "Papers With Code — ML Papers + Code",
            url: "https://paperswithcode.com",
          },
          {
            label: "The Batch — AI News (Andrew Ng)",
            url: "https://www.deeplearning.ai/the-batch/",
          },
          { label: "Latent Space Podcast", url: "https://www.latent.space" },
          { label: "AI Engineer Foundation", url: "https://www.ai.engineer" },
          {
            label: "Chip Huyen — ML Engineering Blog",
            url: "https://huyenchip.com/blog/",
          },
          {
            label: "Simon Willison — LLM Engineering Blog",
            url: "https://simonwillison.net",
          },
          {
            label: "MLOps Community Slack",
            url: "https://mlops.community",
          },
        ],
      },
    ],
  },
];

export function getAiePhase(num: number): AiePhase | undefined {
  return AIE_PHASES.find((p) => p.num === num);
}
