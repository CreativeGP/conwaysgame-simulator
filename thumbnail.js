function make_thumbnail_canvas(cvs, data, width, height) {
    // Resize the canvas
    cvs.width = width;
    cvs.height = height;
    cvs.style.backgroundColor = 'black';

    // Get a context for 2d drawing
    let ctx = cvs.getContext('2d');

    // Get the dimension of the data
    let dimension = get_rle_dimension(data);

    let pixels_per_cell = (() => {
	let v = height / (dimension['height']+2);
	let h = width / (dimension['width']+2);
	return Math.min(v, h);
    })();
    let cell_in_row = width / pixels_per_cell;
    let cell_in_col = height / pixels_per_cell;
    // NOTE: 普通サムネイルは横が長いと思っているので横だけ中心に合わせました
    let left_padding = cell_in_row/2 - dimension.width/2;
    let top_padding = cell_in_col/2 - dimension.height/2;

    let rawdata = get_raw_rle(data);
    let numeric = '',
	xcursor = 0,
	ycursor = 0;
    for (let i = 0, d; d = rawdata[i]; i++) {
	if ($.isNumeric(d)) {
	    numeric += d;
	    continue;
	}
	let num = numeric == '' ? 1 : Number(numeric);
	if (d == 'o') {
	    ctx.fillStyle = 'white';
	    for (let j=0; j<num; ++j)
		ctx.fillRect(pixels_per_cell*(xcursor+j+left_padding),
			     pixels_per_cell*(ycursor+top_padding),
			     pixels_per_cell, pixels_per_cell);
	    xcursor += num;
	}
	else if (d == 'b') {
	    // ctx.fillStyle = 'black';
	    // for (let j=0; j<num; ++j)
	    // 	ctx.fillRect(pixels_per_cell*(xcursor+j+left_padding),
	    // 		     pixels_per_cell*(ycursor+top_padding),
	    // 		     pixels_per_cell, pixels_per_cell);
	    xcursor += num;
	}
	else if (d == '$') {
	    for(let j=0;j<num;j++) {
		xcursor = 0;
		ycursor++;
	    }
	}
	numeric = '';
    }
}
