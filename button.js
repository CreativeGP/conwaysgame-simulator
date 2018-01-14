//BOND! https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js
//BOND! meta.js
//BOND! header.js

BUTTON.prototype.construct = function (draw, x, y, width, height, text, onclick, onhover) {
    draw.rect(width, height).fill(BorderColor).move(x, y).stroke({ width: 2 });
    let t = draw.text(text).move(x+width/2, y-height/4);
    t.font({
	family: 'Helvetica',
	size: height,
	anchor: 'middle'
    });

    $('#drawing').click((e) => {
	let pos = $('#drawing').position();
	let x = e.clientX - pos.left;
	let y = e.clientY - pos.top;
	if (this.x < x && x < this.x+this.width &&
	    this.y < y && y < this.y+this.height) {
	    console.log('clicked');
	}
    });
};
