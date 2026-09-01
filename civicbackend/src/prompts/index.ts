import citizen from "./citizen";
import mayor from "./mayor";
import commissioner from "./commissioner";
import field from "./field";
import analytics from "./analytics";
import policy from "./policy";
import emergency from "./emergency";

export const SYSTEM_PROMPTS = {
  citizen,
  mayor,
  commissioner,
  field,
  analytics,
  policy,
  emergency,
};

export type SystemPromptRole = keyof typeof SYSTEM_PROMPTS;
