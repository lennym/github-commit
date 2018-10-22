const assert = require('assert');
const GitHub = require('@octokit/rest');
const debug = require('debug')('github-commit');

class Commit {

  constructor({ repo, branch, token }) {

    assert(repo, '`repo` is required');
    assert(token, '`token` is required');

    Object.defineProperty(this, 'repo', { value: repo });
    Object.defineProperty(this, 'token', { value: token });

    Object.defineProperty(this, '_branch', { value: branch, configurable: true });
    Object.defineProperty(this, '_changes', { value: {}, writable: true });
    Object.defineProperty(this, '_commits', { value: [], writable: true });
    Object.defineProperty(this, '_queue', { value: Promise.resolve(), writable: true });

  }

  getBranch () {
    if (this._branch) {
      return Promise.resolve(this._branch);
    }
    return this.performGitAction('get', {}, 'repos')
      .then(repo => {
        Object.defineProperty(this, '_branch', { value: repo.default_branch, configurable: true });
        return this._branch;
      });
  }

  branch (name) {
    this._queue = this._queue
      .then(() => {
        if (!this._commits.length) {
          return this.getHeadSHA();
        }
      })
      .then(() => {
        Object.defineProperty(this, '_branch', { value: name, configurable: true });
        Object.defineProperty(this, '_isBranch', { value: true });
      });

    return this;
  }

  getHeadSHA () {
    if (this._commits.length) {
      return Promise.resolve(this._commits[this._commits.length - 1]);
    }
    return this.getBranch()
      .then(branch => {
        const params = {
          ref: `heads/${branch}`
        };
        return this.performGitAction('getReference', params)
      })
      .then(ref => ref.object.sha)
      .then(sha => {
        this._commits.push(sha);
        return sha;
      });
  }

  createBlob (content) {
    const params = {
      content,
      encoding: 'utf-8'
    };
    return this.performGitAction('createBlob', params);
  }

  add (path, content = '') {
    this._queue = this._queue
      .then(() => {
        this._changes[path] = content;
      });

    return this;
  }

  buildTree (sha) {
    const blobs = Object.keys(this._changes)
      .reduce((p, path) => {
        return p
          .then(list => {
            return this.createBlob(this._changes[path])
              .then(blob => blob.sha)
              .then(sha => {
                return {
                  mode: '100644',
                  type: 'blob',
                  path,
                  sha
                };
              })
              .then(file => ([...list, file]));
          });
      }, Promise.resolve([]));

    return blobs
      .then(tree => {
        return this.performGitAction('createTree', { tree, base_tree: sha });
      })
      .then(tree => tree.sha);
  }

  commit (message) {
    this._queue = this._queue
      .then(() => {
        return this.getHeadSHA();
      })
      .then(sha => {
        return this.buildTree(sha)
          .then(tree => {
            return {
              tree,
              parents: [ sha ],
              message
            };
          });
      })
      .then(params => {
        return this.performGitAction('createCommit', params);
      })
      .then(commit => {
        this._changes = {};
        this._commits.push(commit.sha);
      });

    return this;
  }

  push (branch) {
    this._queue = this._queue
      .then(() => this.getBranch())
      .then(root => {
        const params = {
          ref: `heads/${branch || root}`,
          sha: this._commits[this._commits.length - 1]
        };
        const action = this._isBranch ? 'createReference' : 'updateReference';
        if (this._isBranch) {
          params.ref = `refs/${params.ref}`;
        }
        return this.performGitAction(action, params);
      });
    return this;
  }

  splitRepo() {
    return {
      owner: this.repo.split('/')[0],
      repo: this.repo.split('/')[1]
    };
  }

  performGitAction (action, params = {}, scope = 'gitdata') {
    const github = new GitHub();
    const repo = this.splitRepo();
    debug(action, { ...params, ...repo });
    github.authenticate({ type: 'token', token: this.token });
    return github[scope][action]({ ...params, ...repo })
      .then(response => response.data);
  }

  then (resolver, rejecter) {
    return this._queue.then(resolver, rejecter);
  }

  catch (rejecter) {
    return this._queue.catch(rejecter);
  }

}

module.exports = params => new Commit(params);
