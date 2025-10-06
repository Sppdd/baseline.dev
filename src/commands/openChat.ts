/**
 * Open Chat Command - Opens the chat panel
 */

import { ChatPanel } from '../ui/ChatPanel';

export async function openChatCommand(chatPanel: ChatPanel): Promise<void> {
    await chatPanel.show();
}

