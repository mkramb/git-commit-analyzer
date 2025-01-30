import { resolve } from 'path';
import { simpleGit, SimpleGit, LogResult } from 'simple-git';
import createDebug from 'debug';

const debug = createDebug('app:export-history');
const GIT_OPERATIONS_MAX_CONCURRENCY = +(process.env.GIT_OPERATIONS_MAX_CONCURRENCY ?? 2);

export interface CommitHistory {
  hash: string;
  date: string;
  author_name: string;
  author_email: string;
  message: string;
  files: string[];
}

export async function* exportHistory(repositoryPath: string): AsyncGenerator<CommitHistory> {
  debug('Arguments', { repositoryPath, GIT_OPERATIONS_MAX_CONCURRENCY });

  const git: SimpleGit = simpleGit({
    maxConcurrentProcesses: GIT_OPERATIONS_MAX_CONCURRENCY,
    baseDir: resolve(repositoryPath),
    binary: 'git',
  });

  let page = 0;
  const pageSize = 100;

  while (true) {
    debug(`Fetching commits, page: ${page}`);

    let logResult: LogResult;

    try {
      logResult = await git.log({
        '--skip': page * pageSize,
        '--max-count': pageSize,
      });
    } catch (error) {
      debug('Error fetching commits:', error);
      throw error;
    }

    if (logResult.all.length === 0) {
      return;
    }

    for (const commit of logResult.all) {
      if (!commit.hash) continue;

      let changedFiles: string[] = [];
      try {
        const diffSummary = await git.diffSummary([`${commit.hash}^`, commit.hash]);
        changedFiles = diffSummary.files.map((fileObj) => fileObj.file);
      } catch {}

      const info: CommitHistory = {
        hash: commit.hash,
        date: commit.date,
        author_name: commit.author_name,
        author_email: commit.author_email,
        message: commit.message,
        files: changedFiles,
      };

      yield info;
    }

    page++;
  }
}
