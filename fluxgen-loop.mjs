import fs from 'fs';
import path from 'path';
import { execSync, spawnSync } from 'child_process';

const PRD = JSON.parse(process.env.PRD_JSON || '{}');
const PROJECT_ID = process.env.PROJECT_ID;
const CALLBACK_URL = process.env.CALLBACK_URL;
const AI_PROVIDER = process.env.AI_PROVIDER || 'anthropic';
const MAX_LOOPS = 8;

// Helper to send status updates with loop metadata
async function updateStatus(status, message, storyId = null, prUrl = null, loopNumber = null, phase = null, artifacts = null, agent = null) {
  console.log(`[STATUS] ${agent ? `[${agent}] ` : ''}${status}: ${message}${loopNumber ? ` (Loop ${loopNumber})` : ''}`);
  if (CALLBACK_URL) {
    try {
      await fetch(CALLBACK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: PROJECT_ID,
          status,
          message,
          storyId,
          prUrl,
          loopNumber,
          phase,
          agent,
          artifacts
        }),
      });
    } catch (e) {
      console.error('Failed to send status update:', e.message);
    }
  }
}

// Initialize artifacts
function initArtifacts() {
  const artifacts = {
    prd: 'PRD.md',
    plan: 'PLAN.md',
    buildLog: 'BUILD_LOG.md',
    qaReport: 'QA_REPORT.md',
    loopLog: 'LOOP_LOG.md',
    howToRun: 'How_to_run.md',
    nextSteps: 'next_steps.md',
  };

  // Initialize if they don't exist
  if (!fs.existsSync(artifacts.loopLog)) {
    fs.writeFileSync(artifacts.loopLog, `# Loop Log\n\n## Iteration 1\nStarted: ${new Date().toISOString()}\n\n`);
  }
  if (!fs.existsSync(artifacts.buildLog)) {
    fs.writeFileSync(artifacts.buildLog, `# Build Log\n\n## Iteration 1\nStarted: ${new Date().toISOString()}\n\n`);
  }
  if (!fs.existsSync(artifacts.qaReport)) {
    fs.writeFileSync(artifacts.qaReport, `# QA Report\n\n## Summary\n\nNo issues found yet.\n\n`);
  }

  return artifacts;
}

// Commit artifacts
function commitArtifacts(artifacts, message) {
  try {
    execSync('git add PRD.md PLAN.md BUILD_LOG.md QA_REPORT.md LOOP_LOG.md How_to_run.md next_steps.md 2>/dev/null || true', { stdio: 'inherit' });
    execSync(`git commit -m "${message}" --allow-empty || true`, { stdio: 'inherit' });
  } catch (e) {
    console.log('Note: Could not commit artifacts:', e.message);
  }
}

// Get artifact URLs (for GitHub)
function getArtifactUrls(branchName) {
  const repo = process.env.GITHUB_REPOSITORY || 'user/repo';
  return {
    prd: `https://github.com/${repo}/blob/${branchName}/PRD.md`,
    plan: `https://github.com/${repo}/blob/${branchName}/PLAN.md`,
    buildLog: `https://github.com/${repo}/blob/${branchName}/BUILD_LOG.md`,
    qaReport: `https://github.com/${repo}/blob/${branchName}/QA_REPORT.md`,
    loopLog: `https://github.com/${repo}/blob/${branchName}/LOOP_LOG.md`,
    howToRun: `https://github.com/${repo}/blob/${branchName}/How_to_run.md`,
    nextSteps: `https://github.com/${repo}/blob/${branchName}/next_steps.md`,
  };
}

// Call AI API
async function callAI(prompt, systemPrompt, model = null) {
  const useModel = model || (AI_PROVIDER === 'anthropic' ? 'claude-sonnet-4-20250514' : 
                            AI_PROVIDER === 'openai' ? 'gpt-4-turbo-preview' : 
                            'gemini-1.5-pro');

  if (AI_PROVIDER === 'anthropic') {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: useModel,
        max_tokens: 8192,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.content[0].text;
  } else if (AI_PROVIDER === 'openai') {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: useModel,
        max_tokens: 8192,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
      }),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices[0].message.content;
  } else if (AI_PROVIDER === 'google') {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }],
        generationConfig: { maxOutputTokens: 8192 },
      }),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.candidates[0].content.parts[0].text;
  }
  throw new Error(`Unknown AI provider: ${AI_PROVIDER}`);
}

// Parse file changes from AI response
function parseFileChanges(response) {
  const changes = [];
  const fileBlockRegex = /```(?:[\w]+)?\s*\n\/\/\s*FILE:\s*(.+?)\n([\s\S]*?)```/g;
  let match;
  while ((match = fileBlockRegex.exec(response)) !== null) {
    changes.push({ path: match[1].trim(), content: match[2].trim() });
  }
  return changes;
}

