import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NewProject from './NewProject';

jest.mock(
  '@librechat/client',
  () => ({
    TooltipAnchor: ({ description, render }) => (
      <div title={description}>{render}</div>
    ),
    Button: (props) => <button {...props} />,
  }),
  { virtual: true },
);

jest.mock('~/hooks', () => ({
  useLocalize: () => (key: string) => {
    const map = { com_ui_new_project: 'Create new project' } as Record<string, string>;
    return map[key] || key;
  },
}));

test('renders button with create new project tooltip', () => {
  render(
    <BrowserRouter>
      <NewProject toggleNav={() => {}} />
    </BrowserRouter>,
  );
  const button = screen.getByRole('button', { name: /create new project/i });
  expect(button).toBeInTheDocument();
});
