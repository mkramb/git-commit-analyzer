import { resolve } from 'path';
import { Readable } from 'stream';
import { simpleGit, SimpleGit, LogResult } from 'simple-git';
import createDebug from 'debug';

const debug = createDebug('app:export-history');
const GIT_OPERATIONS_MAX_CONCURRENCY = +(process.env.MAX_CONCURRENCY ?? 2);

export interface CommitHistory {
  hash: string;
  date: string;
  author_name: string;
  author_email: string;
  message: string;
  files: string[];
}

export const exportHistory = (repositoryPath: string): Readable => {
  debug('Arguments', {
    repositoryPath,
    GIT_OPERATIONS_MAX_CONCURRENCY,
  });

  debug('Fetching git history');

  const git: SimpleGit = simpleGit({
    maxConcurrentProcesses: GIT_OPERATIONS_MAX_CONCURRENCY,
    baseDir: resolve(repositoryPath),
    binary: 'git',
  });

  const stream = new Readable({
    objectMode: true,
    read() {},
  });

  debug('Starting processing of commits');

  let page = 0;
  const pageSize = 100;

  const fetchCommits = async () => {
    try {
      const logResult: LogResult = await git.log({
        '--skip': page * pageSize,
        '--max-count': pageSize,
      });

      if (logResult.all.length === 0) {
        stream.push(null);
        return;
      }

      for (const commit of logResult.all) {
        if (!commit.hash) {
          continue;
        }

        let changedFiles: string[] = [];

        try {
          const diffSummary = await git.diffSummary([`${commit.hash}^`, commit.hash]);
          changedFiles = diffSummary.files.map((fileObj) => fileObj.file);
        } catch (error) {}

        const info: CommitHistory = {
          hash: commit.hash,
          date: commit.date,
          author_name: commit.author_name,
          author_email: commit.author_email,
          message: commit.message,
          files: changedFiles,
        };

        stream.push(info);
      }

      page++;
      fetchCommits();
    } catch (error) {
      debug('Error fetching commits:', error);
      stream.emit('error', error);
    }
  };

  fetchCommits();

  return stream;
};
