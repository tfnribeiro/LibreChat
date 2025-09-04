import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Files } from 'lucide-react';
import ChatRoute from './ChatRoute';
import DragDropWrapper from '~/components/Chat/Input/Files/DragDropWrapper';
import { useLocalize } from '~/hooks';
import { useKnowledgeBaseConversationsQuery } from '~/data-provider';

interface KnowledgeBaseRouteProps {
  testConversations?: { id: string; title: string }[];
  testFiles?: string[];
}

export default function KnowledgeBaseRoute({
  testConversations = [],
  testFiles = [],
}: KnowledgeBaseRouteProps = {}) {
  const localize = useLocalize();
  const { kbId = '' } = useParams();
  const [files] = useState(testFiles);
  const { data, fetchNextPage, isFetchingNextPage, isLoading } =
  useKnowledgeBaseConversationsQuery(kbId, { limit: 25 });

  const conversations = useMemo(
    () => (data?.pages ?? []).flatMap((page) => page.conversations),
    [data],
  );


  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex flex-1 flex-col">
        <ChatRoute />
      </div>
      <div className="border-border-subtle flex flex-col gap-4 border-t p-4">
        <DragDropWrapper className="border-border-subtle flex items-center justify-center rounded-md border border-dashed p-4">
          {files.length === 0 ? (
            <div className="flex flex-col items-center text-text-secondary">
              <Files data-testid="file-icon" className="mb-2 h-12 w-12" />
              <p className="text-sm">{localize('com_ui_drag_drop')}</p>
            </div>
          ) : (
            <ul className="text-sm text-text-secondary">
              {files.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          )}
        </DragDropWrapper>
        <div className="max-h-40 overflow-y-auto">
          <h3 className="mb-2 text-sm font-medium">{localize('com_ui_past_chats')}</h3>
          {conversations.length === 0 ? (
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>{localize('com_ui_no_chats_yet')}</li>
            </ul>
          ) : (
              <div>
                {isLoading && <div>Loading…</div>}
                {!isLoading && conversations.length === 0 && <div>{localize('com_ui_no_chats_yet')}</div>}
                <ul>
                  {conversations.map((c) => (
                    <li key={c.conversationId}>
                      <Link to={`/knowledge-bases/${encodeURIComponent(kbId)}/c/${c.conversationId}`}>{c.title}</Link>
                    </li>
                  ))}
                </ul>
              </div>
          )}
        </div>
      </div>
    </div>
  );
}

