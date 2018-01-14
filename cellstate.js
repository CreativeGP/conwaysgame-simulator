//BOND! https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js
//BOND! meta.js
//BOND! header.js
//BOND! grid.js

// Reflect the tmp value and update GRID alive hash
CELLSTATE.prototype.reflect = function (grid, x, y) {
    grid.update_cell_alive_hash(x, y);
};