// Phase 0: Marc Intake
async function phase0MarcIntake(artifacts) {
  console.log('\n=== Phase 0: Marc - Intake & Context ===');
  await updateStatus('marc_plan', 'Creating project plan and PRD', null, null, null, 'marc_plan', null, 'marc');

  const prompt = `# Marc Phase 0: Intake & Context

You are Marc, the tech lead at FluxGen. Your task is Phase 0: Intake & Context gathering.

## Your Task

Understand the request and repo state to create an executable plan that produces RUNNABLE SOFTWARE.

## CRITICAL REQUIREMENTS

The final output MUST be software that can actually RUN:
- For websites: must be viewable in a browser (use Vite, Next.js, or simple HTML/CSS/JS with a dev server)
- For APIs: must have endpoints that can be called
- For CLIs: must have commands that execute
- NEVER accept "echo" or stub scripts as valid implementations

## Steps

1. Read README and any architecture/docs
2. Identify missing requirements or unclear goals
3. Capture constraints: platform, stack, target users, delivery target
4. Record assumptions in PRD.md
5. Draft an executable plan (1–3 major deliverables) in PLAN.md with SPECIFIC tech stack choices
6. Create LOOP_LOG.md (Iteration 1 entry)

## Tech Stack Recommendations

For websites/web apps:
- Simple static sites: HTML/CSS/JS + npx serve
- Interactive sites: Vite + React/Vue or Next.js
- Avoid WordPress unless specifically requested (requires PHP/MySQL setup)

For APIs:
- Node.js: Express or Fastify
- Python: FastAPI or Flask

## PRD Data
${JSON.stringify(PRD, null, 2)}

## Output Format

You MUST output all file changes using this format:

\`\`\`markdown
// FILE: PRD.md
[complete file content]
\`\`\`

\`\`\`markdown
// FILE: PLAN.md
[complete file content]
\`\`\`

\`\`\`markdown
// FILE: LOOP_LOG.md
[complete file content]
\`\`\`

Create PRD.md, PLAN.md, and initialize LOOP_LOG.md with Iteration 1.`;

  const systemPrompt = `You are Marc, the tech lead at FluxGen. You coordinate the team and ensure projects ship successfully.

PERSONALITY:
- Calm and organized
- Trust the team, but verify
- Make decisive calls
- Keep communication clear

For Phase 0, create PRD.md, PLAN.md, and LOOP_LOG.md based on the PRD JSON provided.`;

  const response = await callAI(prompt, systemPrompt, 'claude-3-5-haiku-20241022');
  const changes = parseFileChanges(response);

  for (const change of changes) {
    const dir = path.dirname(change.path);
    if (dir !== '.') fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(change.path, change.content);
  }

  commitArtifacts(artifacts, 'docs: Phase 0 - Marc Intake (PRD, PLAN, LOOP_LOG)');
  await updateStatus('marc_plan', 'Plan complete - PRD.md, PLAN.md, LOOP_LOG.md created', null, null, null, 'marc_plan', null, 'marc');
}

