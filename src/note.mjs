import {
	getSelection,
	setSelection,
	collapseSelection,
	offsetToPosition,
	positionToOffset,
	getVisualLines
} from './selection.mjs'

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
				const result = this.keyboard[key].call(this, evt)
				if (typeof result=='undefined' || result) {
					evt.preventDefault()
				}
			}
		})
		this.keyboard = {
			'Control-b': function() { this.exec('bold') },
			'Control-i': function() { this.exec('italic') },
			'Control-u': function() { this.exec('underline') }
		}
		this.selection = {
			get: () => getSelection(this.editor),
			set: (selection) => setSelection(this.editor, selection),
			collapse: () => collapseSelection(this.editor),
			offsetToPosition: (offset) => offsetToPosition(this.editor, offset),
			positionToOffset: (left, top) => positionToOffset(this.editor, left, top),
			getVisualLines: () => getVisualLines(this.editor)
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
		keyCombination.push('Control')
	}
	if (e.metaKey && e.keyCode!=KEY.Meta) {
		keyCombination.push('Meta')
	}
	if (e.altKey && e.keyCode!=KEY.Alt) {
		keyCombination.push('Alt')
	}
	if (e.shiftKey && e.keyCode!=KEY.Shift) {
		keyCombination.push('Shift')
	}
	keyCombination.push(e.key)
	return keyCombination.join('-')
}


export default function note(options)
{
	return new Note(options)
}