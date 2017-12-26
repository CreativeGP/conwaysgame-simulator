let BUTTON = function (draw, x, y, width, height, text, onclick, onhover) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.text = text;
    this.onclick = onclick;
    this.onhover = onhover;

    this.construct(draw, x, y, width, height, text, onclick, onhover);
};

let GRID = function (cvg, gridcvg, OffsetX, OffsetY) {
    this.OffsetX = OffsetX;
    this.OffsetY = OffsetY;
    this.Origin = [500, 500];
    this.State = new Array(5000);
    this.Cells = new Array(5000);
    this.CellSize = 30;
    this.CellWidth = width / this.CellSize;
    this.CellHeight = height / this.CellSize;

    this.construct(cvg, gridcvg, OffsetX, OffsetY);
};
