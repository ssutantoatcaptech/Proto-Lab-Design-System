import { createMDX } from "fumadocs-mdx/next"

/** @type {import('next').NextConfig} */
// Agent guidance for this repo comes from APPLY.md and the skill, not Next's generated AGENTS.md.
const config = { reactStrictMode: true, agentRules: false }

export default createMDX()(config)
