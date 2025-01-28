import { CommitHistory } from './extract-history';

export const importDocument = (commitHistory: CommitHistory) => {
  console.log('Received:', commitHistory);
};
