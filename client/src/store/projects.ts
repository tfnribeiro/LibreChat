import { atom } from 'recoil';

export type Project = {
  id: string;
  conversations: { id: string; title: string }[];
};

export const projectsState = atom<Project[]>({
  key: 'projectsState',
  default: [],
});

