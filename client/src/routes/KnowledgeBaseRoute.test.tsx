import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import KnowledgeBaseRoute from './KnowledgeBaseRoute';

jest.mock('./ChatRoute', () => () => <div>chat</div>);
jest.mock('@librechat/client', () => ({}), { virtual: true });
jest.mock('~/hooks', () => ({
  useLocalize: () => (key: string) => {
    const map = {
      com_ui_drag_drop: 'Drag files here',
      com_ui_past_chats: 'Past chats',
      com_ui_no_chats_yet: 'No chats yet',
    } as Record<string, string>;
    return map[key] || key;
  },
}));
jest.mock('~/components/Chat/Input/Files/DragDropWrapper', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

test('shows file icon and no chats message when empty', () => {
  render(
    <MemoryRouter initialEntries={['/knowledge-bases/test/c/new']}>
      <Routes>
        <Route path="/knowledge-bases/:kbId/c/:conversationId" element={<KnowledgeBaseRoute />} />
      </Routes>
    </MemoryRouter>,
  );
  expect(screen.getByTestId('file-icon')).toBeInTheDocument();
  expect(screen.getByText('No chats yet')).toBeInTheDocument();
});

test('renders conversation link when conversations exist', () => {
  const conversations = [{ id: '123', title: 'Previous Chat' }];
  render(
    <MemoryRouter initialEntries={['/knowledge-bases/test/c/new']}>
      <Routes>
        <Route
          path="/knowledge-bases/:kbId/c/:conversationId"
          element={<KnowledgeBaseRoute testConversations={conversations} />}
        />
      </Routes>
    </MemoryRouter>,
  );
  const link = screen.getByRole('link', { name: 'Previous Chat' });
  expect(link).toHaveAttribute('href', '/knowledge-bases/test/c/123');
});

