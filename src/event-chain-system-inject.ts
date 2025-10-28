declare function injectPrompts(prompts: any[]): void;
declare function getVariables(option: VariableOptionNormal): Record<string, any>;
type VariableOptionNormal = {
  type: 'chat' | 'character' | 'preset' | 'global' | 'message';
  message_id?: number | 'latest';
};

export function event_chain_inject() {
  const variables = getVariables({ type: 'message', message_id: -2 });
  if (variables.event_chain.completed_events !== null) {
    const completed_events = variables.event_chain.completed_events
    injectPrompts([
      {
        id: "event_chain_end",
        content: completed_events,
        position: "none",
        depth: 0,
        role: "system",
        should_scan: true,
      },
    ]);
  }
  if (variables.event_chain.cache !== null) {
    const Prompts = variables.event_chain.cache
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
        id: "event_chain_tips",
        content: `core_system:The event chain has been activated, please note<event_chain>`,
        position: "in_chat",
        depth: 0,
        role: "system",
        should_scan: true,
      },
    ]);
  }
}