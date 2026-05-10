import type { AwsDay, AwsCapstone, AwsPhaseMeta } from "@/types";
import { PHASE_1 } from "./aws/phase1";
import { PHASE_2 } from "./aws/phase2";
import { PHASE_3 } from "./aws/phase3";
import { PHASE_4 } from "./aws/phase4";
import { PHASE_5 } from "./aws/phase5";
import { PHASE_6 } from "./aws/phase6";
import { PHASE_7 } from "./aws/phase7";

export const AWS_PHASES: AwsPhaseMeta[] = [
  {
    phase: 1,
    title: "Foundation",
    tagline: "IAM, VPC, EC2, S3, CLI — the bedrock everything else sits on",
    range: "Days 1–15",
    goal: "Core infra live in AWS. You can stand up a multi-AZ VPC, launch an EC2 with an instance role, store objects in S3, and shell every resource via CLI.",
    weeks: [
      { range: "Days 1–8",   summary: "IAM (identity & policies) → VPC (subnets, route tables, NACL/SG) → EC2 (instance types, ASG) → S3 (storage classes, lifecycle, versioning)" },
      { range: "Days 9–15",  summary: "EBS / EFS / Instance Store → AWS CLI + Boto3 + CloudShell → CloudFormation (parameters, resources, outputs, StackSets)" },
    ],
  },
  {
    phase: 2,
    title: "Compute & Databases",
    tagline: "Serverless, containers, SQL, NoSQL, caching, messaging — pick the right tool for the job",
    range: "Days 16–35",
    goal: "Full-stack app deployed end-to-end on managed services. Lambda + API Gateway + DynamoDB. RDS Multi-AZ. ECS Fargate behind ALB. SQS/SNS/EventBridge for decoupling.",
    weeks: [
      { range: "Days 16–24", summary: "Lambda + SAM → RDS / Aurora Multi-AZ + read replicas → DynamoDB (single-table design, GSIs, on-demand vs provisioned)" },
      { range: "Days 25–35", summary: "ECS + ECR → EKS → ElastiCache (Redis / Memcached) → SQS standard vs FIFO + SNS fan-out + EventBridge rules" },
    ],
  },
  {
    phase: 3,
    title: "Networking",
    tagline: "Make it global, fast, and reachable from anywhere",
    range: "Days 36–50",
    goal: "Global CDN + DNS routing live. You understand all 7 Route 53 routing policies, ALB vs NLB vs GWLB, and how Transit Gateway replaces VPC peering at scale.",
    weeks: [
      { range: "Days 36–44", summary: "Route 53 (7 routing policies, health checks, alias) → CloudFront + OAC + Lambda@Edge → ALB / NLB / API Gateway" },
      { range: "Days 45–50", summary: "VPC Peering vs PrivateLink vs Transit Gateway → Direct Connect + Site-to-Site VPN" },
    ],
  },
  {
    phase: 4,
    title: "Security",
    tagline: "Encrypt everything, audit everything, blast-radius everything",
    range: "Days 51–60",
    goal: "Hardened secure app. KMS-encrypted at rest, TLS in transit, WAF on the edge, Cognito for end-user auth, GuardDuty + Security Hub watching the account.",
    weeks: [
      { range: "Days 51–55", summary: "KMS + envelope encryption + Secrets Manager rotation → WAF (managed rules, rate limiting) + Shield Standard / Advanced" },
      { range: "Days 56–60", summary: "Cognito User Pools + Identity Pools → GuardDuty, Macie, Inspector, Security Hub, Detective, Config" },
    ],
  },
  {
    phase: 5,
    title: "Operations & Monitoring",
    tagline: "If you can't see it, you can't fix it — observability + IT operations",
    range: "Days 61–72",
    goal: "Full observability stack. CloudWatch Metrics + Logs + Alarms + Dashboards. CloudTrail for audit. Config for drift. SSM for fleet ops. Backup for compliance.",
    weeks: [
      { range: "Days 61–67", summary: "CloudWatch (metrics, logs, alarms, agent, Logs Insights queries) → CloudTrail + Config → AWS Backup + DR mechanics" },
      { range: "Days 68–72", summary: "Systems Manager (Parameter Store, Session Manager, Patch Manager, Run Command) → Trusted Advisor + Cost Explorer + Budgets" },
    ],
  },
  {
    phase: 6,
    title: "Architecture Patterns",
    tagline: "Multi-AZ HA, multi-region DR, cost optimisation, the 6 Well-Architected pillars",
    range: "Days 73–82",
    goal: "Multi-AZ production architecture and a multi-region DR plan that meets a real RTO/RPO. You know all 4 DR strategies and which one to pick.",
    weeks: [
      { range: "Days 73–79", summary: "HA & Multi-AZ design → 4 DR strategies (Backup/Restore, Pilot Light, Warm Standby, Multi-Site) → Cost optimisation (Savings Plans, Spot, right-sizing, Graviton)" },
      { range: "Days 80–82", summary: "Well-Architected Framework — 6 pillars (Operational Excellence, Security, Reliability, Performance, Cost, Sustainability)" },
    ],
  },
  {
    phase: 7,
    title: "Exam Prep",
    tagline: "SAA-C03 — pass first try",
    range: "Days 83–90",
    goal: "SAA-C03 PASS. 65 questions, 130 minutes, 720/1000 to pass. You can read a question, identify the constraint, eliminate 2 wrong answers, and pick the AWS-preferred one.",
    weeks: [
      { range: "Days 83–88", summary: "Domain deep-dives — Secure (30%), Resilient (26%), High-Performing (24%), Cost-Optimised (20%) → Practice exam walkthroughs" },
      { range: "Days 89–90", summary: "Final review of weak areas, exam day checklist, schedule the test" },
    ],
  },
];

