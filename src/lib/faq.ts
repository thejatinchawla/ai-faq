export type FaqEntry = {
  question: string;
  answer: string;
  keywords?: string[];
};

// Initial fixed knowledge base for the SaaS SupportBot.
export const FAQ_ENTRIES: FaqEntry[] = [
  {
    question: "What does SupportBot do?",
    answer:
      "SupportBot is an AI FAQ assistant that answers customer questions from your approved knowledge base and hands off to a human when it is not sure.",
    keywords: ["product", "overview"],
  },
  {
    question: "How is pricing structured?",
    answer:
      "Pricing is simple: Starter at $29/mo for small teams, Growth at $79/mo with analytics, and Scale with volume-based pricing. Annual billing saves 15%.",
    keywords: ["pricing", "plans", "cost"],
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes, we offer a 14-day free trial with full features. No credit card is required to start, and you can cancel anytime from the billing page.",
    keywords: ["trial", "free", "evaluation"],
  },
  {
    question: "What happens if the bot is not confident?",
    answer:
      "If an answer is unclear, the bot will say it is unsure and can hand off to a human agent with the conversation history.",
    keywords: ["handoff", "human", "support"],
  },
  {
    question: "Where is my data stored and how is it secured?",
    answer:
      "Data is stored in the US on SOC 2 Type II cloud infrastructure. Chats are encrypted in transit via TLS and at rest using AES-256.",
    keywords: ["security", "encryption", "data residency"],
  },
  {
    question: "Does SupportBot integrate with other tools?",
    answer:
      "Yes, it integrates with Slack for notifications and with Zapier for workflows. More native CRM integrations are on the roadmap.",
    keywords: ["integrations", "Slack", "Zapier"],
  },
  {
    question: "What uptime can I expect?",
    answer:
      "We target 99.9% uptime monthly and provide a public status page with incident updates. Scheduled maintenance is announced 72 hours ahead.",
    keywords: ["uptime", "SLA", "status"],
  },
  {
    question: "How do I cancel or change plans?",
    answer:
      "You can change or cancel plans anytime from the billing settings. Downgrades take effect on the next cycle; unused time is prorated.",
    keywords: ["cancel", "downgrade", "billing"],
  },
  {
    question: "How do I contact support?",
    answer:
      "You can reach us at support@supportbot.app or via the in-app chat. Response times are under one business hour for paid plans.",
    keywords: ["contact", "email", "support"],
  },
];


