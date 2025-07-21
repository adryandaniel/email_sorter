import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface EmailAnalysis {
  category_id: string | null;
  summary: string;
  unsubscribe_url: string | null;
  unsubscribe_method: string | null;
}

export async function analyzeEmail(
  emailContent: string,
  categories: Array<{ id: string; name: string; description: string }>
): Promise<EmailAnalysis> {
  try {
    const categoriesText = categories
      .map(cat => `ID: ${cat.id}, Name: ${cat.name}, Description: ${cat.description}`)
      .join('\n');

    const prompt = `
Analyze this email and provide:
1. Which category it belongs to (return the category ID, or null if no good match)
2. A brief summary (max 100 words)
3. Any unsubscribe link found in the email
4. Method to unsubscribe (link, email, or other)

Categories available:
${categoriesText}

Email content:
${emailContent}

Return ONLY a JSON object with this exact structure:
{
  "category_id": "category_id_here_or_null",
  "summary": "brief summary here",
  "unsubscribe_url": "full_url_here_or_null",
  "unsubscribe_method": "link/email/other_or_null"
}
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 300,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(response);
  } catch (error) {
    console.error('Error analyzing email:', error);
    return {
      category_id: null,
      summary: 'Unable to analyze email content',
      unsubscribe_url: null,
      unsubscribe_method: null,
    };
  }
}