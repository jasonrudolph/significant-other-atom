Matchmaker = require './matchmaker'

module.exports =
  activate: ->
    atom.commands.add 'atom-text-editor',
      'significant-other:toggle': ->
        editor = atom.workspace.getActiveTextEditor()
        matchmaker = Matchmaker.for(editor.getPath())
        matchmaker.complementaryPath().then (path) ->
          if path
            atom.workspace.open(path)
          else
            atom.notifications.addWarning 'No significant other found 😱'
