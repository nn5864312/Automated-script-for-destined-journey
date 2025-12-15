export function injectEventPrompts() {
  const variables = getVariables({ type: "message", message_id: -2 });
  const completed_events = variables?.date?.event?.completed_events;
  injectPrompts([
    {
      id: "completed_events",
      content: completed_events,
      position: "none",
      depth: 0,
      role: "system",
      should_scan: true,
    },
  ]);
  if (variables?.date?.event?.cache) {
    const Prompts = variables?.date?.event?.cache;
    injectPrompts([
      {
        id: "completed_events",
        content: Prompts,
        position: "none",
        depth: 0,
        role: "system",
        should_scan: true,
      },
    ]);
    injectPrompts([
      {
        id: "event_tips",
        content: `core_system:The event chain has been activated, please note<event>`,
        position: "in_chat",
        depth: 0,
        role: "system",
        should_scan: true,
      },
    ]);
  }
}
