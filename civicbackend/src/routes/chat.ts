import { Router, Request, Response } from "express";
import groq, { GROQ_MODEL } from "../services/groq";
import { getPrompt } from "../utils/promptRouter";
import { buildSessionKey, getHistory, appendTurn, clearSession } from "../services/session";
import { ChatMessage, ChatRequestBody } from "../types/chat";
import { getComplaintById, searchComplaints } from "../services/complaintLookup";

const router = Router();

router.get("/status", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "CivicIQ AI Copilot",
    model: GROQ_MODEL,
  });
});

// Tool definitions given to Groq so the model can pull live complaint data
// instead of guessing or saying "I don't have access".
const tools = [
  {
    type: "function" as const,
    function: {
      name: "get_complaint_by_id",
      description:
        "Fetch full details of a specific civic complaint/ticket by its ID, e.g. BLR-2026-003. Use this whenever the user references a specific ticket number.",
      parameters: {
        type: "object",
        properties: {
          complaintId: {
            type: "string",
            description: "The complaint ticket ID, e.g. 'BLR-2026-003'",
          },
        },
        required: ["complaintId"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "search_complaints",
      description:
        "Search civic complaints by status and/or category. Use this for questions like 'what's pending' or 'show me traffic issues' when no specific ticket ID is given.",
      parameters: {
        type: "object",
        properties: {
          status: {
            type: "string",
            description: "e.g. 'Pending', 'Assigned', 'Resolved'",
          },
          category: {
            type: "string",
            description: "e.g. 'Pothole', 'Water Logging', 'Traffic Signal'",
          },
          limit: {
            type: "number",
            description: "Max number of results to return, default 10",
          },
        },
      },
    },
  },
];

async function runTool(name: string, args: any) {
  switch (name) {
    case "get_complaint_by_id": {
      const result = await getComplaintById(args.complaintId);
      return result ?? { error: `Complaint ${args.complaintId} not found.` };
    }
    case "search_complaints": {
      return await searchComplaints(args);
    }
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

router.post("/chat", async (req: Request, res: Response) => {
  try {
    const {
      role = "citizen",
      message,
      sessionId = "default",
      context,
      chatbotType,
    } = req.body as ChatRequestBody;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "`message` is required and must be a string." });
    }

    const systemPrompt = getPrompt(role, chatbotType);
    const sessionKey = buildSessionKey(role, sessionId);
    const history = getHistory(sessionKey);

    const messages: ChatMessage[] = [{ role: "system", content: systemPrompt }];

    if (context) {
      messages.push({
        role: "system",
        content: `Current CivicIQ Context:\n${JSON.stringify(context, null, 2)}`,
      });
    }

    messages.push(...history);
    messages.push({ role: "user", content: message });

    // First pass — model decides whether it needs live complaint data
    let completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: messages as any,
      tools,
      tool_choice: "auto",
      temperature: 0.4,
      max_tokens: 1200,
    });

    let choice = completion.choices[0];

    // Loop to handle tool calls (usually resolves in one round trip)
    let toolRounds = 0;
    while (choice.message.tool_calls?.length && toolRounds < 3) {
      messages.push(choice.message as any);

      for (const call of choice.message.tool_calls) {
        const args = JSON.parse(call.function.arguments || "{}");
        const result = await runTool(call.function.name, args);

        messages.push({
          role: "tool",
          tool_call_id: call.id,
          content: JSON.stringify(result),
        } as any);
      }

      completion = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: messages as any,
        tools,
        tool_choice: "auto",
        temperature: 0.4,
        max_tokens: 1200,
      });

      choice = completion.choices[0];
      toolRounds++;
    }

    const reply = choice.message?.content ?? "No response.";

    appendTurn(sessionKey, message, reply);

    res.json({
      success: true,
      reply,
      role,
    });
  } catch (error: any) {
    console.error("Groq Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal Server Error",
    });
  }
});

router.delete("/session/:role/:id", (req: Request, res: Response) => {
  const { role, id } = req.params;
  const sessionKey = buildSessionKey(role, id);
  clearSession(sessionKey);
  res.json({ success: true, message: "Session cleared" });
});

export default router;