// Phase 1: Jake Build Implementation
async function phase1JakeBuild(artifacts, loopNumber) {
  console.log(`\n=== Phase 1 (Loop ${loopNumber}): Jake - Build Implementation ===`);
  await updateStatus('jake_build', `Building the application`, null, null, loopNumber, 'jake_build', null, 'jake');

  // Read all relevant artifacts so Jake has full context
  let planContent = '';
  let buildLogContent = '';
  let qaReportContent = '';

  if (fs.existsSync(artifacts.plan)) {
    planContent = fs.readFileSync(artifacts.plan, 'utf-8');
  }
  if (fs.existsSync(artifacts.buildLog) && loopNumber > 1) {
    buildLogContent = fs.readFileSync(artifacts.buildLog, 'utf-8');
  }
  if (fs.existsSync(artifacts.qaReport) && loopNumber > 1) {
    qaReportContent = fs.readFileSync(artifacts.qaReport, 'utf-8');
  }

  const previousLoopContext = loopNumber > 1 ? `
## Previous Loop Context

This is loop ${loopNumber}. Review the previous findings from Doug and Cody to understand what needs to be fixed.

### Doug's Build Verification (BUILD_LOG.md)
${buildLogContent.substring(0, 3000)}

### Cody's QA Report (QA_REPORT.md)
${qaReportContent.substring(0, 3000)}

**IMPORTANT**: Focus on fixing the issues identified above. The PLAN.md has been updated by Marc with specific tasks to address these issues.
` : '';

  const prompt = `# Jake Agent Instructions

You are an autonomous coding agent working on a software project within the FluxGen multi-agent loop.
${previousLoopContext}

## Your Task

1. Read the PRD at prd.json (provided below)
2. Read PLAN.md to see prioritized tasks for this loop iteration
3. ${loopNumber > 1 ? 'Review the issues from Doug and Cody above and fix them' : 'Pick the highest priority task from PLAN.md'}
4. Implement the fixes/features WITH REAL, FUNCTIONAL CODE
5. Run quality checks (typecheck, lint, test - use whatever your project requires)
6. Update BUILD_LOG.md with your implementation results

## CRITICAL: RUNNABLE OUTPUT REQUIRED

Your implementation MUST be runnable software:

For websites:
- Create actual HTML/CSS/JS files that render in a browser
- Include a package.json with a REAL dev script (e.g., "vite", "next dev", "npx serve .")
- Test that files will actually load and display

For APIs:
- Create actual endpoint handlers
- Include a package.json with a REAL start script
- Test that endpoints respond

NEVER create stub/fake scripts like:
- "echo 'build complete'" - THIS IS INVALID
- "exit 0" - THIS IS INVALID
- Any script that just echoes text and exits

If PLAN.md mentions WordPress but there's no existing WordPress setup, CHANGE THE APPROACH to use a simpler stack like Vite + HTML/CSS/JS that can actually run.

## PRD Data
${JSON.stringify(PRD, null, 2)}

## PLAN.md
${planContent}

## Output Format

After implementing, update BUILD_LOG.md:

\`\`\`markdown
// FILE: BUILD_LOG.md
[append to existing content]

## Loop ${loopNumber} - Jake Implementation
Completed: ${new Date().toISOString()}

### Story/Task Implemented
- ID: [Story ID or Task]
- Title: [Title]
- Files Changed: [list of files]

### Quality Checks Attempted
- Lint: [attempted/not attempted] - [command used]
- Test: [attempted/not attempted] - [command used]
- Build: [attempted/not attempted] - [command used]

### Results
- Status: [pass/fail/partial]
- Notes: [any issues encountered]
\`\`\`

Implement the highest priority task from PLAN.md. Output ALL file changes using:

\`\`\`language
// FILE: path/to/file.ext
<complete file content>
\`\`\``;

  const systemPrompt = `You are Jake, a senior software engineer at FluxGen. You implement features by writing clean, production-ready code.

CRITICAL - YOU MUST CREATE RUNNABLE SOFTWARE:
1. The output MUST be a working, runnable application
2. NEVER create fake/stub scripts like "echo 'done'" - create REAL implementations
3. For web apps: Include actual HTML/CSS/JS that renders in a browser
4. For APIs: Include actual endpoints that can be called
5. For CLIs: Include actual command processing
6. If the PRD asks for a website, create a COMPLETE website that can be opened in a browser
7. Include a working package.json with real dev server commands (e.g., vite, next dev, serve)

IMPLEMENTATION RULES:
1. Output file changes in this EXACT format:
\`\`\`language
// FILE: path/to/file.ext
<complete file content>
\`\`\`
2. Always include the COMPLETE file content, not just changes
3. Follow existing code patterns and conventions EXACTLY
4. Check existing files before creating new ones
5. Include necessary imports
6. Handle errors appropriately
7. Create REAL, FUNCTIONAL code - not stubs or placeholders`;

  const response = await callAI(prompt, systemPrompt);
  const changes = parseFileChanges(response);

  for (const change of changes) {
    const dir = path.dirname(change.path);
    if (dir !== '.') fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(change.path, change.content);
  }

  if (changes.length > 0) {
    execSync('git add -A', { stdio: 'inherit' });
    execSync(`git commit -m "feat: Loop ${loopNumber} - Jake implementation" --allow-empty || true`, { stdio: 'inherit' });
  }

  commitArtifacts(artifacts, `docs: Loop ${loopNumber} - Jake BUILD_LOG update`);
  await updateStatus('jake_build', `Implementation complete`, null, null, loopNumber, 'jake_build', null, 'jake');
}

