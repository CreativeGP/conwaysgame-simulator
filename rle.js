function get_rle_info(data) {
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

    return keywords;
}


function get_rle_dimension(data) {
    
}
