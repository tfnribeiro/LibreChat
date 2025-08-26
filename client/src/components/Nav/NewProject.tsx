import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TooltipAnchor, Button } from '@librechat/client';
import { FolderPlus } from 'lucide-react';
import { useLocalize } from '~/hooks';

export default function NewProject({
  toggleNav,
  isSmallScreen,
}: {
  toggleNav: () => void;
  isSmallScreen?: boolean;
}) {
  const navigate = useNavigate();
  const localize = useLocalize();

  const clickHandler = useCallback(() => {
    navigate('/projects/new/c/new');
    if (isSmallScreen) {
      toggleNav();
    }
  }, [navigate, isSmallScreen, toggleNav]);

  return (
    <TooltipAnchor
      description={localize('com_ui_new_project')}
      render={
        <Button
          size="icon"
          variant="outline"
          aria-label={localize('com_ui_new_project')}
          className="rounded-full border-none bg-transparent p-2 hover:bg-surface-hover md:rounded-xl"
          onClick={clickHandler}
        >
          <FolderPlus className="icon-lg text-text-primary" />
        </Button>
      }
    />
  );
}
