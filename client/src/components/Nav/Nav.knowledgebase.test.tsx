import { render, screen } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import Nav from './Nav';
import { knowledgeBasesState } from '~/store/knowledgeBases';

jest.mock('@librechat/client', () => ({ useMediaQuery: () => false }), { virtual: true });
jest.mock('librechat-data-provider', () => ({ PermissionTypes: {}, Permissions: {} }), { virtual: true });
jest.mock('~/store', () => {
  const { atom } = require('recoil');
  return {
    search: atom({
      key: 'search',
      default: { query: '', debouncedQuery: '', isTyping: false, enabled: false },
    }),
  };
});
jest.mock('~/utils', () => ({ cn: (...classes) => classes.filter(Boolean).join(' ') }));

jest.mock('~/hooks', () => ({
  useLocalize: () => (key: string) => key,
  useHasAccess: () => false,
  useAuthContext: () => ({ isAuthenticated: true }),
  useLocalStorage: () => [false, jest.fn()],
  useNavScrolling: () => ({ moveToTop: jest.fn() }),
}));

jest.mock('~/data-provider', () => ({
  useConversationsInfiniteQuery: () => ({
    data: { pages: [{ conversations: [] }] },
    fetchNextPage: jest.fn(),
    isFetchingNextPage: false,
    isLoading: false,
    isFetching: false,
    refetch: jest.fn(),
  }),
}));

jest.mock('./SearchBar', () => () => <div />);
jest.mock('./NewChat', () => () => <div />);
jest.mock('./NewKnowledgeBase', () => () => <div />);
jest.mock('./AgentMarketplaceButton', () => () => <div />);
jest.mock('./Bookmarks/BookmarkNav', () => () => <div />);
jest.mock('./AccountSettings', () => () => <div />);

jest.mock('~/components/Conversations', () => ({
  Conversations: () => <div data-testid="conversations" />,
}));

test('renders knowledge bases above conversations', () => {
  const initializeState = ({ set }) => {
    set(knowledgeBasesState, [{ id: 'kb-1', name: 'KB', conversations: [{ id: '1', title: 'Chat' }] }]);
  };

  render(
    <RecoilRoot initializeState={initializeState}>
      <Nav navVisible={true} setNavVisible={() => {}} />
    </RecoilRoot>,
  );

  expect(screen.getByText('KB')).toBeInTheDocument();
  expect(screen.getByTestId('conversations')).toBeInTheDocument();
});

