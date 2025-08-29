import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import NewProject from './NewProject';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock(
  '@librechat/client',
  () => ({
    TooltipAnchor: ({ description, render }) => <div title={description}>{render}</div>,
    Button: ({ children, ...props }) => <button {...props}>{children}</button>,
    OGDialog: ({ open, children }) => (open ? <div data-testid="dialog">{children}</div> : null),
    OGDialogTemplate: ({ title, main, buttons }) => (
      <div>
        <h1>{title}</h1>
        {main}
        {buttons}
      </div>
    ),
    Input: (props) => <input {...props} />,
    Label: (props) => <label {...props} />,
  }),
  { virtual: true },
);

jest.mock('~/hooks', () => ({
  useLocalize: () => (key: string) => {
    const map = {
      com_ui_new_project: 'Create new project',
      com_ui_name: 'Name',
      com_ui_create: 'Create',
    } as Record<string, string>;
    return map[key] || key;
  },
}));

beforeEach(() => {
  mockNavigate.mockReset();
});

test('opens modal and creates project', () => {
  render(
    <RecoilRoot>
      <BrowserRouter>
        <NewProject toggleNav={() => {}} />
      </BrowserRouter>
    </RecoilRoot>,
  );

  fireEvent.click(screen.getByRole('button', { name: /create new project/i }));

  const input = screen.getByLabelText(/name/i);
  fireEvent.change(input, { target: { value: 'Test Project' } });

  const createButton = screen.getAllByRole('button', { name: /create/i })[1];
  fireEvent.click(createButton);

  expect(mockNavigate).toHaveBeenCalledWith('/projects/Test%20Project/c/new');
});

