//BOND! https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js
//BOND! meta.js
//BOND! header.js
//BOND! rle.js
//BOND! button.js
//BOND! grid.js
//BOND! cellstate.js

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
