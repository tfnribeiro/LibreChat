import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Files } from 'lucide-react';
import ChatRoute from './ChatRoute';
import DragDropWrapper from '~/components/Chat/Input/Files/DragDropWrapper';
import { useLocalize } from '~/hooks';

interface ProjectRouteProps {
  testConversations?: { id: string; title: string }[];
  testFiles?: string[];
}

export default function ProjectRoute({
  testConversations = [],
  testFiles = [],
}: ProjectRouteProps = {}) {
  const localize = useLocalize();
  const { projectId = '' } = useParams();
  const [files] = useState(testFiles);
  const [conversations] = useState(testConversations);

  return (
    <div className="flex h-full w-full">
      <div className="flex flex-1 flex-col">
        <ChatRoute />
      </div>
      <aside className="border-border-subtle flex w-80 flex-col gap-4 border-l p-4">
        <DragDropWrapper className="border-border-subtle flex flex-1 items-center justify-center rounded-md border border-dashed">
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
        <div className="flex-1 overflow-y-auto">
          <h3 className="mb-2 text-sm font-medium">{localize('com_ui_past_chats')}</h3>
          {conversations.length === 0 ? (
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>{localize('com_ui_no_chats_yet')}</li>
            </ul>
          ) : (
            <ul className="space-y-2 text-sm text-text-secondary">
              {conversations.map((c) => (
                <li key={c.id}>
                  <Link to={`/projects/${projectId}/c/${c.id}`}>{c.title}</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
