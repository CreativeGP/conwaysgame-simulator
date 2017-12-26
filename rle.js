function get_rle_info(data) {
    let lines = data.split('\n');
    let infos = { comment: '', name: '', author: '' };
    // コメントを飛ばす
    {
	let newlines = [];
	for (let i = 0, l; l = lines[i]; ++i) {
	    if (l[0] == '#'){
		// #lines
		let kind_of_comment = l[1];
		if (kind_of_comment == 'C' || kind_of_comment == 'c') {
		    // comment
		    infos['comment'] += l.substr(2).trim()+'\n';
		}
		else if (kind_of_comment == 'N') {
		    // name of the work
		    infos['name'] += l.substr(2).trim();
		}
		if (kind_of_comment == 'O') {
		    // author
		    infos['author'] += l.substr(2).trim();
		}
	    }
	    else newlines.push(l);
	}
	lines = newlines;
    }

    // Delete a return sign at the end of the comment
    infos['comment'].slice(0, -1);
    
    data = data.substr(data.indexOf('\n')+1);
    let keywords = { x:'' , y:'' , rule:'' }
    for (key in keywords) {
	let offset = lines[0].indexOf(key);
	if (offset == -1) break;
	offset = lines[0].indexOf('=', offset);
	if (offset == -1) break;
	offset++;
	let limit = lines[0].indexOf(',', offset) == -1 ? lines[0].length : lines[0].indexOf(',', offset);
	infos[key] = lines[0].substr(offset, limit-offset).trim();
    }

    return infos;
}

function get_raw_rle(data) {
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

    return lines.splice(1).join();
}

function get_rle_dimension(data) {
    let info = get_rle_info(data);
    let result = { x: info['x'], y: info['y'] };
    {
	let maxx=0, maxy=0;
	let rawdata = get_raw_rle(data);
	let keywords = get_rle_info(data);
	let numeric = '',
	    xcursor = 0,
	    ycursor = 0;
	for (let i = 0, d; d = rawdata[i]; i++) {
	    if ($.isNumeric(d)) {
		numeric += d;
		continue;
	    }
	    let num = numeric == '' ? 1 : Number(numeric);
	    if (d == 'o' || d == 'b') {
		xcursor += num;
	    }
	    if (d == '$') {
		for(let j=0;j<num;j++) {
		    xcursor = 0;
		    ycursor++;
		    maxy = Math.max(maxy, ycursor);
		}
	    }
	    maxx = Math.max(maxx, xcursor);
	    numeric = '';
	}

	result.width = maxx;
	result.height = maxy + 1;
    }

    return result;
}
