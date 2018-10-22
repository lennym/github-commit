# @lennym/commit

API for committing file changes to github

## Usage

To write content to a file on the default branch:

```js
const Git = require('@lennym/commit');

const git = Git({
  repo: 'lennym/test-repo',
  token: 'YOUR_GITHUB_ACCESS_TOKEN'
});

git
  .add('file.txt', 'File content')
  .commit('Set file content')
  .push()
  .then(() => console.log('All done'));
```

### Branches

To write to a branch other than the default branch for the repo:

```js
const git = Git({
  repo: 'lennym/test-repo',
  token: '...',
  branch: 'development'
});

git
  .add('file.txt', 'File content')
  .commit('Set file content')
  .push()
  .then(() => console.log('All done'));
```

To create a new branch:

```js
const git = Git({
  repo: 'lennym/test-repo',
  token: '...'
});

git
  .branch('my-new-branch')
  .add('file.txt', 'File content')
  .commit('Set file content')
  .push()
  .then(() => console.log('All done'));
```

### Editing multiple files

To add mutltiple files in one commit:

```js
const git = Git({
  repo: 'lennym/test-repo',
  token: '...'
});

git
  .add('file1.txt', 'File 1 content')
  .add('file2.txt', 'File 2 content')
  .commit('Set multiple file content')
  .push()
  .then(() => console.log('All done'));
```

To add mutltiple files in multiple commits:

```js
const git = Git({
  repo: 'lennym/test-repo',
  token: '...'
});

git
  .add('file1.txt', 'File 1 content')
  .commit('Update file 1')
  .add('file2.txt', 'File 2 content')
  .commit('Update file 2')
  .push()
  .then(() => console.log('All done'));
```
