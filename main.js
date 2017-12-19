let width = 600;
let height = 600;
let cell_size = 20;
let cell_width = width / cell_size;
let cell_height = height / cell_size;
let zoom = 1.0;
let mouse;
let themecolor = new SVG.Color('#000');
let bordercolor = new SVG.Color(themecolor.brightness() >= 0.5 ? '#000' : '#fff');

let BUTTON = function (draw, x, y, width, height, text, onclick, onhover) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.text = text;
    this.onclick = onclick;
    this.onhover = onhover;
    draw.rect(width, height).fill(bordercolor).move(x, y).stroke({ width: 2 });
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

window.onload = () => {
    let draw = SVG('drawing').size(width, height);
    $('#drawing').css('width', width);
    $('#drawing').css('height', height);
    draw.rect(width, height).fill(themecolor);

    // Draw grid
    let gridX = 0;
    let gridY = 0;
    for (let x = -1; x < cell_width+1; ++x) {
	draw.line(0, 0, 0, height+cell_size*2)
	    .move(x * cell_size + (gridX%cell_size), gridY%cell_size - cell_size)
	    .stroke({ width: 1, color: bordercolor })
    }
    for (let y = -1; y < cell_height+1; ++y) {
	console.log(gridX%cell_size);
	draw.line(0, 0, width+cell_size*2, 0)
	    .move((gridX%cell_size) - cell_size, y * cell_size + (gridY%cell_size))
	    .stroke({ width: 1, color: bordercolor })
    }
    $('#drawing').click((e) => {
	let pos = $('#drawing').position();
	let x = e.clientX - pos.left;
	let y = e.clientY - pos.top;
	if (this.x < x && x < this.x+this.width &&
	    this.y < y && y < this.y+this.height) {
	    console.log('clicked');
	}
    });

    let bRun = new BUTTON(draw, 0, height-50, 150, 50, "RUN", ()=>{}, ()=>{});
}
