import { google } from 'googleapis';
import { supabase } from './supabase';
import { analyzeEmail } from './openai';
import { createOAuth2Client } from './auth';

export class GmailService {
  private oauth2Client: any;

  constructor(accessToken: string, refreshToken: string) {
    this.oauth2Client = createOAuth2Client(accessToken, refreshToken);
  }

  async fetchNewEmails(historyId: string, accountId: string, userId: string) {
    try {
      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
      
      // Get user's categories
      const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId);

      if (!categories || categories.length === 0) {
        throw new Error('No categories found for user');
      }

      let nextPageToken = '';
      const allEmails = [];

      do {
        const response = await gmail.users.messages.list({
          userId: 'me',
          q: 'in:inbox',
          maxResults: 10,
          pageToken: nextPageToken || undefined,
        });

        if (response.data.messages) {
          allEmails.push(...response.data.messages);
        }

        nextPageToken = response.data.nextPageToken || '';
      } while (nextPageToken);

      // Process each email
      for (const message of allEmails.slice(0, 5)) { // Process first 5 for demo
        try {
          const emailDetails = await gmail.users.messages.get({
            userId: 'me',
            id: message.id!,
            format: 'full',
          });

          const email = emailDetails.data;
          const headers = email.payload?.headers || [];
          
          const subject = headers.find(h => h.name === 'Subject')?.value || '';
          const from = headers.find(h => h.name === 'From')?.value || '';
          const snippet = email.snippet || '';

          // Get full content
          let fullContent = '';
          if (email.payload?.body?.data) {
            fullContent = Buffer.from(email.payload.body.data, 'base64').toString();
          } else if (email.payload?.parts) {
            for (const part of email.payload.parts) {
              if (part.mimeType === 'text/plain' && part.body?.data) {
                fullContent += Buffer.from(part.body.data, 'base64').toString();
              }
            }
          }

          // Analyze with AI
          const analysis = await analyzeEmail(fullContent, categories);

          // Default to first category if no match
          const categoryId = analysis.category_id || categories[0].id;

          // Check if email already exists
          const { data: existingEmail } = await supabase
            .from('emails')
            .select('id')
            .eq('gmail_message_id', message.id!)
            .single();

          if (!existingEmail) {
            // Save to database
            await supabase.from('emails').insert({
              user_id: userId,
              account_id: accountId,
              category_id: categoryId,
              subject,
              sender: from,
              snippet,
              summary: analysis.summary,
              unsubscribe_url: analysis.unsubscribe_url,
              full_content: fullContent,
              gmail_message_id: message.id!,
            });

            // Archive the email
            await gmail.users.messages.modify({
              userId: 'me',
              id: message.id!,
              requestBody: {
                removeLabelIds: ['INBOX'],
              },
            });
          }
        } catch (emailError) {
          console.error('Error processing email:', emailError);
        }
      }

      return { success: true, processed: allEmails.length };
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  }
}