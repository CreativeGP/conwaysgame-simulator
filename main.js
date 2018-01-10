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

GRID.prototype.construct = function (svg, gridsvg, OffsetX, OffsetY) {
    for (let i = 0; i < this.State.length; ++i) {
	this.State[i] = new Array(5000);
	this.Cells[i] = new Array(5000);
	for (let j = 0; j < 1000; ++j) {
	    this.State[i][j] = 0;
	}
    }

    // とりあえずoriginから500x500までSVGを生成、後は必要に応じて追加
    // for (let y = 0; y < 100; y++) {
    // 	for (let x = 0; x < 100; x++) {
    // 	    this.create_cell_svg(y+this.Origin.y, x+this.Origin.x);
    // 	}
    // }

    (() => {
	let IsMousePressed = false;
	let LastCell = [0, 0];
	$('#drawing').mousedown((e) => {
	    IsMousePressed = true;
	    let pos = $('#drawing').position();
	    let x = e.pageX - pos.left;
	    let y = e.pageY - pos.top;
	    let grid_x = Math.floor((x-this.OffsetX)/this.CellSize) + this.Origin.x;
	    let grid_y = Math.floor((y-this.OffsetY)/this.CellSize) + this.Origin.y;
	    if (LastCell[0]===grid_x && LastCell[1]===grid_y) return;

	    // Switch 0 and 1 in the selecting rect
	    this.State[grid_y][grid_x] ^= 1;

	    // Redraw
	    this.redraw_cell(grid_x, grid_y);

	    // Update the alive hash
	    this.update_cell_alive_hash(grid_x, grid_y);

	    LastCell = [grid_x, grid_y];
	});
	$('#drawing').mouseup(() => { IsMousePressed = false; });
	$('#drawing').mousemove((e) => {
	    if (IsMousePressed == false) return;
	    let pos = $('#drawing').position();
	    let x = e.pageX - pos.left;
	    let y = e.pageY - pos.top;
	    let grid_x = Math.floor((x-this.OffsetX)/this.CellSize) + this.Origin.x;
	    let grid_y = Math.floor((y-this.OffsetY)/this.CellSize) + this.Origin.y;
	    if (LastCell[0]===grid_x && LastCell[1]===grid_y) return;

	    // Switch 0 and 1 in the selecting rect
	    this.State[grid_y][grid_x] ^= 1;

	    // Redraw
	    this.redraw_cell(grid_x, grid_y);

	    // Update the alive hash
	    this.update_cell_alive_hash(grid_x, grid_y);

	    LastCell = [grid_x, grid_y];
	});
	
    })();

    this.draw_grid();
};

GRID.prototype.update_cell_alive_hash = function (x, y) {
    if (this.State[y][x]) {
	this.AliveHash[`${x} ${y}`] = this.Cell[y][x];
//	console.log('added ${x} ${y}');
    } else {
	delete this.AliveHash[`${x} ${y}`];
//	console.log('deleted ${x} ${y}');
    }
    console.log(Object.keys(this.AliveHash).length);
}

GRID.prototype.draw_grid = function () {
    $(this.GridSVG.node).empty();
    
    for (let x = -1; x < this.CellWidth+1; ++x) {
	this.GridSVG.line(0, 0, 0, SimulatorHeight+this.CellSize*2)
	    .move(x * this.CellSize + (this.OffsetX%this.CellSize),
		  this.OffsetY%this.CellSize - this.CellSize)
	    .stroke({ width: 1, color: BorderColor })
    }
    for (let y = -1; y < this.CellHeight+1; ++y) {
	this.GridSVG.line(0, 0, SimulatorWidth+this.CellSize*2, 0)
	    .move((this.OffsetX%this.CellSize) - this.CellSize,
		  y * this.CellSize + (this.OffsetY%this.CellSize))
	    .stroke({ width: 1, color: BorderColor })
    }
};

GRID.prototype.redraw_cell = function (CellX, CellY) {
    let color = this.State[CellY][CellX] ? '#fff' : '#000';
    if (!this.Cells[CellY][CellX]) {
	if (color == '#fff') {
	    // Make new SVG::Rect object if the object is undefined
	    // and required to fill it white
	    this.create_cell_svg(CellX, CellY);
	} else return;
    }
    this.Cells[CellY][CellX].fill(color);
};

GRID.prototype.create_cell_svg = function (x, y) {
    this.Cells[y][x] = this.CellSVG.rect(this.DefaultCellSize, this.DefaultCellSize);
    this.Cells[y][x].move(this.DefaultCellSize*(x-this.Origin.x),
			  this.DefaultCellSize*(y-this.Origin.y));
    this.CellGroup.add(this.Cells[y][x]);
};