// Phase 2: Doug Build Verification
async function phase2DougVerify(artifacts, loopNumber, canonicalCommands) {
  console.log(`\n=== Phase 2 (Loop ${loopNumber}): Doug - Build Verification ===`);
  await updateStatus('doug_verify', `Verifying build and dependencies`, null, null, loopNumber, 'doug_verify', null, 'doug');

  // Helper to check if script is a fake/stub (just echo commands)
  function isFakeScript(script) {
    if (!script) return false;
    const trimmed = script.trim().toLowerCase();
    // Detect fake scripts that just echo and exit
    return trimmed.startsWith('echo ') ||
           trimmed === 'exit 0' ||
           (trimmed.includes('echo') && !trimmed.includes('&&') && trimmed.length < 100);
  }

  // Deterministic command discovery
  let commands = canonicalCommands;
  let hasFakeScripts = false;

  if (!commands) {
    commands = { lint: null, test: null, build: null, dev: null };

    // 1. Check Makefile
    if (fs.existsSync('Makefile')) {
      const makefile = fs.readFileSync('Makefile', 'utf-8');
      if (makefile.includes('lint')) commands.lint = 'make lint';
      if (makefile.includes('test')) commands.test = 'make test';
      if (makefile.includes('build')) commands.build = 'make build';
    }

    // 2. Check package.json and validate scripts aren't fake
    if (fs.existsSync('package.json')) {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
      const scripts = pkg.scripts || {};

      // Check for fake scripts
      for (const [name, script] of Object.entries(scripts)) {
        if (isFakeScript(script)) {
          console.log(`Warning: Detected fake script "${name}": ${script}`);
          hasFakeScripts = true;
        }
      }

      if (!commands.lint && scripts.lint && !isFakeScript(scripts.lint)) commands.lint = `npm run lint`;
      if (!commands.lint && scripts.typecheck && !isFakeScript(scripts.typecheck)) commands.lint = `npm run typecheck`;
      if (!commands.test && scripts.test && !isFakeScript(scripts.test)) commands.test = `npm run test`;
      if (!commands.build && scripts.build && !isFakeScript(scripts.build)) commands.build = `npm run build`;
      if (!commands.dev && scripts.dev && !isFakeScript(scripts.dev)) commands.dev = `npm run dev`;
      if (!commands.dev && scripts.start && !isFakeScript(scripts.start)) commands.dev = `npm run start`;
    }

    // 3. Python project
    if (!commands.lint && (fs.existsSync('requirements.txt') || fs.existsSync('pyproject.toml'))) {
      commands.lint = 'ruff check . || flake8 .';
      commands.test = 'pytest';
      commands.build = 'python -m build';
    }

    // 4. Check for static HTML site
    if (!commands.dev && fs.existsSync('index.html')) {
      commands.dev = 'npx serve . -l 3000';
    }
  }

  // Execute commands and log results
  const buildResults = { lint: { passed: false, exitCode: null }, test: { passed: false, exitCode: null }, build: { passed: false, exitCode: null }, runnable: !hasFakeScripts };
  let buildLogContent = fs.existsSync(artifacts.buildLog) ? fs.readFileSync(artifacts.buildLog, 'utf-8') : '';

  buildLogContent += `\n## Loop ${loopNumber} - Doug Verification\nCompleted: ${new Date().toISOString()}\n\n### Command Discovery\n`;
  buildLogContent += `- Lint: ${commands.lint || 'not found'}\n`;
  buildLogContent += `- Test: ${commands.test || 'not found'}\n`;
  buildLogContent += `- Build: ${commands.build || 'not found'}\n`;
  buildLogContent += `- Dev Server: ${commands.dev || 'not found'}\n`;

  if (hasFakeScripts) {
    buildLogContent += `\n### CRITICAL: Fake/Stub Scripts Detected\n`;
    buildLogContent += `The package.json contains scripts that are just echo statements or stubs.\n`;
    buildLogContent += `These do NOT count as real build verification. Jake MUST replace these with real implementations.\n\n`;
  }

  buildLogContent += `\n### Execution Results\n\n`;

  // Run lint
  if (commands.lint) {
    try {
      const result = spawnSync(commands.lint, { shell: true, encoding: 'utf-8', timeout: 120000 });
      buildResults.lint = { passed: result.status === 0, exitCode: result.status };
      buildLogContent += `#### Lint\n- Command: ${commands.lint}\n- Exit Code: ${result.status}\n- Status: ${result.status === 0 ? 'pass' : 'fail'}\n`;
      if (result.status !== 0) {
        buildLogContent += `- Output: ${(result.stderr || result.stdout || '').slice(-500)}\n`;
      }
      buildLogContent += '\n';
    } catch (e) {
      buildResults.lint = { passed: false, exitCode: -1 };
      buildLogContent += `#### Lint\n- Command: ${commands.lint}\n- Exit Code: -1\n- Status: fail\n- Output: ${e.message}\n\n`;
    }
  }

  // Run test
  if (commands.test) {
    try {
      const result = spawnSync(commands.test, { shell: true, encoding: 'utf-8', timeout: 120000 });
      buildResults.test = { passed: result.status === 0, exitCode: result.status };
      buildLogContent += `#### Test\n- Command: ${commands.test}\n- Exit Code: ${result.status}\n- Status: ${result.status === 0 ? 'pass' : 'fail'}\n`;
      if (result.status !== 0) {
        buildLogContent += `- Output: ${(result.stderr || result.stdout || '').slice(-500)}\n`;
      }
      buildLogContent += '\n';
    } catch (e) {
      buildResults.test = { passed: false, exitCode: -1 };
      buildLogContent += `#### Test\n- Command: ${commands.test}\n- Exit Code: -1\n- Status: fail\n- Output: ${e.message}\n\n`;
    }
  }

  // Run build
  if (commands.build) {
    try {
      const result = spawnSync(commands.build, { shell: true, encoding: 'utf-8', timeout: 120000 });
      buildResults.build = { passed: result.status === 0, exitCode: result.status };
      buildLogContent += `#### Build\n- Command: ${commands.build}\n- Exit Code: ${result.status}\n- Status: ${result.status === 0 ? 'pass' : 'fail'}\n`;
      if (result.status !== 0) {
        buildLogContent += `- Output: ${(result.stderr || result.stdout || '').slice(-500)}\n`;
      }
      buildLogContent += '\n';
    } catch (e) {
      buildResults.build = { passed: false, exitCode: -1 };
      buildLogContent += `#### Build\n- Command: ${commands.build}\n- Exit Code: -1\n- Status: fail\n- Output: ${e.message}\n\n`;
    }
  }

  fs.writeFileSync(artifacts.buildLog, buildLogContent);
  commitArtifacts(artifacts, `docs: Loop ${loopNumber} - Doug BUILD_LOG update`);
  await updateStatus('doug_verify', `Build verification complete`, null, null, loopNumber, 'doug_verify', null, 'doug');

  return { commands, buildResults };
}

