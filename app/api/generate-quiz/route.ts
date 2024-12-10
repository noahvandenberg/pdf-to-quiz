import { questionSchema, questionsSchema } from "@/lib/schemas";
import { google } from "@ai-sdk/google";
import { streamObject } from "ai";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { files } = await req.json();
  const firstFile = files[0].data;

  const result = await streamObject({
    model: google("gemini-1.5-pro-latest"),
    messages: [
      {
        role: "system",
        content:
          "You are an expert educator. Your task is to analyze the document and:\n" +
          "1. Identify key learning objectives and core concepts\n" +
          "2. Create challenging multiple choice questions that test understanding of these concepts\n" +
          "3. Focus on comprehension, application, and analysis rather than simple recall\n" +
          "4. Avoid superficial questions about formatting, authors, or publication details\n" +
          "5. Ensure each question has 4 well-crafted options of similar length\n" +
          "6. Make incorrect options plausible but clearly wrong to those who understand the concept\n" +
          "7. For each question, provide a detailed explanation that:\n" +
          "   - Explains why the correct answer is right\n" +
          "   - Connects the answer to the core concept being tested\n" +
          "   - Helps learners understand common misconceptions\n" +
          "   - Uses examples or analogies when helpful\n",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Create 4 high-quality multiple choice questions based on the core concepts in this document. Include detailed explanations for each question.",
          },
          {
            type: "file",
            data: firstFile,
            mimeType: "application/pdf",
          },
        ],
      },
    ],
    schema: questionSchema,
    output: "array",
    onFinish: ({ object }) => {
      const res = questionsSchema.safeParse(object);
      if (res.error) {
        throw new Error(res.error.errors.map((e) => e.message).join("\n"));
      }
    },
  });

  return result.toTextStreamResponse();
}
