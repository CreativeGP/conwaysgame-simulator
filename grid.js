//BOND! https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js
//BOND! meta.js
//BOND! header.js
//BOND! rle.js

GRID.prototype.construct = function (svg, gridsvg, OffsetX, OffsetY) {
    for (let i = 0; i < this.State.length; ++i) {
 	this.State[i] = new Array(5000);
	this.Cells[i] = new Array(5000);
	for (let j = 0; j < 1000; ++j) {
	    this.State[i][j] = 0;
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
	    let grid_x = Math.floor((x-this.OffsetX)/this.CellSize) + this.Origin.x;
	    let grid_y = Math.floor((y-this.OffsetY)/this.CellSize) + this.Origin.y;
	    if (LastCell[0]===grid_x && LastCell[1]===grid_y) return;

	    // Switch 0 and 1 in the selecting rect
	    this.State[grid_y][grid_x] ^= 0b01;

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
	    this.State[grid_y][grid_x] ^= 0b01;

	    // Redraw
	    this.redraw_cell(grid_x, grid_y);

	    // Update the alive hash
	    this.update_cell_alive_hash(grid_x, grid_y);

	    LastCell = [grid_x, grid_y];
	});
	
    })();

    this.draw_grid();
};

GRID.prototype.update_cell_alive_hash = function (x, y, data=this.State) {
    if (!FUNCALL((r, n)=>is_safe_index(r, n), data, y, x)) return;
    if (data[y][x] & 0b01) {
	this.AliveHash[`${x} ${y}`] = { x: x, y: y };
	//	console.log('added ${x} ${y}');
    } else {
	delete this.AliveHash[`${x} ${y}`];
	//	console.log('deleted ${x} ${y}');
    }
//    console.log(Object.keys(this.AliveHash).length);
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
    // TODO: Create state?
    if (!FUNCALL((r, n)=>is_safe_index(r, n), this.State, CellY, CellX)) return;
    
    let color = (this.State[CellY][CellX] & 0b01) ? '#fff' : '#000';
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
    this.runningId = setInterval(() => this.update(), 100);
    // this.update();
    // setTimeout(() => this.run(), 100);
};

GRID.prototype.stop = function () {
    clearInterval(this.runningId);
};

GRID.prototype.update = function () {
    console.time('UPDATE');

    let changed = '';
    let loopcounter = 0;
    let keys = Object.keys(this.AliveHash);
    let self = this;
    let count_surrounded_live_cells = (x, y) => {
	let res = 0;
	const tmp = (y, x) => {
	    if (!is_safe_index(is_safe_index(self.State, y), x)) return 0;
	    if (changed.indexOf(`/${x} ${y}`) == -1) {
		// Pure cell
		return self.State[y][x] & 0b01;
	    } else {
		// Dirty
		return self.State[y][x] & 0b10;
	    }
	};
	res += tmp(y-1, x  )?1:0;
	res += tmp(y-1, x+1)?1:0;
	res += tmp(y  , x+1)?1:0;
	res += tmp(y+1, x+1)?1:0;
	res += tmp(y+1, x  )?1:0;
	res += tmp(y+1, x-1)?1:0;
	res += tmp(y  , x-1)?1:0;
	res += tmp(y-1, x-1)?1:0;
	return res;
    };

    for (let i=0, key, len=keys.length;
	 key = keys[i];
	 i++)
    {
	let x, y;
	{
    	    let tmp = key.split(' ');
    	    x = Number(tmp[0]);
    	    y = Number(tmp[1]);
	}

	for (let j = x-1; j <= x+1; j++) {
    	    for (let k = y-1; k <= y+1; k++) {
		let identifier = `/${j} ${k}`;
    		if (FUNCALL((r, n)=>is_safe_index(r, n), this.State, k, j)
		    && changed.indexOf(identifier) == -1) {
    		    console.time('loop');
    		    loopcounter++;
		    changed += identifier;

    		    let state = this.State[k][j] & 0b01;
		    // Save value before change
		    this.State[k][j] = (state << 1) + state;
		    
    		    let live_cells = count_surrounded_live_cells(j, k);
    		    if (state == 0 && live_cells == 3) {
    		    	this.State[k][j] |= 0b01;
    		    }
    		    if (state == 1) {
    		    	if (live_cells == 2 || live_cells == 3) continue;
    		    	if (live_cells <= 1 || live_cells >= 4) {
    		    	    this.State[k][j] &= ~0b01;
    		    	}
    		    }

		    // Update alive hash (This loop uses a copy of alive hash.
		    // So this code is safe.)
		    this.update_cell_alive_hash(j, k);

  //  		    console.timeEnd('loop');
    		}
    	    }
    	}
    }
    console.log(loopcounter);

    console.time('draw');
    this.redraw(changed);
    console.timeEnd('draw');

    console.timeEnd('UPDATE');
};

GRID.prototype.redraw = function (changed='') {
    let count = 0;
    
    let changed_list = changed.split('/');
    for (let i = 0, len = changed_list.length; i < len; ++i) {
    	let tmp = changed_list[i].split(' ');
    	let x = tmp[0];
    	let y = tmp[1];
    	if (this.Origin.x <= x && x <= this.Origin.x+this.CellWidth+1 &&
    	    this.Origin.y <= y && y <= this.Origin.y+this.CellHeight+1) {
    	    this.redraw_cell(x, y);
    	    count++;
    	}
    }
    
    console.log(count);
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
		this.State[Number(keywords['y'])+ycursor][Number(keywords['x'])+(xcursor++)] |= 0b01;
		this.redraw_cell(Number(keywords['x'])+xcursor-1, Number(keywords['y'])+ycursor);
		this.update_cell_alive_hash(Number(keywords['x'])+xcursor-1, Number(keywords['y'])+ycursor);
	    }
	}
	if (d == 'b') {
	    for(let j=0;j<num;j++)
	    {
		this.State[Number(keywords['y'])+ycursor][Number(keywords['x'])+(xcursor++)] &= ~0b01;
	    }
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
	    let state = this.State[y][x] & 0b01;
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
