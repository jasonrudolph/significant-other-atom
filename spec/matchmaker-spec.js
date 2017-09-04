/* global afterEach, beforeEach, describe, expect, it, runs, waitsFor, waitsForPromise */

const Matchmaker = require('../lib/matchmaker')
const fs = require('fs-plus')
const path = require('path')
const os = require('os')

// TODO Consider ditching the test names. Does Jasmine have an equivalent to
// just `example` in RSpec?

// TODO Consider drying up tests: We could define a custom jasmine expectation.
// Something like:
//   expect('foo/bar.rb').toHaveComplementaryPath('specs/foo/bar_spec.rb')
describe('finding the complementary path for a file', () => {
  let projectPath = path.join(os.tmpdir(), 'significant-other-test-fixture')

  let setupProject = (rootPath, filePaths) => {
    for (let i = 0; i < filePaths.length; i++) {
      let filePath = filePaths[i]
      filePath = path.join(rootPath, filePath)
      fs.writeFileSync(filePath)
    }

    atom.project.setPaths([rootPath])
  }

  let teardownProject = (path) => {
    let success = null

    // On Windows, you can not remove a watched directory/file, therefore we
    // have to close the project before attempting to delete. Unfortunately,
    // Pathwatcher's close function is also not synchronous. Once
    // atom/node-pathwatcher#4 is implemented this should be much cleaner.
    runs(() => {
      let repeat
      atom.project.setPaths([])
      repeat = setInterval(() => {
        try {
          fs.removeSync(path)
          clearInterval(repeat)
          success = true
        } catch (e) {
          success = false
        }
      }, 50)
    })

    waitsFor(() => success)
  }

  beforeEach(() => {
    waitsForPromise(() => atom.workspace.open())

    runs(() => {
      atom.packages.activatePackage('significant-other')
    })
  })

  afterEach(() => teardownProject(projectPath))

  describe('in a typical Atom package', () => {
    beforeEach(() => {
      // A representative sample of files from the release-notes package
      // (https://github.com/atom/release-notes/tree/v0.51.0)
      let filePaths = [
        'README.md',
        'lib/main.coffee',
        'lib/release-notes-status-bar.coffee',
        'lib/release-notes-view.coffee',
        'lib/release-notes.coffee',
        'menus/release-notes.cson',
        'package.json',
        'spec/fixtures/releases-response.json',
        'spec/release-notes-status-bar-spec.coffee',
        'spec/release-notes-view-spec.coffee',
        'styles/release-notes.less'
      ]
      setupProject(projectPath, filePaths)
    })

    it('finds spec for implementation file', () =>
      waitsForPromise(() =>
        Matchmaker.for('lib/release-notes-view.coffee').complementaryPath().then(complementaryPath =>
          expect(complementaryPath)
          .toBe(path.join(projectPath, 'spec/release-notes-view-spec.coffee'))
        )
      )
    )

    it('finds implementation file for spec', () =>
      waitsForPromise(() =>
        Matchmaker.for('spec/release-notes-view-spec.coffee').complementaryPath().then(complementaryPath =>
          expect(complementaryPath)
          .toBe(path.join(projectPath, 'lib/release-notes-view.coffee'))
        )
      )
    )
  })

  // See https://github.com/BinaryMuse/atom-mocha-test-runner/blob/v1.0.1/lib/create-runner.js#L9
  describe("in a project using atom-mocha-test-runner's default test suffixes", () => {
    beforeEach(() => {
      // A representative sample of files from the atom/github package
      // (https://github.com/atom/github/tree/v0.3.4/lib)
      let filePaths = [
        'README.md',
        'lib/git-prompt-server.js',
        'lib/models/hunk.js',
        'lib/views/hunk-view.js',
        'package.json',
        'styles/hunk-view.less',
        'test/git-prompt-server.test.js',
        'test/views/hunk-view.test.js'
      ]
      setupProject(projectPath, filePaths)
    })

    it('finds spec for implementation file', () =>
      waitsForPromise(() =>
        Matchmaker.for('lib/views/hunk-view.js').complementaryPath().then(complementaryPath =>
          expect(complementaryPath)
          .toBe(path.join(projectPath, 'test/views/hunk-view.test.js'))
        )
      )
    )

    it('finds implementation file for spec', () =>
      waitsForPromise(() =>
        Matchmaker.for('test/views/hunk-view.test.js').complementaryPath().then(complementaryPath =>
          expect(complementaryPath)
          .toBe(path.join(projectPath, 'lib/views/hunk-view.js'))
        )
      )
    )
  })

  describe('in a typical Ruby gem', () => {
    beforeEach(() => {
      // A representative sample of files from the Octokit gem
      // (https://github.com/octokit/octokit.rb/tree/v3.5.2)
      let filePaths = [
        'README.md',
        'lib/octokit/client/authorizations.rb',
        'lib/octokit/client/pull_requests.rb',
        'lib/octokit/client.rb',
        'lib/octokit/version.rb',
        'lib/octokit.rb',
        'octokit.gemspec',
        'spec/helper.rb',
        'spec/client/authorizations_spec.rb',
        'spec/client/pull_requests_spec.rb',
        'spec/client_spec.rb',
        'spec/octokit_spec.rb'
      ]
      setupProject(projectPath, filePaths)
    })

    it('finds test for implementation file', () =>
      waitsForPromise(() =>
        Matchmaker.for('lib/octokit.rb').complementaryPath().then(complementaryPath =>
          expect(complementaryPath)
          .toBe(path.join(projectPath, 'spec/octokit_spec.rb'))
        )
      )
    )

    it('finds implementation file for test', () =>
      waitsForPromise(() =>
        Matchmaker.for('spec/octokit_spec.rb').complementaryPath().then(complementaryPath =>
          expect(complementaryPath)
          .toBe(path.join(projectPath, 'lib/octokit.rb'))
        )
      )
    )

    it('finds test for nested implementation file', () =>
      waitsForPromise(() =>
        Matchmaker.for('lib/octokit/client/pull_requests.rb').complementaryPath().then(complementaryPath =>
          expect(complementaryPath)
          .toBe(path.join(projectPath, 'spec/client/pull_requests_spec.rb'))
        )
      )
    )

    it('finds nested implementation file for test', () =>
      waitsForPromise(() =>
        Matchmaker.for('spec/client/pull_requests_spec.rb').complementaryPath().then(complementaryPath =>
          expect(complementaryPath)
          .toBe(path.join(projectPath, 'lib/octokit/client/pull_requests.rb'))
        )
      )
    )
  })

  describe('in a typical Rails app', () => {
    beforeEach(() => {
      let filePaths = [
        'README.md',
        'app/controllers/application_controller.rb',
        'app/controllers/comments_controller.rb',
        'app/controllers/posts_controller.rb',
        'app/helpers/application_helper.rb',
        'app/helpers/comments_helper.rb',
        'app/helpers/posts_helper.rb',
        'app/models/comment.rb',
        'app/models/post.rb',
        'test/controllers/comments_controller_test.rb',
        'test/controllers/posts_controller_test.rb',
        'test/helpers/comments_helper_test.rb',
        'test/helpers/posts_helper_test.rb',
        'test/models/comment_test.rb',
        'test/models/post_test.rb'
      ]
      setupProject(projectPath, filePaths)
    })

    it('finds controller test for controller implementation', () =>
      waitsForPromise(() =>
        Matchmaker.for('app/controllers/posts_controller.rb').complementaryPath().then(complementaryPath =>
          expect(complementaryPath)
          .toBe(path.join(projectPath, 'test/controllers/posts_controller_test.rb'))
        )
      )
    )

    it('finds controller implementation for controller test', () =>
      waitsForPromise(() =>
        Matchmaker.for('test/controllers/posts_controller_test.rb').complementaryPath().then(complementaryPath =>
          expect(complementaryPath)
          .toBe(path.join(projectPath, 'app/controllers/posts_controller.rb'))
        )
      )
    )

    it('finds model test for model implementation', () =>
      waitsForPromise(() =>
        Matchmaker.for('app/models/post.rb').complementaryPath().then(complementaryPath =>
          expect(complementaryPath)
          .toBe(path.join(projectPath, 'test/models/post_test.rb'))
        )
      )
    )

    it('finds model implementation for model test', () =>
      waitsForPromise(() =>
        Matchmaker.for('test/models/post_test.rb').complementaryPath().then(complementaryPath =>
          expect(complementaryPath)
          .toBe(path.join(projectPath, 'app/models/post.rb'))
        )
      )
    )
  })

  describe('in the codebase that powers github.com', () => {
    beforeEach(() => {
      let filePaths = [
        'README.md',
        'app/api/gists.rb',
        'app/api/git_commits.rb',
        'test/integration/api/gists_test.rb.rb',
        'test/integration/api/git_commits_test.rb'
      ]
      setupProject(projectPath, filePaths)
    })

    it('finds API test for API implementation', () =>
      waitsForPromise(() =>
        Matchmaker.for('app/api/git_commits.rb').complementaryPath().then(complementaryPath =>
          expect(complementaryPath)
          .toBe(path.join(projectPath, 'test/integration/api/git_commits_test.rb'))
        )
      )
    )

    it('finds API implementation for API test', () =>
      waitsForPromise(() =>
        Matchmaker.for('test/integration/api/git_commits_test.rb').complementaryPath().then(complementaryPath =>
          expect(complementaryPath)
          .toBe(path.join(projectPath, 'app/api/git_commits.rb'))
        )
      )
    )
  })

  describe('when no complementary path exists', () => {
    beforeEach(() => {
      let filePaths = [
        'lib/main.coffee'
      ]
      setupProject(projectPath, filePaths)
    })

    it('resolves to null', () =>
      waitsForPromise(() =>
        Matchmaker.for('lib/main.coffee').complementaryPath().then(complementaryPath =>
          expect(complementaryPath).toBeNull()
        )
      )
    )
  })
})
