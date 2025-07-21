import { NextApiRequest, NextApiResponse } from 'next';
import { chromium } from 'playwright';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { unsubscribeList } = req.body;

    if (!Array.isArray(unsubscribeList)) {
        return res.status(400).json({ error: 'Invalid request' });
    }

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    let successCount = 0;

    for (const { unsubscribe_url } of unsubscribeList) {
        try {
            await page.goto(unsubscribe_url, { waitUntil: 'domcontentloaded', timeout: 15000 });
            // You can expand this: fill checkboxes, click buttons, etc.
            console.log(`Visited: ${unsubscribe_url}`);
            successCount++;
        } catch (err) {
            console.warn(`Failed to process ${unsubscribe_url}:`, err);
        }
    }

    await browser.close();

    res.status(200).json({ success: true, successCount });
}