// Phase 3: Cody QA Reporting
async function phase3CodyQA(artifacts, loopNumber) {
  console.log(`\n=== Phase 3 (Loop ${loopNumber}): Cody - QA Reporting ===`);
  await updateStatus('cody_qa', `Running tests and code review`, null, null, loopNumber, 'cody_qa', null, 'cody');

  const prdContent = fs.existsSync(artifacts.prd) ? fs.readFileSync(artifacts.prd, 'utf-8') : '';
  const buildLogContent = fs.existsSync(artifacts.buildLog) ? fs.readFileSync(artifacts.buildLog, 'utf-8') : '';

  const prompt = `# Cody Phase 3: QA Reporting

You are Cody, the QA reporter at FluxGen. Your task is Phase 3: QA Reporting.

## Your Task

Provide quality signal and actionable issues.

## Steps

1. Validate behavior vs PRD.md
2. Run the app or execute a minimal smoke test (UI/endpoint/CLI)
3. Capture bugs/regressions/missing elements with clear repro steps
4. Classify issues by severity (Critical/High/Medium/Low)
5. Confirm QA gate status: are there any Medium+ issues remaining?

## PRD.md
${prdContent}

## BUILD_LOG.md
${buildLogContent}

## Severity Definitions

- **Critical:** blocks launch or prevents basic usage/run
- **High:** major broken flow/regression, severe correctness/security risk
- **Medium:** important but workaround exists; not launch-blocking alone
- **Low:** polish, copy, minor UI, non-blocking enhancements

## Output Format

You MUST update QA_REPORT.md with this format:

\`\`\`markdown
// FILE: QA_REPORT.md
# QA Report

## Summary
- Lint: [pass/fail] ([command] - exit code: [code])
- Tests: [pass/fail] ([command] - exit code: [code])
- Build: [pass/fail] ([command] - exit code: [code])
- Smoke: [pass/fail] ([what was verified])

## Issues

### Critical
[If none, write "None"]

#### [Issue Title]
- **Steps to reproduce:**
1. [Step 1]
2. [Step 2]
- **Expected:** [what should happen]
- **Actual:** [what actually happens]
- **Notes:** [additional context]

### High
[If none, write "None"]

### Medium
[If none, write "None"]

### Low
[If none, write "None"]

## QA Gate Status
- **Status:** [PASS / FAIL]
- **Critical Issues:** [count]
- **High Issues:** [count]
- **Medium Issues:** [count]
- **Low Issues:** [count]
\`\`\``;

  const systemPrompt = `You are Cody, the QA reporter at FluxGen. You provide quality signal and actionable issues.

REVIEW PHILOSOPHY:
- Be thorough but constructive
- Focus on issues that matter
- Suggest improvements, don't just criticize
- Security issues are always critical

Classify issues by severity accurately and provide clear repro steps.`;

  const response = await callAI(prompt, systemPrompt);
  const changes = parseFileChanges(response);

  for (const change of changes) {
    const dir = path.dirname(change.path);
    if (dir !== '.') fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(change.path, change.content);
  }

  commitArtifacts(artifacts, `docs: Loop ${loopNumber} - Cody QA_REPORT update`);
  await updateStatus('cody_qa', `QA complete - findings documented`, null, null, loopNumber, 'cody_qa', null, 'cody');

  // Parse QA results
  const qaReportContent = fs.existsSync(artifacts.qaReport) ? fs.readFileSync(artifacts.qaReport, 'utf-8') : '';
  const criticalMatch = qaReportContent.match(/Critical Issues:\s*(\d+)/);
  const highMatch = qaReportContent.match(/High Issues:\s*(\d+)/);
  const mediumMatch = qaReportContent.match(/Medium Issues:\s*(\d+)/);

  return {
    criticalIssues: parseInt(criticalMatch?.[1] || '0'),
    highIssues: parseInt(highMatch?.[1] || '0'),
    mediumIssues: parseInt(mediumMatch?.[1] || '0'),
  };
}

