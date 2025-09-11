import React from 'react';
import type { MinimalConversation } from 'librechat-data-provider';
import { MessageSquare } from 'lucide-react';
import { useGetConvoIdQuery, useMessagesInfiniteQuery } from '~/data-provider/queries';

type ConversationsMosaicViewProps = {
  conversations: MinimalConversation[];
  onConversationClick?: (convo: MinimalConversation) => void;
};

function ConversationTile({
  convo,
  onClick,
}: {
  convo: MinimalConversation;
  onClick?: (convo: MinimalConversation) => void;
}) {
  const id = convo.conversationId ?? '';

  // Fetch conversation details to get message count (ids array length)
  const { data: convoDetails } = useGetConvoIdQuery(id, {
    enabled: Boolean(id),
  });

  const messageCount = convoDetails?.messages?.length ?? undefined;

  return (
    <div
      className="group relative flex min-h-[3rem] w-full cursor-pointer flex-col overflow-hidden rounded-md border border-border-medium bg-surface-secondary p-2 shadow-sm transition-all duration-200 hover:shadow-md"
      onClick={() => onClick?.(convo)}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center justify-between gap-2">
        <h4 className="truncate text-sm font-medium text-text-primary">
          {convo.title ?? 'New Chat'}
        </h4>
        <div className="ml-2 inline-flex items-center gap-1 whitespace-nowrap text-xs text-text-secondary">
          <MessageSquare className="icon-sm" aria-hidden="true" />
          <span>{messageCount ?? '—'}</span>
        </div>
      </div>
    </div>
  );
}

export default function ConversationsMosaicView({
  conversations,
  onConversationClick,
}: ConversationsMosaicViewProps) {
  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-text-secondary">No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {conversations.map((convo) => (
          <ConversationTile
            key={convo.conversationId ?? convo.updatedAt}
            convo={convo}
            onClick={onConversationClick}
          />
        ))}
      </div>
    </div>
  );
}