export const AWS_CAPSTONES: AwsCapstone[] = [
  {
    phase: 2,
    name: "Three-Tier Production Web App",
    tagline: "Production-grade web app with full CI/CD",
    summary: "React frontend on S3+CloudFront. Node.js API on ECS Fargate behind ALB. PostgreSQL on Aurora Multi-AZ. Redis on ElastiCache. WAF on the edge. Secrets in Secrets Manager. CloudWatch dashboards + alarms.",
    stack: ["React", "S3", "CloudFront", "ECS Fargate", "ALB", "Aurora PostgreSQL", "ElastiCache Redis", "Secrets Manager", "WAF", "CloudWatch"],
    buildPhases: [
      { range: "Phase A — VPC & data",      description: "Deploy VPC with CloudFormation. Aurora Serverless v2 cluster + RDS Proxy. ElastiCache Redis in private subnet. KMS keys for at-rest encryption." },
      { range: "Phase B — Compute & edge",  description: "Containerise Node.js API, push to ECR, deploy on Fargate. ALB with HTTPS listener (ACM cert). WAF attached. React build to S3 behind CloudFront with OAC." },
      { range: "Phase C — Routing & CI/CD", description: "Route 53 A/AAAA alias to CloudFront. GitHub Actions pipeline: lint → typecheck → test → build → push ECR → ECS rolling deploy. Blue/green optional." },
      { range: "Phase D — Observability",   description: "CloudWatch dashboard: ECS CPU/memory, ALB 4xx/5xx, Aurora connections, p99 latency. Alarms → SNS → PagerDuty. CloudTrail enabled." },
    ],
    challenges: [
      "Lambda → Aurora 'too many connections' under load — fix with RDS Proxy",
      "CloudFront serves stale assets after deploy — wire cache invalidation into CI",
      "ECS service slow to drain — tune deregistration delay on target group",
      "WAF false positive blocks a real user — add a managed-rule exception",
    ],
    outcome: "A production app you can ship Black Friday traffic against without losing sleep. Real CI/CD, real alarms, real WAF — not a demo.",
  },
  {
    phase: 4,
    name: "Serverless E-Commerce Platform",
    tagline: "Fully serverless storefront",
    summary: "API Gateway → Lambda → DynamoDB. User auth via Cognito User Pool. Product images on S3 + CloudFront. Order processing via SQS + Lambda worker. Email via SES. Search via OpenSearch. All deployed with SAM.",
    stack: ["API Gateway", "Lambda", "DynamoDB", "Cognito", "S3", "CloudFront", "SQS", "SES", "OpenSearch", "SAM"],
    buildPhases: [
      { range: "Phase A — Auth & catalog",    description: "Cognito User Pool with hosted UI + JWT authoriser on API Gateway. DynamoDB single-table design for products / carts / orders. Pre-signup Lambda trigger for validation." },
      { range: "Phase B — Order pipeline",    description: "POST /order writes to DynamoDB and pushes to SQS. Worker Lambda charges Stripe, updates order status, emails confirmation via SES. DLQ for failures." },
      { range: "Phase C — Search & media",    description: "DynamoDB Streams → Lambda → OpenSearch index for full-text product search. S3 presigned URLs for product image upload (no backend pass-through)." },
      { range: "Phase D — Ops & guardrails",  description: "EventBridge daily 'low stock' rule → SNS → email alert. Step Functions for the multi-step refund workflow with retries and compensation. WAF on API Gateway." },
    ],
    challenges: [
      "DynamoDB hot partition on a viral product — redesign PK / scatter-gather",
      "Lambda cold start kills checkout latency — add provisioned concurrency",
      "Cognito refresh token rotation breaks SPA — wire silent refresh correctly",
      "Stripe webhook arrives twice — implement idempotency keys in DynamoDB",
    ],
    outcome: "A storefront that scales from 0 to thousands of concurrent shoppers, pays per request, and proves you can wire 6+ AWS services into a coherent product.",
  },
  {
    phase: 5,
    name: "Real-Time Data Pipeline (Netflix-style)",
    tagline: "Stream billions of events with serverless analytics",
    summary: "Kinesis Data Streams ingests user events. Lambda processes them in real time. Kinesis Firehose lands raw events in S3 (data lake). Glue catalogues. Redshift for analytics. QuickSight dashboards.",
    stack: ["Kinesis Data Streams", "Kinesis Firehose", "Lambda", "S3", "Glue", "Redshift", "DynamoDB", "EventBridge", "QuickSight"],
    buildPhases: [
      { range: "Phase A — Ingest",        description: "Kinesis Data Stream with 5 shards. Producer SDK in your app (PartitionKey = userId for ordering). Firehose delivery stream → S3 with date/hour partitioning." },
      { range: "Phase B — Process",       description: "Lambda consumer aggregates clickstream into DynamoDB for the real-time dashboard. Anomaly-detection Lambda emits SNS alert when error rate spikes." },
      { range: "Phase C — Warehouse",     description: "Glue crawler builds the data catalogue. Hourly Glue ETL job partitions and compresses Parquet. Redshift COPY pulls into the analytics DW." },
      { range: "Phase D — Visualisation", description: "QuickSight dashboards on top of Redshift. EventBridge Scheduler triggers the hourly Glue job. CloudWatch alarms on ingest lag and Lambda errors." },
    ],
    challenges: [
      "Kinesis shard hot — rebalance partition key strategy",
      "Lambda batch size too big causes timeout — tune ParallelizationFactor",
      "Firehose buffers too long for the dashboard — drop buffer interval",
      "Redshift query slow — add sort key + dist key on the right column",
    ],
    outcome: "A pipeline that handles real-time and batch in one architecture, with a dashboard you can show a CEO and a data lake that survives schema evolution.",
  },
  {
    phase: 6,
    name: "Multi-Region Disaster Recovery Architecture",
    tagline: "5-minute RTO, 1-minute RPO — what financial services run",
    summary: "Active in us-east-1, warm standby in us-west-2. Aurora Global Database for sub-second cross-region replication. Route 53 failover routing. Lambda-driven promotion. RTO < 5 min, RPO < 1 min.",
    stack: ["Route 53", "ALB", "ECS Fargate", "Aurora Global Database", "ElastiCache", "S3 CRR", "Lambda", "SNS"],
    buildPhases: [
      { range: "Phase A — Primary",          description: "Full production stack in us-east-1. ECS Fargate (full capacity) + Aurora Global DB primary + ElastiCache + S3 with CRR enabled to us-west-2." },
      { range: "Phase B — Warm standby",     description: "us-west-2: ECS Fargate at 25% capacity, Aurora Global DB secondary (read-only, < 1s replication lag), ElastiCache warm, S3 destination bucket." },
      { range: "Phase C — Failover routing", description: "Route 53 failover policy: primary = us-east-1 ALB (health check every 10s), secondary = us-west-2 ALB. Short TTL on the record so DNS flips fast." },
      { range: "Phase D — Promotion",        description: "Route 53 health-check failure → EventBridge → Lambda: promote Aurora Global DB secondary to standalone primary, scale ECS service to 100% in us-west-2, page on-call." },
    ],
    challenges: [
      "Aurora Global DB promotion takes longer than expected — measure and tune",
      "DNS clients ignore TTL and stay stuck on dead region — accept and document",
      "Cross-region IAM role trust breaks during failover — pre-provision",
      "Run a real game-day: kill us-east-1 and verify the runbook actually works",
    ],
    outcome: "A DR architecture that financial-services teams actually run — not a slide. You can recite the failover sequence and explain every cost line item.",
  },
];

// ─── All 90 days ─────────────────────────────────────────────────────────────

export const AWS_DAYS: AwsDay[] = [
  ...PHASE_1,
  ...PHASE_2,
  ...PHASE_3,
  ...PHASE_4,
  ...PHASE_5,
  ...PHASE_6,
  ...PHASE_7,
];

// ─── Getters ─────────────────────────────────────────────────────────────────

export function getAwsDay(day: number): AwsDay | undefined {
  return AWS_DAYS.find((d) => d.day === day);
}

export function getAwsPhaseMeta(phase: number): AwsPhaseMeta | undefined {
  return AWS_PHASES.find((p) => p.phase === phase);
}

export function getAwsCapstone(phase: number): AwsCapstone | undefined {
  return AWS_CAPSTONES.find((c) => c.phase === phase);
}