// Phase 4: Marc Post-QA PRD/Plan Update
async function phase4MarcPostQA(artifacts, loopNumber, qaResults) {
  console.log(`\n=== Phase 4 (Loop ${loopNumber}): Marc - Post-QA PRD/Plan Update ===`);
  await updateStatus('marc_review', `Reviewing QA findings and updating plan`, null, null, loopNumber, 'marc_review', null, 'marc');

  const qaReportContent = fs.existsSync(artifacts.qaReport) ? fs.readFileSync(artifacts.qaReport, 'utf-8') : '';
  const buildLogContent = fs.existsSync(artifacts.buildLog) ? fs.readFileSync(artifacts.buildLog, 'utf-8') : '';

  const prompt = `# Marc Phase 4: Post-QA PRD/Plan Update

You are Marc, the tech lead at FluxGen. Your task is Phase 4: Post-QA PRD/Plan Update.

## Your Task

Convert QA/build feedback into a tight, prioritized plan for the next Jake iteration.

## Steps

1. Read QA_REPORT.md and BUILD_LOG.md
2. Update PRD.md/PLAN.md focusing on Critical → High → Medium
3. Record scope changes and confirm loop count in LOOP_LOG.md
4. If something is "Won't Fix," document justification + follow-up action

## QA_REPORT.md
${qaReportContent.slice(-3000)}

## BUILD_LOG.md
${buildLogContent.slice(-3000)}

## Output Format

Update these files:

\`\`\`markdown
// FILE: PLAN.md
[complete updated file with prioritized tasks]
\`\`\`

\`\`\`markdown
// FILE: LOOP_LOG.md
[append to existing - add loop status update]
\`\`\`

Focus on actionable tasks for Jake. Prioritize Critical → High → Medium.`;

  const systemPrompt = `You are Marc, the tech lead at FluxGen. You coordinate the team and ensure projects ship successfully.

For Phase 4, update PLAN.md with prioritized tasks from QA_REPORT.md and BUILD_LOG.md. Focus on Critical → High → Medium priority.`;

  const response = await callAI(prompt, systemPrompt, 'claude-3-5-haiku-20241022');
  const changes = parseFileChanges(response);

  for (const change of changes) {
    const dir = path.dirname(change.path);
    if (dir !== '.') fs.mkdirSync(dir, { recursive: true });
    if (change.path === artifacts.loopLog) {
      // Append to loop log
      const existing = fs.existsSync(change.path) ? fs.readFileSync(change.path, 'utf-8') : '';
      fs.writeFileSync(change.path, existing + '\n' + change.content);
    } else {
      fs.writeFileSync(change.path, change.content);
    }
  }

  commitArtifacts(artifacts, `docs: Loop ${loopNumber} - Marc Post-QA PLAN/LOOP_LOG update`);
  await updateStatus('marc_review', `Plan updated with fixes for next iteration`, null, null, loopNumber, 'marc_review', null, 'marc');
}

