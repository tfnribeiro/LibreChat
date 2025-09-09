import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TooltipAnchor,
  Button,
} from '@librechat/client';
import { Home } from 'lucide-react';
import { useLocalize } from '~/hooks';

export default function HomeButton({
  toggleNav,
  isSmallScreen,
}: {
  toggleNav: () => void;
  isSmallScreen?: boolean;
}) {
  const navigate = useNavigate();
  const localize = useLocalize();

  const handleClick = useCallback(() => {
    navigate('/home');
    if (isSmallScreen) {
      toggleNav();
    }
  }, [navigate, isSmallScreen, toggleNav]);

  return (
    <TooltipAnchor
      description={localize('com_ui_home')}
      render={
        <Button
          size="icon"
          variant="outline"
          aria-label={localize('com_ui_home')}
          className="rounded-full border-none bg-transparent p-2 hover:bg-surface-hover md:rounded-xl"
          onClick={handleClick}
        >
          <Home className="icon-lg text-text-primary" />
        </Button>
      }
    />
  );
}