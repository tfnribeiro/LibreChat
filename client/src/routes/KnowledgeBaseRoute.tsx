import { useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import ChatRoute from './ChatRoute';
import { useLocalize } from '~/hooks';
import { useKnowledgeBaseConversationsQuery, useKnowledgeBasesQuery } from '~/data-provider';
import FilesMosaicView from '~/components/Files/FileList/MosaicView';
import ConversationsMosaicView from '~/components/Conversations/ConversationsMosaicView';

export default function KnowledgeBaseRoute({}: KnowledgeBaseRouteProps = {}) {
  const localize = useLocalize();
  const navigate = useNavigate();
  const { kbId = '', conversationId = null } = useParams();
  const location = useLocation();
  const kbNameFromState = (location.state as { kbName?: string } | null)?.kbName;
  const { data } = useKnowledgeBaseConversationsQuery(kbId, { limit: 20 });
  const conversations = data?.pages.flatMap((p) => p.conversations) ?? [];

  const { data: knowledgeBasesData } = useKnowledgeBasesQuery();
  const activeKB = useMemo(() => {
    if (!knowledgeBasesData || !kbId) return null;
    return knowledgeBasesData.find((kb) => kb.id === kbId || kb.name === kbId) || null;
  }, [knowledgeBasesData, kbId]);
  const files = activeKB?.files ?? [];

  const displayName = activeKB?.name || kbNameFromState || '';

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      {conversationId ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <ChatRoute />
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center pb-4 pt-8 text-center">
            <h1 className="text-3xl font-semibold leading-tight">HumaRAG</h1>
            {displayName && (
              <p className="mt-2 text-sm text-text-secondary">
                Welcome to your collection:{' '}
                <span className="font-medium text-text-primary">{displayName}</span>
              </p>
            )}
          </div>

          <div className="mx-auto w-full max-w-7xl px-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Files Column */}
              <div className="flex min-h-0 flex-col">
                <h3 className="mb-3 text-sm font-medium text-text-primary">
                  {localize('com_ui_kb_files')}
                </h3>
                <div className="max-h-[60vh] min-h-[10rem] overflow-y-auto rounded-md">
                  {files.length === 0 ? (
                    <div className="flex h-32 items-center justify-center rounded-md bg-transparent">
                      <p className="text-sm text-text-secondary">No files available</p>
                    </div>
                  ) : (
                    <FilesMosaicView
                      files={files}
                      onFileClick={(file) => console.log('File clicked:', file)}
                      gridClassName="grid grid-cols-1 gap-4"
                    />
                  )}
                </div>
              </div>

              {/* Conversations Column */}
              <div className="flex min-h-0 flex-col">
                <h3 className="mb-3 text-sm font-medium text-text-primary">
                  {localize('com_ui_past_chats')}
                </h3>
                <div className="max-h-[60vh] min-h-[10rem] overflow-y-auto rounded-md">
                  {conversations.length === 0 ? (
                    <div className="flex h-32 items-center justify-center rounded-md bg-transparent">
                      <p className="text-sm text-text-secondary">
                        {localize('com_ui_no_chats_yet')}
                      </p>
                    </div>
                  ) : (
                    <ConversationsMosaicView
                      conversations={conversations}
                      gridClassName="grid grid-cols-1 gap-3"
                      onConversationClick={(c) => {
                        if (!c.conversationId) return;
                        navigate(`/knowledge-bases/${kbId}/c/${c.conversationId}`);
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