// Phase 5: Connor Finalization
async function phase5ConnorFinalize(artifacts, branchName, isBlocked = false, qaResults = null) {
  console.log('\n=== Phase 5: Connor - Finalization ===');

  if (isBlocked) {
    await updateStatus('connor_docs', 'Documenting progress - we hit some issues that need human help', null, null, MAX_LOOPS, 'connor_docs', null, 'connor');
  } else {
    await updateStatus('connor_docs', 'Creating documentation and How-To guides', null, null, null, 'connor_docs', null, 'connor');
  }

  const buildLogContent = fs.existsSync(artifacts.buildLog) ? fs.readFileSync(artifacts.buildLog, 'utf-8') : '';
  const qaReportContent = fs.existsSync(artifacts.qaReport) ? fs.readFileSync(artifacts.qaReport, 'utf-8') : '';

  const blockedContext = isBlocked ? `

## IMPORTANT: This project needs human assistance!

After ${MAX_LOOPS} iterations, there are still some issues that need a human developer to resolve.
Please document these clearly in the How_to_run.md with a friendly message like:
"Hey! We've made good progress, but I ran into a few issues that need a human touch. Here's what's left to fix..."

Remaining QA issues to document:
${qaReportContent.substring(0, 2000)}
` : '';

  const prompt = `# Connor Phase 5: Finalization
${blockedContext}

You are Connor, the documentor at FluxGen. Your task is Phase 5: Finalization.

## Your Task

Create ship-ready documentation and next steps.

## Steps

1. Write How_to_run.md:
- Prerequisites (tool versions)
- Required env vars (with examples)
- Install steps
- Canonical commands (lint/test/build/dev) - use commands from BUILD_LOG.md
- Smoke test instructions

2. Write next_steps.md:
- Deploy suggestions
- CI gates (lint/test/build)
- Monitoring/logging basics
- Release checklist

## BUILD_LOG.md
${buildLogContent.slice(-2000)}

## Output Format

\`\`\`markdown
// FILE: How_to_run.md
[complete file content]
\`\`\`

\`\`\`markdown
// FILE: next_steps.md
[complete file content]
\`\`\`

Use exact commands from BUILD_LOG.md. Make it so a new engineer can run, test, and build the project.`;

  const systemPrompt = `You are Connor, the documentor at FluxGen. You create ship-ready documentation.

Create How_to_run.md and next_steps.md based on BUILD_LOG.md. Be specific about versions, commands, and requirements.`;

  const response = await callAI(prompt, systemPrompt);
  const changes = parseFileChanges(response);

  for (const change of changes) {
    const dir = path.dirname(change.path);
    if (dir !== '.') fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(change.path, change.content);
  }

  commitArtifacts(artifacts, 'docs: Phase 5 - Connor Finalization (How_to_run, next_steps)');
  await updateStatus('connor_docs', 'Documentation complete - How_to_run.md and next_steps.md created', null, null, null, 'connor_docs', null, 'connor');
}

// Check stop conditions
function checkStopConditions(buildResults, qaResults) {
  // Build must pass AND not have fake scripts AND QA must pass
  const buildPassed = buildResults.lint.passed && buildResults.test.passed && buildResults.build.passed;
  const isRunnable = buildResults.runnable !== false; // Must be actually runnable, not fake scripts
  const qaPassed = qaResults.criticalIssues === 0 && qaResults.highIssues === 0 && qaResults.mediumIssues === 0;

  const allPassed = buildPassed && isRunnable && qaPassed;

  let reason = 'Gates not passing: ';
  const failures = [];
  if (!buildPassed) failures.push('build checks failed');
  if (!isRunnable) failures.push('fake/stub scripts detected');
  if (!qaPassed) failures.push(`QA issues (C:${qaResults.criticalIssues} H:${qaResults.highIssues} M:${qaResults.mediumIssues})`);

  return {
    shouldStop: allPassed,
    reason: allPassed ? 'All gates passing - build verified, no fake scripts, QA clean' : reason + failures.join(', ')
  };
}

