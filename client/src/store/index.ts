import * as artifacts from './artifacts';
import families from './families';
import endpoints from './endpoints';
import user from './user';
import text from './text';
import toast from './toast';
import submission from './submission';
import search from './search';
import preset from './preset';
import prompts from './prompts';
import lang from './language';
import { knowledgeBasesState } from './knowledgeBases';
import settings from './settings';
import misc from './misc';
import isTemporary from './temporary';
import * as projects from './projects';
export * from './agents';

export default {
  ...artifacts,
  ...families,
  ...endpoints,
  ...user,
  ...text,
  ...toast,
  ...submission,
  ...search,
  ...knowledgeBasesState,
  ...prompts,
  ...preset,
  ...lang,
  ...settings,
  ...misc,
  ...isTemporary,
  ...projects,
};
