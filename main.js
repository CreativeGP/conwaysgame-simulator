let width = 600;
let height = 600;
let cell_size = 20;
let cell_width = width / cell_size;
let cell_height = height / cell_size;
let zoom = 1.0;
let draw = SVG('drawing').size(width, height);

let themecolor = new SVG.Color('#000');

// Draw grid
for (let x = 0; x < cell_width+1; ++x) {
    draw.line(x * cell_size, 0, x * cell_size, height).stroke({ width: 1 })
}
for (let y = 0; y < cell_height+1; ++y) {
    draw.line(0, y * cell_size, width, y * cell_size).stroke({ width: 1 })
}
