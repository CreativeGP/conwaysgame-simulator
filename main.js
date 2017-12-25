let width = 1000;
let height = 600;
let zoom = 1.0;
let mouse;
let themecolor = new SVG.Color('#000');
let bordercolor = new SVG.Color(themecolor.brightness() >= 0.5 ? '#333' : '#999');

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

let GRID = function (cvg, gridcvg, OffsetX, OffsetY) {
    // Draw grid
    this.OffsetX = OffsetX;
    this.OffsetY = OffsetY;
    this.State = new Array(5000);
    this.Cells = new Array(5000);
    this.Origin = [500, 500];
    this.CellSize = 30;
    this.CellWidth = width / this.CellSize;
    this.CellHeight = height / this.CellSize;

    for (let i = 0; i < this.State.length; ++i) {
	this.State[i] = new Array(5000);
	this.Cells[i] = new Array(5000);
	for (let j = 0; j < 1000; ++j) {
	    this.State[i][j] = 0;
	}
    }

    for (let y = 0; y < 100; y++) {
	for (let x = 0; x < 100; x++) {
	    this.Cells[y+500][x+500] = cvg.rect(this.CellSize, this.CellSize);
	    this.Cells[y+500][x+500].move(this.CellSize*x, this.CellSize*y);
	}
    }

    (() => {
	let IsMousePressed = false;
	let LastCell = [0, 0];
	$('#drawing').mousedown((e) => {
	    IsMousePressed = true;
	    let pos = $('#drawing').position();
	    let x = e.pageX - pos.left;
	    let y = e.pageY - pos.top;
	    let grid_x = Math.floor((x-this.OffsetX)/this.CellSize) + this.Origin[0];
	    let grid_y = Math.floor((y-this.OffsetY)/this.CellSize) + this.Origin[1];
	    if (LastCell[0]===grid_x && LastCell[1]===grid_y) return;

	    // Switch 0 and 1 in the selecting rect
	    this.State[grid_y][grid_x] ^= 1;

	    // Redraw
	    this.redraw_cell(cvg, grid_x, grid_y);

	    LastCell = [grid_x, grid_y];
	});
	$('#drawing').mouseup(() => { IsMousePressed = false; });
	$('#drawing').mousemove((e) => {
	    if (IsMousePressed == false) return;
	    let pos = $('#drawing').position();
	    let x = e.pageX - pos.left;
	    let y = e.pageY - pos.top;
	    let grid_x = Math.floor((x-this.OffsetX)/this.CellSize) + this.Origin[0];
	    let grid_y = Math.floor((y-this.OffsetY)/this.CellSize) + this.Origin[1];
	    if (LastCell[0]===grid_x && LastCell[1]===grid_y) return;

	    // Switch 0 and 1 in the selecting rect
	    this.State[grid_y][grid_x] ^= 1;

	    // Redraw
	    this.redraw_cell(cvg, grid_x, grid_y);

	    LastCell = [grid_x, grid_y];
	});
	
    })();

    this.draw_grid(gridcvg);
};

GRID.prototype.draw_grid = function (cvg) {
    for (let x = -1; x < this.CellWidth+1; ++x) {
	cvg.line(0, 0, 0, height+this.CellSize*2)
	    .move(x * this.CellSize + (this.OffsetX%this.CellSize),
		  this.OffsetY%this.CellSize - this.CellSize)
	    .stroke({ width: 1, color: bordercolor })
    }
    for (let y = -1; y < this.CellHeight+1; ++y) {
	console.log(this.OffsetX%this.CellSize);
	cvg.line(0, 0, width+this.CellSize*2, 0)
	    .move((this.OffsetX%this.CellSize) - this.CellSize,
		  y * this.CellSize + (this.OffsetY%this.CellSize))
	    .stroke({ width: 1, color: bordercolor })
    }
};

GRID.prototype.redraw_cell = function (cvg, CellX, CellY) {
    let color = this.State[CellY][CellX] ? '#fff' : '#000';
    this.Cells[CellY][CellX].fill(color);
    // cvg.rect(this.CellSize, this.CellSize)
    // 	.fill(color)
    // 	.move((CellX-this.Origin[0]-this.OffsetX) * this.CellSize,
    // 	      (CellY-this.Origin[1]-this.OffsetY) * this.CellSize);
    // this.Cells[CellY][CellX].css('background-color', color);
};

GRID.prototype.run = function (cvg) {
    setInterval(() => this.update(cvg), 100);
};

GRID.prototype.stop = function () {
    clearInterval(this.update);
};

GRID.prototype.count_surrounded_live_cells = function (x, y) {
    let res = 0;
    res += this.State[y-1][x  ]?1:0;
    res += this.State[y-1][x+1]?1:0;
    res += this.State[y  ][x+1]?1:0;
    res += this.State[y+1][x+1]?1:0;
    res += this.State[y+1][x  ]?1:0;
    res += this.State[y+1][x-1]?1:0;
    res += this.State[y  ][x-1]?1:0;
    res += this.State[y-1][x-1]?1:0;
    return res;
};

