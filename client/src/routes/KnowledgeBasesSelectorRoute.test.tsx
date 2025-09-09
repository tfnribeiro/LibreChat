import { render, screen } from '@testing-library/react';
import KnowledgeBasesSelectorRoute from './KnowledgeBasesSelectorRoute';

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

jest.mock('~/data-provider', () => ({
  useKnowledgeBasesQuery: () => ({ data: [{ id: '1', name: 'KB1' }], isLoading: false }),
  dataService: { createKnowledgeBase: jest.fn().mockResolvedValue({ _id: '2', name: 'KB2' }) },
  QueryKeys: { knowledgeBases: 'knowledgeBases' },
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}));

jest.mock(
  '@librechat/client',
  () => ({
    Button: ({ children, ...props }) => <button {...props}>{children}</button>,
    OGDialog: ({ open, children }) => (open ? <div>{children}</div> : null),
    OGDialogTemplate: ({ title, main, buttons }) => (
      <div>
        <div>{title}</div>
        <div>{main}</div>
        <div>{buttons}</div>
      </div>
    ),
    Input: (props) => <input {...props} />,
    Label: (props) => <label {...props} />,
    useToastContext: () => ({ showToast: jest.fn() }),
  }),
  { virtual: true },
);

jest.mock('lucide-react', () => ({
  Plus: () => <div>plus</div>,
  Folder: () => <div>folder</div>,
}));

jest.mock('~/hooks', () => ({
  useLocalize: () => (key: string) => {
    const map: Record<string, string> = {
      com_ui_select_kb: 'Select KB',
      com_ui_no_kbs: 'No KBs',
      com_ui_new_knowledge_base: 'Create KB',
      com_ui_name: 'Name',
      com_ui_create: 'Create',
    };
    return map[key] || key;
  },
}));

test('renders knowledge base list and create button', () => {
  render(<KnowledgeBasesSelectorRoute />);
  expect(screen.getByText('Select KB')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /KB1/ })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Create KB/ })).toBeInTheDocument();
});

