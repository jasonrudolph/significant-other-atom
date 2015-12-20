_ = require 'underscore-plus'
pathUtils = require 'path'
{PathScanner} = require 'scandal'

module.exports =
class Matchmaker

  # Public: Construct a {Matchmaker} for the given path.
  #
  # * `path` A {String} representing the absolute path to the file whose
  #   "significant other" you're seeking.
  #
  # Returns a {Matchmaker}.
  @for: (path) ->
    new Matchmaker(path)

  # Public
  constructor: (@path) ->

  # Public: Get the complementary path (i.e., the path to the "significant
  # other").
  #
  # Returns a Promise that resolves to:
  # * the {String} representing the absolute path to the complementary file.
  # * `null` if no complementary path is found.
  complementaryPath: ->
     @findComplementaryPath(atom.project.getPaths(), @path)

  # Internal: In the given directories, search for a complementary path for the
  # given matchee.
  #
  # The following examples demonstrate the algorithm used to perform the search:
  #
  #   EXAMPLE A - Given a file at `app/models/post.rb`:
  #
  #   1. Examine the filename to determine whether it has a suffix that
  #      indicates that it is a test file. In this case, `post.rb` does not
  #      appear to be a test, so assume that it's an implementation file and
  #      that we're looking for it's corresponding test file.
  #
  #   2. Drop the leading directory, and look for a file whose path matches:
  #
  #        `**/models/post?(_test|_spec|-spec).rb`
  #
  #     If such a file exists, use that file as the match. If no such file
  #     exists, continue to the next step.
  #
  #   3. Drop the leading directory used in the preceding step. Look for a file
  #      whose path matches:
  #
  #        `**/post?(_spec|_test).rb`
  #
  #     If such a file exists, use that file as the match. If no such file
  #     exists, then stop searching (since there are no more leading directories
  #     to drop).
  #
  #   EXAMPLE B - Given a file at `test/models/post_test.rb`:
  #
  #   1. Examine the filename to determine whether it has a suffix that
  #      indicates that it is a test file. In this case, `post_test.rb` does
  #      appear to be a test, so assume we're looking for it's corresponding
  #      implementation file.
  #
  #   2. Drop the leading directory, and look for a file whose path matches:
  #
  #        `**/models/post.rb'
  #
  #     If such a file exists, use that file as the match. If no such file
  #     exists, continue to the next step.
  #
  #   3. Drop the leading directory used in the preceding step. Look for a file
  #      whose path matches:
  #
  #        `**/post.rb'
  #
  #     If such a file exists, use that file as the match. If no such file
  #     exists, then stop searching (since there are no more leading directories
  #     to drop).
  #
  # Returns a Promise.
  findComplementaryPath: (directoriesToSearch, matcheePath, leadingDirectoriesToExclude = 1) ->
    relativeMatcheePath = atom.project.relativize(matcheePath)
    partialMatcheePath = @withoutLeadingDirectory(relativeMatcheePath, leadingDirectoriesToExclude)
    directoryPattern = @directoryPattern(partialMatcheePath)

    basenamePattern = @basenamePattern(relativeMatcheePath)
    extensionPattern = pathUtils.extname(relativeMatcheePath)
    filenamePattern = "#{basenamePattern}#{extensionPattern}"

    pattern = [directoryPattern, filenamePattern].join(pathUtils.sep)

    # TODO Could this be even faster in large projects if we ignore certain dirs?
    # Example: [".bundle/**", ".git/**", "bin/**", "config/**", "db/**", "docs/**", "enterprise/**", "git-bin/**", "jobs/**", "log/**", "public/**", "repositories/**", "script/**", "tmp/**", "var/**", "vendor/**"]
    #
    # Maybe, instead of that crazy list above, we can tell the scandal to ignore every directory that isn't one of app,jobs,lib,src,spec,test. We could:
    #    1. List all top-level directories.
    #    2. Remove app, job, lib, src, spec, test from the list.
    #    3. Add the remaining items to the exclusions option. (See https://github.com/atom/scandal/blob/v2.2.0/README.md#options.)

    promise = new Promise (resolve) =>
      matches = []

      # TODO Search all directories; not just the first one
      scanner = new PathScanner(
        directoriesToSearch[0],
        excludeVcsIgnores: true,
        inclusions: [pattern],
        exclusions: [relativeMatcheePath]
      )

      scanner.on 'path-found', (path) ->
        matches.push(path)
        resolve(matches)

      scanner.on 'finished-scanning', ->
        resolve(matches)

      scanner.scan()

    promise.then (matches) =>
      if matches.length > 0
        return matches[0]
      else if @hasDirectory(partialMatcheePath)
        @findComplementaryPath(directoriesToSearch, matcheePath, leadingDirectoriesToExclude + 1)
      else
        return null

  # Internal: Does the given path include at least one directory?
  #
  # Examples
  #
  #   @hasDirectory('a/b.coffee')
  #   # => true
  #
  #   @hasDirectory('b.coffee')
  #   # => false
  #
  # Returns a Boolean.
  hasDirectory: (path) ->
    pathUtils.dirname(path) != "."

  # Internal
  directoryPattern: (path) ->
    if @hasDirectory(path)
      directoryPath = pathUtils.dirname(path)
      ["**", directoryPath].join(pathUtils.sep)
    else
      "**"

  # Internal
  withoutLeadingDirectory: (path, leadingDirectoriesToExclude = 1) ->
    directoriesInPath = pathUtils.dirname(path).split(pathUtils.sep)

    subdirectoriesInPath = _.rest(directoriesInPath, leadingDirectoriesToExclude)

    basename = pathUtils.basename(path)

    subdirectoriesInPath.concat(basename).join(pathUtils.sep)

  # Internal
  basenamePattern: (path) ->
    basename = pathUtils.basename(path, pathUtils.extname(path))

    # TODO Refactor and/or use better names or comments

    # If this file already ends with `_test` or `_spec` or `-spec`, then remove
    # that from the name. If it does NOT end with `_test` or `_spec` or `-spec`,
    # then add those items as optional suffixes for the pattern.
    if basename.match "(_test|_spec|-spec)$"
      basename.replace new RegExp("(_test|_spec|-spec)$"), ""
    else
      "#{basename}?(_test|_spec|-spec)"
