# Note - A very basic html editor

Note is intended for use in notebook style pages, where each note is a block element. It is not supposed to contain other block elements, only inline elements. So things like `strong`,`em`,`span`, etc. No paragraph or `br` or `img` elements. The selection API assumes this is the case, so if you do allow that, working with selections will probably go wrong.

The selection API is intended to make it easier to work with content based only on character offsets. So both the focus and anchor values are positive integers, describing offsets on the character contents.

The offsetToPosition and positionToOffset functions allow you to keep a mostly consistent cursor position if you move a cursor down from one note to the next, and vice-versa.

# License

[MIT license](LICENSE)
