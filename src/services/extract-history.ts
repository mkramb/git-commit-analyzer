import { resolve } from 'path';
import { Readable } from 'stream';
import { simpleGit } from 'simple-git';
import createDebug from 'debug';

const debug = createDebug('service/export-history');
const MAX_CONCURRENCY = +(process.env.MAX_CONCURRENCY ?? 10);

export interface CommitHistory {
  date: string;
  author_name: string;
  author_email: string;
  message: string;
}

export const exportHistory = async (repositoryName: string, repositoryPath: string) => {
  debug('Arguments', {
    repositoryName,
    repositoryPath,
    MAX_CONCURRENCY,
  });

  debug('Fetching git history');

  const git = simpleGit({
    maxConcurrentProcesses: MAX_CONCURRENCY,
    baseDir: resolve(repositoryPath),
    binary: 'git',
  });

  const stream = new Readable({
    objectMode: true,
    read() {}, // No-op, we'll push data manually
  });

  debug('Starting processing of commits');

  const history = await git.log();

  for (const commit of history.all) {
    const info: CommitHistory = {
      date: commit.date,
      author_name: commit.author_name,
      author_email: commit.author_email,
      message: commit.message,
    };

    stream.push(info);
  }

  // Signal the end of the stream
  stream.push(null);

  return stream;
};
