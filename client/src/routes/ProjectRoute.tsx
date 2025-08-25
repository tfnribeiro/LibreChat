import ChatRoute from './ChatRoute';
import DragDropWrapper from '~/components/Chat/Input/Files/DragDropWrapper';
import { useLocalize } from '~/hooks';

export default function ProjectRoute() {
  const localize = useLocalize();

  return (
    <div className="flex h-full w-full">
      <div className="flex flex-1 flex-col">
        <ChatRoute />
      </div>
      <aside className="border-border-subtle flex w-80 flex-col gap-4 border-l p-4">
        <DragDropWrapper className="border-border-subtle flex flex-1 items-center justify-center rounded-md border border-dashed">
          <p className="text-sm text-text-secondary">{localize('com_ui_drag_drop')}</p>
        </DragDropWrapper>
        <div className="flex-1 overflow-y-auto">
          <h3 className="mb-2 text-sm font-medium">{localize('com_ui_past_chats')}</h3>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li>{localize('com_ui_no_chats_yet')}</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
