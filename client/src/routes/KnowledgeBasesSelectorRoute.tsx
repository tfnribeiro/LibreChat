import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Folder } from 'lucide-react';
import {
  Button,
  OGDialog,
  OGDialogTemplate,
  Input,
  Label,
  useToastContext,
} from '@librechat/client';
import { useQueryClient } from '@tanstack/react-query';
import { dataService, QueryKeys } from 'librechat-data-provider';
import { useKnowledgeBasesQuery } from '~/data-provider';
import { useLocalize, useAuthContext } from '~/hooks';

export default function KnowledgeBasesSelectorRoute() {
  const navigate = useNavigate();
  const localize = useLocalize();
  const { isAuthenticated } = useAuthContext();
  const { data: kbs = [] } = useKnowledgeBasesQuery({ enabled: isAuthenticated });
  const mappedKBs = useMemo(
    () =>
      kbs.map((kb) => ({
        id: kb.slug || kb._id,
        name: kb.name,
        conversations: kb.conversations,
      })),
    [kbs],
  );

  const handleSelect = (kb: any) => {
    const displayId = kb.slug || kb.id || kb._id || kb.name;
    navigate(`/knowledge-bases/${encodeURIComponent(displayId)}/c/new`);
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-2xl font-semibold">{localize('com_ui_select_kb')}</h1>
      {mappedKBs.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {mappedKBs.map((kb) => (
            <Button
              key={kb.id || kb.name}
              variant="outline"
              className="flex h-40 w-40 flex-col items-center justify-center gap-2"
              onClick={() => handleSelect(kb)}
            >
              <Folder className="h-12 w-12" />
              <span className="text-lg">{kb.name}</span>
            </Button>
          ))}
          <CreateKnowledgeBaseCard />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <p className="text-text-secondary">{localize('com_ui_no_kbs')}</p>
          <CreateKnowledgeBaseCard />
        </div>
      )}
    </div>
  );
}

function CreateKnowledgeBaseCard() {
  const localize = useLocalize();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const { showToast } = useToastContext();
  const queryClient = useQueryClient();

  const createKnowledgeBase = useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    try {
      const kb = await dataService.createKnowledgeBase({ name: trimmed });
      const displayId = kb.slug || kb._id || trimmed;
      queryClient.invalidateQueries([QueryKeys.knowledgeBases]);
      navigate(`/knowledge-bases/${encodeURIComponent(displayId)}/c/new`);
    } catch (_e) {
      showToast({ message: localize('com_ui_kb_error'), status: 'error' });
    }
    setOpen(false);
    setName('');
  }, [name, navigate, queryClient, showToast, localize]);

  return (
    <>
      <Button
        variant="outline"
        className="overflow-wrap:break-word flex h-40 w-40 flex-col items-center justify-center gap-2"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-12 w-12" />
        <span className="text-lg">{localize('com_ui_new_knowledge_base')}</span>
      </Button>
      <OGDialog open={open} onOpenChange={setOpen}>
        <OGDialogTemplate
          title={localize('com_ui_new_knowledge_base')}
          main={
            <div className="overflow-wrap:break-word flex flex-col gap-2">
              <Label htmlFor="kb-name" className="text-left text-sm font-medium">
                {localize('com_ui_name')}
              </Label>
              <Input
                id="kb-name"
                value={name}
                style={{ overflowWrap: 'break-word' }}
                onChange={(e) => setName(e.target.value)}
                placeholder={localize('com_ui_new_knowledge_base')}
              />
            </div>
          }
          buttons={<Button onClick={createKnowledgeBase}>{localize('com_ui_create')}</Button>}
        />
      </OGDialog>
    </>
  );
}
