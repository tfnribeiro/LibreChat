import React, { useMemo } from 'react';
import type { MinimalConversation, TMessage } from 'librechat-data-provider';
import { MessageSquare } from 'lucide-react';
import { Button } from '@librechat/client';
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

  // Fetch first message for preview (oldest by createdAt)
  const { data: messagesData } = useMessagesInfiniteQuery(
    {
      conversationId: id,
      sortBy: 'createdAt',
      sortDirection: 'asc',
      pageSize: 1,
    },
    {
      enabled: Boolean(id),
    },
  );

  const firstMessage: TMessage | undefined = useMemo(() => {
    const page = messagesData?.pages?.[0];
    return page?.messages?.[0];
  }, [messagesData]);

  return (
    <div
      className="group relative flex h-32 w-full cursor-pointer flex-col overflow-hidden rounded-md border border-border-medium bg-surface-secondary p-2 shadow-sm transition-all duration-200 hover:shadow-md"
      onClick={() => onClick?.(convo)}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="line-clamp-1 text-sm font-medium text-text-primary">
          {convo.title ?? 'New Chat'}
        </h4>
        <div className="ml-2 inline-flex items-center gap-1 text-xs text-text-secondary">
          <MessageSquare className="icon-sm" aria-hidden="true" />
          <span>{messageCount ?? '—'}</span>
        </div>
      </div>

      <p className="mt-1 line-clamp-2 text-xs text-text-secondary">
        {firstMessage?.text ?? ' '} {/* reserve space to keep height consistent */}
      </p>

      <div className="mt-auto flex items-center justify-end">
        <Button className="opacity-0 group-hover:opacity-100" onClick={() => onClick?.(convo)}>
          Open
        </Button>
      </div>

      {/* Hover overlay */}
      <div className="pointer-events-none absolute inset-0 hidden items-center justify-center bg-black/30 group-hover:flex">
        <span className="text-sm font-medium text-white">Open conversation</span>
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
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {conversations.map((convo) => (
        <ConversationTile
          key={convo.conversationId ?? convo.updatedAt}
          convo={convo}
          onClick={onConversationClick}
        />
      ))}
    </div>
  );
}
