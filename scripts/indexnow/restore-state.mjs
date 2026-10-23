import { execFileSync } from 'node:child_process';

const repository = process.env.GITHUB_REPOSITORY;
if (!repository || !/^[\w.-]+\/[\w.-]+$/.test(repository)) throw new Error('GITHUB_REPOSITORY is required');
// Artifacts work for deployment_status events even when the deployment ref is
// a commit SHA. Actions cache does not support these ref-less events.
const result = JSON.parse(execFileSync('gh', ['api', `repos/${repository}/actions/artifacts?name=indexnow-state&per_page=100`], { encoding: 'utf8' }));
const artifact = result.artifacts.filter((item) => !item.expired)
  .sort((a, b) => b.id - a.id)[0];
if (artifact) {
  execFileSync('gh', ['run', 'download', String(artifact.workflow_run.id), '--repo', repository, '--name', 'indexnow-state', '--dir', '.indexnow-state'], { stdio: 'inherit' });
  console.log(`Restored accepted fingerprints from run ${artifact.workflow_run.id}.`);
} else {
  console.log('No previous state; first submission includes all sitemap pages.');
}
