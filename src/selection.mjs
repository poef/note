export function domToOffset(root, container, offset)
{
	const range = document.createRange()

	range.setStart(root, 0)
	range.setEnd(container, offset)

	return range.toString().length
}

export function offsetToDom(root, target)
{
	const walker = document.createTreeWalker(
		root,
		NodeFilter.SHOW_TEXT
	)

	let pos = 0
	let node

	while ((node = walker.nextNode())) {
		const len = node.textContent.length

		if (target <= pos + len) {
			return {
				node,
				offset: target - pos
			}
		}

		pos += len
	}

	return {
		node: root,
		offset: root.childNodes.length
	}
}

export function getSelection(root)
{
	const sel = window.getSelection()

	if (!sel || sel.rangeCount === 0) {
		return null
	}

	const focus = domToOffset(
		root,
		sel.focusNode,
		sel.focusOffset
	)

	const anchor = domToOffset(
		root,
		sel.anchorNode,
		sel.anchorOffset
	)

	if (anchor === focus) {
		return { focus }
	}

	return {
		anchor,
		focus
	}
}

export function setSelection(root, selection)
{
	const focusPos = offsetToDom(root, selection.focus)

	const sel = window.getSelection()
	sel.removeAllRanges()

	if (selection.anchor == null) {
		const range = document.createRange()
		range.setStart(
			focusPos.node,
			focusPos.offset
		)
		range.collapse(true)
		sel.addRange(range)
		return
	}

	const anchorPos = offsetToDom(root, selection.anchor)

	sel.setBaseAndExtent(
		anchorPos.node,
		anchorPos.offset,
		focusPos.node,
		focusPos.offset
	)
}

export function collapseSelection(root)
{
	const selection = getSelection(root)

	if (selection) {
		setSelection(root, selection.focus)
	}
}

export function offsetToPosition(root, offset)
{
	const point = offsetToDom(root, offset)

	if (!point) {
		return null
	}

	const range = document.createRange()

	range.setStart(
		point.node,
		point.offset
	)

	range.collapse(true)

	let rect = range.getClientRects()[0]

	if (!rect) {
		rect = range.getBoundingClientRect()
	}

	if (!rect) {
		return null
	}

	const editorRect =
		root.getBoundingClientRect()

	return {
		top: rect.top - editorRect.top,
		left: rect.left - editorRect.left,
		bottom: rect.bottom - editorRect.top,
		right: rect.right - editorRect.left,
		height: rect.height
	}

}

export function positionToOffset(root, left, top)
{
	const rect =
		root.getBoundingClientRect()

	const clientX = rect.left + left
	const clientY = rect.top + top

	let node
	let offset

	if (document.caretPositionFromPoint) {
		const pos =
			document.caretPositionFromPoint(
				clientX,
				clientY
			)

		if (!pos) {
			return null
		}

		node = pos.offsetNode
		offset = pos.offset
	}
	else if (document.caretRangeFromPoint) {
		const range =
			document.caretRangeFromPoint(
				clientX,
				clientY
			)

		if (!range) {
			return null
		}

		node = range.startContainer
		offset = range.startOffset
	}
	else {
		return null
	}

	if (
		node !== root &&
		!root.contains(node)
	) {
		return null
	}

	return domToOffset(
		root,
		node,
		offset
	)
}

/**
 * Find the offset whose rendered caret position is
 * closest to left,top.
 *
 * root             editor root element
 * left,top         editor-relative coordinates
 * startOffset      first offset to consider
 * endOffset        last offset to consider
 */
export function findClosestOffset(
	root,
	left,
	top,
	startOffset = 0,
	endOffset = root.textContent.length
)
{
	if (startOffset > endOffset) {
		[startOffset, endOffset] =
			[endOffset, startOffset]
	}

	let bestOffset = startOffset
	let bestDistance = Infinity

	for (
		let offset = startOffset;
		offset <= endOffset;
		offset++
	) {
		const pos =
			offsetToPosition(root, offset)

		if (!pos) {
			continue
		}

		const dx = pos.left - left
		const dy = pos.top - top

		const distance =
			dx * dx + dy * dy

		if (distance < bestDistance) {
			bestDistance = distance
			bestOffset = offset
		}
	}

	return bestOffset
}

export function getLineOffsets(root, offset)
{
	const pos = offsetToPosition(root, offset)
	if (!pos) {
		return null
	}
	const tolerance = pos.height / 2

	const max = root.textContent.length

	let start = offset
	let end = offset

	while (start > 0) {
		const p = offsetToPosition(root, start - 1)

		if (!p || Math.abs(p.top - pos.top)>tolerance) {
			break
		}

		start--
	}

	while (end < max) {
		const p = offsetToPosition(root, end + 1)

		if (!p || Math.abs(p.top - pos.top)>tolerance) {
			break
		}

		end++
	}

	return { start, end }
}

export function getVisualLines(root)
{
	const length = root.textContent.length

	const positions = []

	for (
		let offset = 0;
		offset <= length;
		offset++
	) {
		const pos = offsetToPosition(root, offset)
		if (!pos) {
			continue
		}

		positions.push({
			offset,
			left: pos.left,
			top: pos.top,
			bottom: pos.bottom,
			height: pos.height
		})
	}

	const lines = []

	let current = null

	for (const pos of positions) {
		if (!current || Math.abs(pos.top - current.top) > pos.height / 2) {
			current = {
				start: pos.offset,
				end: pos.offset,
				top: pos.top,
				bottom: pos.bottom,
				positions: [pos]
			}

			lines.push(current)

			continue
		}

		current.end = pos.offset
		current.positions.push(pos)
	}

	return lines
}


export function findLineIndex(lines, offset)
{
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]

		if (
			offset >= line.start &&
			offset <= line.end
		) {
			return i
		}
	}

	return -1
}

export function findClosestOffsetInLine(line, x)
{
	let bestOffset = line.start
	let bestDistance = Infinity

	for (const position of line.positions) {
		const distance = Math.abs(position.left - x)
		if (distance < bestDistance) {
			bestDistance = distance
			bestOffset = position.offset
		}
	}

	return bestOffset
}
