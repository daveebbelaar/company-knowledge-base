/** @type {import('next').NextConfig} */
export default {
  devIndicators: false,
  agentRules: false,
  outputFileTracingIncludes: { "/*": ["./content/docs/**/*.md"] },
};
