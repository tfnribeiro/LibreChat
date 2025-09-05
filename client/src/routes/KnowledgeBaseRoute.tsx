import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Files } from 'lucide-react';
import ChatRoute from './ChatRoute';
import DragDropWrapper from '~/components/Chat/Input/Files/DragDropWrapper';
import { useLocalize } from '~/hooks';
import { useKnowledgeBaseConversationsQuery, useKnowledgeBasesQuery } from '~/data-provider';
export default function KnowledgeBaseRoute({}: KnowledgeBaseRouteProps = {}) {
  const localize = useLocalize();
  const { kbId = '', conversationId = null } = useParams();
  const [files] = useState([]);
  const { data, isLoading, isError, fetchNextPage, hasNextPage } =
    useKnowledgeBaseConversationsQuery(kbId, { limit: 20 });
  const conversations = data?.pages.flatMap((p) => p.conversations) ?? [];

  const { data: knowledgeBasesData } = useKnowledgeBasesQuery();
  const activeKB = useMemo(() => {
    if (!knowledgeBasesData || !kbId) return null;
    return knowledgeBasesData.find((kb) => kb.id === kbId || kb.name === kbId) || null;
  }, [knowledgeBasesData, kbId]);

  return (
    <div className="flex h-full w-full flex-col">
      {conversationId ? (
        <div className="flex flex-1 flex-col">
          <ChatRoute />
        </div>
      ) : (
        <div className="flex flex-1 flex-col">
          <h1>HumaRAG</h1>
          <p>Welcome to your collection: {activeKB.name}</p>
        </div>
      )}

      <div className="border-border-subtle flex flex-col gap-4 border-t p-4">
        <DragDropWrapper className="border-border-subtle flex items-center justify-center rounded-md border border-dashed p-4">
          {files.length === 0 ? (
            <div className="flex flex-col items-center text-text-secondary">
              <Files data-testid="file-icon" className="mb-2 h-12 w-12" />
              <p className="text-sm">{localize('com_ui_drag_drop_kb')}</p>
            </div>
          ) : (
            <ul className="text-sm text-text-secondary">
              {files.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          )}
        </DragDropWrapper>
        {conversations && (
          <div className="max-h-40 min-h-32 overflow-y-auto">
            <h3 className="mb-2 text-sm font-medium">{localize('com_ui_past_chats')}</h3>
            {conversations.length === 0 ? (
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>{localize('com_ui_no_chats_yet')}</li>
              </ul>
            ) : (
              <ul className="space-y-2 text-sm text-text-secondary">
                {conversations.map((c) => (
                  <li key={c.id}>
                    <Link to={`/knowledge-bases/${kbId}/c/${c.conversationId}`}>{c.title}</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
