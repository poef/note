export default class Note
{
	constructor(options)
	{
		if (!options.editable) {
			throw new Error('Note: missing options.editable')
		}
		this.editor = options.editable
		this.editor.setAttribute('contenteditable', true)
		this.editor.addEventListener('keydown', (evt) => {
			this.inputFired = false
			const key = getKeyString(evt)
			console.log(key, this.keyboard[key])
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
