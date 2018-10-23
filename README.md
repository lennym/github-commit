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

### Updating multiple files

To update multiple files in one commit:

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

To update multiple files in multiple commits:

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

### Non-text files

To add a non-text file, pass a `Buffer` instead of a string to `add`:

```js
const img = fs.readFileSync('./some-image.png');

const git = Git({
  repo: 'lennym/test-repo',
  token: '...'
});

git
  .add('image.png', img)
  .commit('Add image file')
  .push()
  .then(() => console.log('All done'));
```

## Other actions

### Get the hash of the latest commit

```js
const git = Git({
  repo: 'lennym/test-repo',
  token: '...'
});

git.head()
  .then(sha => console.log(sha));
```
