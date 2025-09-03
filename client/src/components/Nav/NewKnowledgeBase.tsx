import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TooltipAnchor,
  Button,
  OGDialog,
  OGDialogTemplate,
  Input,
  Label,
} from '@librechat/client';
import { FolderPlus } from 'lucide-react';
import { useLocalize } from '~/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useToastContext } from '@librechat/client';
import { dataService, QueryKeys } from 'librechat-data-provider';

export default function NewKnowledgeBase({
  toggleNav,
  isSmallScreen,
}: {
  toggleNav: () => void;
  isSmallScreen?: boolean;
}) {

  
  const navigate = useNavigate();
  const localize = useLocalize();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const queryClient = useQueryClient();
  const { showToast } = useToastContext();

  const createKnowledgeBase = useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    try {
      const kb = await dataService.createKnowledgeBase({name: trimmed});
      const displayId = kb.slug || kb._id || trimmed;
      const displayName = kb.name || trimmed;
      queryClient.invalidateQueries([QueryKeys.knowledgeBases]);
      navigate(`/knowledge-bases/${encodeURIComponent(displayId)}/c/new`);
    } catch (_e) {
      showToast({ message: localize('com_ui_kb_error'), status: 'error' })
    }

    if (isSmallScreen) {
      toggleNav();
    }
    setOpen(false);
    setName('');
  }, [name, navigate, isSmallScreen, toggleNav]);

  return (
    <>
      <TooltipAnchor
        description={localize('com_ui_new_knowledge_base')}
        render={
          <Button
            size="icon"
            variant="outline"
            aria-label={localize('com_ui_new_knowledge_base')}
            className="rounded-full border-none bg-transparent p-2 hover:bg-surface-hover md:rounded-xl"
            onClick={() => setOpen(true)}
          >
            <FolderPlus className="icon-lg text-text-primary" />
          </Button>
        }
      />
      <OGDialog open={open} onOpenChange={setOpen}>
        <OGDialogTemplate
          title={localize('com_ui_new_knowledge_base')}
          main={
            <div className="flex flex-col gap-2">
              <Label htmlFor="kb-name" className="text-left text-sm font-medium">
                {localize('com_ui_name')}
              </Label>
              <Input
                id="kb-name"
                value={name}
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

