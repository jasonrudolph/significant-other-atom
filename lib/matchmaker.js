const _ = require('underscore-plus')
const pathUtils = require('path')
const {PathScanner} = require('scandal')

module.exports =
class Matchmaker {
  // Public: Construct a {Matchmaker} for the given path.
  //
  // * `path` A {String} representing the absolute path to the file whose
  //   "significant other" you're seeking.
  //
  // Returns a {Matchmaker}.
  static for (path) {
    return new Matchmaker(path)
  }

  constructor (path) {
    this.path = path
  }

  // Public: Get the complementary path (i.e., the path to the "significant
  // other").
  //
  // Returns a Promise that resolves to:
  // * the {String} representing the absolute path to the complementary file.
  // * `null` if no complementary path is found.
  complementaryPath () {
    return this.findComplementaryPath(atom.project.getPaths(), this.path)
  }

  // Internal: In the given directories, search for a complementary path for the
  // given matchee.
  //
  // The following examples demonstrate the algorithm used to perform the
  // search:
  //
  //   EXAMPLE A - Given a file at `app/models/post.rb`:
  //
  //   1. Examine the filename to determine whether it has a suffix that
  //      indicates that it is a test file. In this case, `post.rb` does not
  //      appear to be a test, so assume that it's an implementation file and
  //      that we're looking for its corresponding test file.
  //
  //   2. Drop the leading directory, and look for a file whose path matches:
  //
  //        `**/models/post?(_test|_spec|-spec).rb`
  //
  //     If such a file exists, use that file as the match. If no such file
  //     exists, continue to the next step.
  //
  //   3. Drop the leading directory used in the preceding step. Look for a file
  //      whose path matches:
  //
  //        `**/post?(_spec|_test).rb`
  //
  //     If such a file exists, use that file as the match. If no such file
  //     exists, then stop searching (since there are no more leading
  //     directories to drop).
  //
  //   EXAMPLE B - Given a file at `test/models/post_test.rb`:
  //
  //   1. Examine the filename to determine whether it has a suffix that
  //      indicates that it is a test file. In this case, `post_test.rb` does
  //      appear to be a test, so assume we're looking for its corresponding
  //      implementation file.
  //
  //   2. Drop the leading directory, and look for a file whose path matches:
  //
  //        `**/models/post.rb'
  //
  //     If such a file exists, use that file as the match. If no such file
  //     exists, continue to the next step.
  //
  //   3. Drop the leading directory used in the preceding step. Look for a file
  //      whose path matches:
  //
  //        `**/post.rb'
  //
  //     If such a file exists, use that file as the match. If no such file
  //     exists, then stop searching (since there are no more leading
  //     directories to drop).
  //
  // Returns a Promise.
  findComplementaryPath (directoriesToSearch, matcheePath, leadingDirectoriesToExclude = 1) {
    const relativeMatcheePath = atom.project.relativize(matcheePath)
    const partialMatcheePath = this.withoutLeadingDirectory(relativeMatcheePath, leadingDirectoriesToExclude)
    const directoryPattern = this.directoryPattern(partialMatcheePath)

    const basenamePattern = this.basenamePattern(relativeMatcheePath)
    const extensionPattern = pathUtils.extname(relativeMatcheePath)
    const filenamePattern = `${basenamePattern}${extensionPattern}`

    const pattern = [directoryPattern, filenamePattern].join(pathUtils.sep)

    const promise = new Promise((resolve) => {
      const matches = []

      // TODO Search all directories; not just the first one
      const scanner = new PathScanner(directoriesToSearch[0], {
        excludeVcsIgnores: true,
        inclusions: [pattern],
        exclusions: [relativeMatcheePath]
      })

      scanner.on('path-found', (path) => {
        matches.push(path)
        resolve(matches)
      })

      scanner.on('finished-scanning', () => {
        resolve(matches)
      })

      scanner.scan()
    })

    return promise.then((matches) => {
      if (matches.length > 0) {
        return matches[0]
      } else if (this.hasDirectory(partialMatcheePath)) {
        return this.findComplementaryPath(directoriesToSearch, matcheePath, leadingDirectoriesToExclude + 1)
      } else {
        return null
      }
    })
  }

  // Internal: Does the given path include at least one directory?
  //
  // Examples
  //
  //   this.hasDirectory('a/b.coffee')
  //   # => true
  //
  //   this.hasDirectory('b.coffee')
  //   # => false
  //
  // Returns a Boolean.
  hasDirectory (path) {
    return pathUtils.dirname(path) !== '.'
  }

  // Internal
  directoryPattern (path) {
    if (this.hasDirectory(path)) {
      const directoryPath = pathUtils.dirname(path)
      return ['**', directoryPath].join(pathUtils.sep)
    } else {
      return '**'
    }
  }

  // Internal
  withoutLeadingDirectory (path, leadingDirectoriesToExclude = 1) {
    const directoriesInPath = pathUtils.dirname(path).split(pathUtils.sep)
    const subdirectoriesInPath = _.rest(directoriesInPath, leadingDirectoriesToExclude)
    const basename = pathUtils.basename(path)

    return subdirectoriesInPath.concat(basename).join(pathUtils.sep)
  }

  // Internal
  basenamePattern (path) {
    const basename = pathUtils.basename(path, pathUtils.extname(path))

    // TODO Refactor and/or use better names or comments

    // If this file already ends with `_test` or `.test` or `_spec` or `-spec`,
    // then remove that from the name. If it does NOT end with `_test` or
    // `.test` or `_spec` or `-spec`, then add those items as optional suffixes
    // for the pattern.
    if (basename.match('(.test|_test|_spec|-spec)$')) {
      return basename.replace(new RegExp('(.test|_test|_spec|-spec)$'), '')
    } else {
      return `${basename}?(.test|_test|_spec|-spec)`
    }
  }
}