GRID.prototype.update = function (cvg) {
    // Copy current state of the field.
    let new_state = new Array(1000);
    for (let i = 0; i < 1000; i++) {
	new_state[i] = new Array(1000);
	for (let j = 0; j < 1000; j++) {
	    new_state[i][j] = this.State[i][j];
	}
    }

    label:
    // for (let y = this.Origin[1];
    // 	 y < this.Origin[1]+this.CellHeight+2;
    // 	 ++y)
    // {
    // 	for (let x = this.Origin[0];
    // 	     x < this.Origin[0]+this.CellWidth+2;
    // 	     ++x)
    // 	{
    for (let y = 1;
	 y < 999;
	 ++y)
    {
	for (let x = 1;
	     x < 999;
	     ++x)
	{
	    let state = this.State[y][x];
	    let live_cells = this.count_surrounded_live_cells(x, y);
	    if (state == 0 && live_cells == 3) {
		new_state[y][x] = 1;
	    }
	    if (state == 1) {
		if (live_cells == 2 || live_cells == 3) continue;
		if (live_cells <= 1 || live_cells >= 4) {
		    new_state[y][x] = 0;
 		}
	    }
	}
    }

    this.State = new_state;
    
    this.redraw(cvg);
};

GRID.prototype.redraw = function (cvg) {
    for (let y = this.Origin[1];
	 y < this.Origin[1]+this.CellHeight+2;
	 ++y)
    {
	for (let x = this.Origin[0];
	     x < this.Origin[0]+this.CellWidth+2;
	     ++x)
	{
	    this.redraw_cell(cvg, x, y);
	}
    }
};

GRID.prototype.import_rle = function (cvg, data) {
    let lines = data.split('\n');
    // コメントを飛ばす
    {
	let newlines = [];
	for (let i = 0, l; l = lines[i]; ++i) {
	    if (l[0] == '#') ;
	    else newlines.push(l);
	}
	lines = newlines;
    }

    data = data.substr(data.indexOf('\n')+1);
    let keywords = { x:'' , y:'' , rule:'' }
    for (key in keywords) {
	let offset = lines[0].indexOf(key);
	if (offset == -1) break;
	offset = lines[0].indexOf('=', offset);
	if (offset == -1) break;
	offset++;
	let limit = lines[0].indexOf(',', offset) == -1 ? lines[0].length : lines[0].indexOf(',', offset);
	keywords[key] = lines[0].substr(offset, limit-offset).trim();
    }

    let numeric = '',
	xcursor = 0,
	ycursor = 0;
    for (let i = 0, d; d = data[i]; i++) {
	if ($.isNumeric(d)) {
	    numeric += d;
	    continue;
	}
	let num = numeric == '' ? 1 : Number(numeric);
	if (d == 'o') {
	    for(let j=0;j<num;j++) this.State[Number(keywords['y'])+ycursor][Number(keywords['x'])+(xcursor++)] = 1;
	}
	if (d == 'b') {
	    for(let j=0;j<num;j++) this.State[Number(keywords['y'])+ycursor][Number(keywords['x'])+(xcursor++)] = 0;
	}
	if (d == '$') {
	    for(let j=0;j<num;j++) {
		xcursor = 0;
		ycursor++;
	    }
	}
	numeric = '';
    }
    this.redraw(cvg);
};

GRID.prototype.export_rle = function () {
    let data = '';
    data += 'x=0, y=0\n';

    let old = 0, num = 1;
    for (let y = 0; y < 1000; ++y) {
	for (let x = 0; x < 1000; ++x) {
	    let state = this.State[y][x];
	    if (state == old) {
		num++;
		old = state;
		continue;
	    } else {
		data += ((num==1)?'':String(num-1)) + ((old==0)?'b':'o');
		num = 1;
	    }
	    old = state;
	}
	data += ((num==1)?'':String(num)) + ((old==0)?'b':'o');
	num = 1;
	data += '$';
    }
    return data;
};

window.onload = () => {
    let draw = SVG('drawing').size(width, height);
    // let draw = new Gaf($('#drawing'), width, height);
    let gridcvg = SVG('gridlayer').size(width, height);
    $('#drawing').css('width', width);
    $('#drawing').css('height', height);
    draw.rect(width, height).fill(themecolor);
    // draw.root.css('background-color', themecolor.toHex());

    let grid = new GRID(draw, gridcvg, 0, 0);
    document.addEventListener('keydown', (e) => {
	if (e.key === " ") grid.run(draw);
	if (e.key === "u") grid.update(draw);
	if (e.key === "s") grid.stop();
    });

    $('#import').click(() => {
	grid.import_rle(draw, $('#rle').val());
    });
    $('#export').click(() => {
	$('#rle').val(grid.export_rle());
    });

//     let bRun = new BUTTON(draw, 0, height-50, 150, 50, "RUN", ()=>{}, ()=>{});
}
