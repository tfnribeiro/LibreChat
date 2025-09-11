import { useState, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Files } from 'lucide-react';
import ChatRoute from './ChatRoute';
import DragDropWrapper from '~/components/Chat/Input/Files/DragDropWrapper';
import { useLocalize } from '~/hooks';
import { useKnowledgeBaseConversationsQuery, useKnowledgeBasesQuery } from '~/data-provider';
import MosaicView from '~/components/Files/FileList/MosaicView';
import ConversationsMosaicView from '~/components/Conversations/ConversationsMosaicView';

export default function KnowledgeBaseRoute({}: KnowledgeBaseRouteProps = {}) {
  const localize = useLocalize();
  const navigate = useNavigate();
  const { kbId = '', conversationId = null } = useParams();
  const location = useLocation();
  const kbNameFromState = (location.state as { kbName?: string } | null)?.kbName;
  const { data, isLoading, isError, fetchNextPage, hasNextPage } =
    useKnowledgeBaseConversationsQuery(kbId, { limit: 20 });
  const conversations = data?.pages.flatMap((p) => p.conversations) ?? [];

  const { data: knowledgeBasesData } = useKnowledgeBasesQuery();
  const activeKB = useMemo(() => {
    if (!knowledgeBasesData || !kbId) return null;
    return knowledgeBasesData.find((kb) => kb.id === kbId || kb.name === kbId) || null;
  }, [knowledgeBasesData, kbId]);

  console.log(activeKB);
  const files = activeKB?.files ?? [];

  const displayName = activeKB?.name || kbNameFromState || '';

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      {conversationId ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <ChatRoute />
        </div>
      ) : (
        <div className="flex flex-1 flex-col">
          <h1>HumaRAG</h1>
          {displayName && <p>Welcome to your collection: {displayName}</p>}
        </div>
      )}

      <div className="border-border-subtle flex flex-col gap-4 border-t p-4">
        <h3 className="mb-2 text-sm font-medium">{localize('com_ui_kb_files')}</h3>
        <DragDropWrapper className="border-border-subtle flex items-center justify-center rounded-md border border-dashed p-4">
          {files.length === 0 ? (
            <div className="flex flex-col items-center text-text-secondary">
              <Files data-testid="file-icon" className="mb-2 h-12 w-12" />
              <p className="text-sm">{localize('com_ui_drag_drop_kb')}</p>
            </div>
          ) : (
            <MosaicView files={files} onFileClick={(file) => console.log('File clicked:', file)} />
          )}
        </DragDropWrapper>
        {conversations && !conversationId && (
          <div className="max-h-[50vh] overflow-y-auto">
            <h3 className="mb-2 text-sm font-medium">{localize('com_ui_past_chats')}</h3>
            {conversations.length === 0 ? (
              <div className="text-sm text-text-secondary">{localize('com_ui_no_chats_yet')}</div>
            ) : (
              <ConversationsMosaicView
                conversations={conversations}
                onConversationClick={(c) => {
                  if (!c.conversationId) return;
                  navigate(`/knowledge-bases/${kbId}/c/${c.conversationId}`);
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
