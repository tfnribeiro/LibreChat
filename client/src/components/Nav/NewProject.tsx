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
import { useSetRecoilState } from 'recoil';
import { FolderPlus } from 'lucide-react';
import { useLocalize } from '~/hooks';
import { projectsState, type Project } from '~/store/projects';

export default function NewProject({
  toggleNav,
  isSmallScreen,
}: {
  toggleNav: () => void;
  isSmallScreen?: boolean;
}) {
  const navigate = useNavigate();
  const localize = useLocalize();
  const setProjects = useSetRecoilState(projectsState);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const createProject = useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    setProjects((prev: Project[]) => [...prev, { id: trimmed, conversations: [] }]);
    navigate(`/projects/${encodeURIComponent(trimmed)}/c/new`);

    if (isSmallScreen) {
      toggleNav();
    }
    setOpen(false);
    setName('');
  }, [name, navigate, isSmallScreen, toggleNav, setProjects]);

  return (
    <>
      <TooltipAnchor
        description={localize('com_ui_new_project')}
        render={
          <Button
            size="icon"
            variant="outline"
            aria-label={localize('com_ui_new_project')}
            className="rounded-full border-none bg-transparent p-2 hover:bg-surface-hover md:rounded-xl"
            onClick={() => setOpen(true)}
          >
            <FolderPlus className="icon-lg text-text-primary" />
          </Button>
        }
      />
      <OGDialog open={open} onOpenChange={setOpen}>
        <OGDialogTemplate
          title={localize('com_ui_new_project')}
          main={
            <div className="flex flex-col gap-2">
              <Label htmlFor="project-name" className="text-left text-sm font-medium">
                {localize('com_ui_name')}
              </Label>
              <Input
                id="project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={localize('com_ui_new_project')}
              />
            </div>
          }
          buttons={<Button onClick={createProject}>{localize('com_ui_create')}</Button>}
        />
      </OGDialog>
    </>
  );
}
