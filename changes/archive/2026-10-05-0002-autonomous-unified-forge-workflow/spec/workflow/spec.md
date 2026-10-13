# Autonomous workflow and host integration

## Purpose

Enables a single-entrypoint autonomous engineering workflow for agents, eliminating
fragmented slash commands by automatically chaining preparation (investigation,
interactive clarification, specification, and task breakdown), presenting a unified
plan artifact asking for execution strategy (sequential vs parallel), and executing
tasks to completion with strict TDD.

## ADDED Requirements

### Requirement: REQ-host-antigravity-rules - Antigravity host export installs autonomous operating rules

The system SHALL export Antigravity operating rules to `.agents/rules/forge.md`
(or `.agent/rules/forge.md`) and link them in project manifests when running
`forge install --host antigravity`, instructing the host agent to treat `/forge` as
the master workflow, auto-chain preparation skills, present a single plan gate, and
execute tasks autonomously.

#### Scenario: Installing Antigravity host writes rules and skills

- Given a repository without host customizations
- When `forge install --host antigravity` is run
- Then skill files are copied to the agent skills directory
- And `.agents/rules/forge.md` is written with operating rules
- And the rule directs the agent to execute `/forge` as the unified autonomous entrypoint

#### Scenario: Existing Antigravity rules are updated without duplicating

- Given a repository where Antigravity rules already exist
- When `forge install --host antigravity` is run again
- Then the outcome is reported as unchanged or updated
- And duplicate rules are not created

### Requirement: REQ-skill-router-batch - Forge router supports batch preparation and single decision gate

The `forge` router skill SHALL describe a batch preparation sequence where the agent
restates intent, inspects codebase claims, clarifies unknowns, specifies delta
requirements, and breaks down tasks, presenting a single reviewable plan asking the
user to choose between sequential and parallel execution before opening implementation.

#### Scenario: Batch preparation presents single plan artifact

- Given a user request to modify the repository
- When the `forge` router executes
- Then it auto-chains investigation, delta specification, and task planning
- And it presents a single plan artifact to the user
- And it requests explicit confirmation of execution strategy (sequential vs parallel)

### Requirement: REQ-skill-implement-autonomous - Implement skill supports autonomous batch execution

The `implement` skill SHALL support an autonomous execution mode where an agent
sequentially discharges all remaining tasks in `tasks.md` with Red-Green-Refactor TDD
and verification without pausing for turn-by-turn user confirmation after each task,
stopping only upon verification pass or declared stop conditions.

#### Scenario: Autonomous execution completes all tasks

- Given an approved `tasks.md` with multiple unchecked tasks
- When the agent executes in autonomous implementation mode
- Then each task is executed with failing test first (`@covers REQ-...`), followed by passing code
- And each task checkbox is marked complete
- And `forge verify` is run at the conclusion
- And the agent stops only when all tasks are complete and verified, or on a declared stop condition
