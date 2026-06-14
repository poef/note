export class Note
{
	constructor(options)
	{
		if (!options.editable) {
			throw new Error('Note: missing options.editable')
		}
		this.editor = options.editable
		this.editor.setAttribute('contenteditable', true)
		this.editor.addEventListener('keydown', (evt) => {
			const key = getKeyString(evt)
			if (this.keyboard[key]) {
				this.keyboard[key].call(this, evt)
				evt.preventDefault()
			}
		})
		this.keyboard = {
			'control-b': function() { this.exec('bold') },
			'control-i': function() { this.exec('italic') },
			'control-u': function() { this.exec('underline') }
		}
		this.selection = {
			get: () => {
				// return selection in { anchor, focus }
				// where both are character offsets in the note
			},
			set: (focus, anchor=null) => {
				// convert focus and anchor character offsets in this note (if set) to
				// the node and nodeOffset in the DOM
				// then either set the cursor to the focus node and offset
				// or if anchor is also set, create a selection with the focus and anchor nodes and offsets
			},
			collapse: () => {
				const focus = this.selection.get()?.focus
				if (focus) {
					this.selection.set(focus)
				}
			}
		}
	}

	exec(command, value=null)
	{
		document.execCommand(command, false, value)
	}
}

const KEY = Object.freeze({
	Compose: 229,
	Control: 17,
	Meta:    224,
	Alt:     18,
	Shift:   16
})

export function getKeyString(e)
{
	if (e.isComposing || e.keyCode === KEY.Compose) {
		return
	}
	if (e.defaultPrevented) {
		return
	}
	if (!e.target) {
		return
	}
	let keyCombination = []
	if (e.ctrlKey && e.keyCode!=KEY.Control) {
		keyCombination.push('control')
	}
	if (e.metaKey && e.keyCode!=KEY.Meta) {
		keyCombination.push('meta')
	}
	if (e.altKey && e.keyCode!=KEY.Alt) {
		keyCombination.push('alt')
	}
	if (e.shiftKey && e.keyCode!=KEY.Shift) {
		keyCombination.push('shift')
	}
	keyCombination.push(e.key.toLowerCase())
	return keyCombination.join('-')
}


export default function note(options)
{
	return new Note(options)
}