// Main execution
async function main() {
  console.log('🚀 FluxGen Multi-Agent Loop Starting...');
  console.log('PRD:', JSON.stringify(PRD, null, 2));

  // Configure git
  execSync('git config user.name "FluxGen AI Team"');
  execSync('git config user.email "team@fluxgen.app"');

  // Create feature branch
  const branchName = PRD.branchName || `fluxgen/feature-${Date.now()}`;
  try {
    execSync(`git checkout -b ${branchName}`);
  } catch (e) {
    execSync(`git checkout ${branchName} || git checkout -b ${branchName}`);
  }
  console.log(`Branch: ${branchName}`);

  // Initialize artifacts
  const artifacts = initArtifacts();

  // Phase 0: Marc Intake
  await phase0MarcIntake(artifacts);

  // Main loop: Marc → Jake → Doug → Cody → Marc (max 8 iterations)
  let canonicalCommands = null;
  let finalBuildResults = null;
  let finalQaResults = null;
  let stoppedEarly = false;

  for (let loop = 1; loop <= MAX_LOOPS; loop++) {
    console.log(`\n🔄 LOOP ${loop} of ${MAX_LOOPS}`);
    await updateStatus('loop_iteration', `Starting loop ${loop} of ${MAX_LOOPS}`, null, null, loop, 'loop_start', null, 'marc');

    // Phase 1: Jake
    await phase1JakeBuild(artifacts, loop);

    // Phase 2: Doug
    const { commands, buildResults } = await phase2DougVerify(artifacts, loop, canonicalCommands);
    if (!canonicalCommands) canonicalCommands = commands;
    finalBuildResults = buildResults;

    // Phase 3: Cody
    const qaResults = await phase3CodyQA(artifacts, loop);
    finalQaResults = qaResults;

    // Check stop conditions
    const { shouldStop, reason } = checkStopConditions(buildResults, qaResults);
    if (shouldStop) {
      console.log(`\n✅ All gates passing! Stopping early at loop ${loop}`);
      await updateStatus('loop_iteration', `All gates passing! Build verified and clean.`, null, null, loop, 'loop_complete', null, 'marc');
      stoppedEarly = true;
      break;
    }

    // Phase 4: Marc Post-QA (not on last loop)
    if (loop < MAX_LOOPS) {
      await phase4MarcPostQA(artifacts, loop, qaResults);
      await updateStatus('loop_iteration', `Loop ${loop} complete - continuing to next iteration`, null, null, loop, 'loop_complete', null, 'marc');
    }
  }

  // Phase 5: Connor Finalization
  const isBlocked = !stoppedEarly;
  await phase5ConnorFinalize(artifacts, branchName, isBlocked, finalQaResults);

  // Push branch
  console.log('\nPushing changes...');
  execSync(`git push origin ${branchName}`, { stdio: 'inherit' });

  // Get artifact URLs
  const artifactUrls = getArtifactUrls(branchName);

  if (isBlocked) {
    await updateStatus('blocked', 'Hey! I made good progress but ran into some issues that need a human touch. Check the docs for details.', null, null, MAX_LOOPS, 'blocked', artifactUrls, 'connor');
  }

  // Create PR
  console.log('Creating pull request...');
  const prTitle = PRD.project_name || PRD.project || 'Feature Implementation by FluxGen Team';
  const prBody = `## AI-Generated Feature Implementation

This PR was automatically generated by the **FluxGen Multi-Agent Team**.

### Team Members
- 📋 **Marc**: Intake, planning, coordination
- 👨‍💻 **Jake**: Feature implementation
- 🔧 **Doug**: Build verification
- 🧪 **Cody**: QA reporting
- ▶️ **Connor**: Documentation

### Artifacts
- [PRD.md](${artifactUrls.prd})
- [PLAN.md](${artifactUrls.plan})
- [BUILD_LOG.md](${artifactUrls.buildLog})
- [QA_REPORT.md](${artifactUrls.qaReport})
- [LOOP_LOG.md](${artifactUrls.loopLog})
- [How_to_run.md](${artifactUrls.howToRun})
- [next_steps.md](${artifactUrls.nextSteps})

### Summary
${PRD.description || 'Implemented requested features based on the PRD.'}

---
*Generated with [FluxGen](https://fluxgen.app) - AI-Powered Feature Planning & Implementation*`;

  try {
    const result = execSync(`gh pr create --title "${prTitle}" --body "${prBody.replace(/"/g, '\\"')}" --base main`, { encoding: 'utf-8' });
    const prUrlMatch = result.match(/https:\/\/github\.com\/[^\/]+\/[^\/]+\/pull\/\d+/);
    const prUrl = prUrlMatch ? prUrlMatch[0] : null;
    console.log('PR created:', result);

    if (isBlocked) {
      await updateStatus('blocked', `PR created with documented issues. Some work needs human help - see How_to_run.md for details.`, null, prUrl, MAX_LOOPS, 'blocked', artifactUrls, 'connor');
    } else {
      await updateStatus('completed', `All done! PR created successfully with all artifacts.`, null, prUrl, MAX_LOOPS, 'complete', artifactUrls, 'connor');
    }
  } catch (e) {
    console.log('PR creation output:', e.message);
    if (isBlocked) {
      await updateStatus('blocked', `Changes pushed to ${branchName}. Some work needs human help - see How_to_run.md for details.`, null, null, MAX_LOOPS, 'blocked', artifactUrls, 'connor');
    } else {
      await updateStatus('completed', `All done! Changes pushed to ${branchName}.`, null, null, MAX_LOOPS, 'complete', artifactUrls, 'connor');
    }
  }
}

main().catch(async (error) => {
  console.error('Fatal error:', error);
  await updateStatus('error', `Something went wrong: ${error.message}`, null, null, null, 'error', null, 'marc');
  process.exit(1);
});