GRID.prototype.run = function () {
    setInterval(() => this.update(), 100);
    // this.update();
    // setTimeout(() => this.run(), 100);
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

GRID.prototype.update = function () {
    // Copy current state of the field.
    let new_state = new Array(1000);
    for (let i = 0; i < 1000; i++) {
	new_state[i] = new Array(1000);
	for (let j = 0; j < 1000; j++) {
	    new_state[i][j] = this.State[i][j];
	}
    }

    label:
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
    
    this.redraw();
};

GRID.prototype.redraw = function () {
    // Just call redraw_cell() with all cells
    for (let y = this.Origin.y;
	 y < this.Origin.y+this.CellHeight+2;
	 ++y)
    {
	for (let x = this.Origin.x;
	     x < this.Origin.x+this.CellWidth+2;
	     ++x)
	{
	    this.redraw_cell(x, y);
	}
    }
};

GRID.prototype.import_rle = function (data) {
    let keywords = get_rle_info(data);
    let numeric = '',
	xcursor = 0,
	ycursor = 0;
    for (let i = 0, d, rawdata = get_raw_rle(data); d = rawdata[i]; i++) {
	if ($.isNumeric(d)) {
	    numeric += d;
	    continue;
	}
	let num = numeric == '' ? 1 : Number(numeric);
	if (d == 'o') {
	    for(let j=0;j<num;j++)
	    {
		this.State[Number(keywords['y'])+ycursor][Number(keywords['x'])+(xcursor++)] = 1;
		this.redraw_cell(Number(keywords['x'])+xcursor-1, Number(keywords['y'])+ycursor);
	    }
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
    this.redraw();
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

GRID.prototype.set_scale = function (scale) {
    // Change members
    this.Scale = scale;
    this.CellSize = DefaultCellSize * scale;
    this.CellWidth = SimulatorWidth / this.CellSize;
    this.CellHeight = SimulatorHeight / this.CellSize;

    if (this.Scale > 0.25)
    {
	// Redraw grid
	$('#gridlayer').css('display', 'block');
	this.draw_grid(this.GridSVG);
    }
    else
    {
	// If scale is too small, hide grid
	$('#gridlayer').css('display', 'none');
    }

    // Redraw cells
    // this.redraw();
    this.CellGroup.scale(this.Scale, this.Scale).translate(0, 0);
    // $(this.CellGroup.node).attr('transfrom', `scale(${this.Scale})`);
    // let recipirocal_number_of_scale = 1.0 / this.Scale;
    // $(this.CellSVG.node).css('width', SimulatorWidth*recipirocal_number_of_scale);
    // $(this.CellSVG.node).css('height', SimulatorHeight*recipirocal_number_of_scale);
    
};

GRID.prototype.move_view = function (offsetX, offsetY) {
    this.OffsetX += offsetX % this.CellSize;
    this.OffsetY += offsetY % this.CellSize;
    this.Origin = [this.Origin.y+offsetY/this.CellSize, this.Origin.x+offsetX/this.CellSize];
};

window.onload = () => {
    let draw = SVG('drawing').size(SimulatorWidth, SimulatorHeight);
    // let draw = new Gaf($('#drawing'), width, height);
    let gridsvg = SVG('gridlayer').size(SimulatorWidth, SimulatorHeight);
    $('#drawing').css('width', SimulatorWidth);
    $('#drawing').css('height', SimulatorHeight);
    draw.rect(SimulatorWidth, SimulatorHeight).fill(ThemeColor);
    // draw.root.css('background-color', ThemeColor.toHex());

    let grid = new GRID(draw, gridsvg, 0, 0);
    document.addEventListener('keydown', (e) => {
	if (e.key === " ") grid.run(draw);
	if (e.key === "u") grid.update(draw);
	if (e.key === "s") grid.stop();
	if (e.key === "q") grid.set_scale(grid.Scale/2);
	if (e.key === "w") grid.set_scale(grid.Scale*2);
    });

    // Import RLE data by parameters
    let rle = getParameterByName('d', location.href);
    grid.import_rle(rle);
    
    // Disable
    // $('#import').click(() => {
    // 	grid.import_rle(draw, $('#rle').val());
    // });
    // $('#export').click(() => {
    // 	$('#rle').val(grid.export_rle());
    // });

//     let bRun = new BUTTON(draw, 0, height-50, 150, 50, "RUN", ()=>{}, ()=>{});
}
