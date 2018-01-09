const DefaultCellSize = 30;
let SimulatorWidth = 1000;
let SimulatorHeight = 600;
let ThemeColor = new SVG.Color('#000');
let BorderColor = new SVG.Color(ThemeColor.brightness() >= 0.5 ? '#333' : '#999');

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

let GRID = function (svg, gridsvg, OffsetX, OffsetY) {
    this.OffsetX = OffsetX;
    this.OffsetY = OffsetY;
    this.Origin = { x: 0, y: 0 };
    this.State = new Array(5000);
    this.Cells = new Array(5000);
    this.DefaultCellSize = 30;
    this.CellSize = 30;
    this.CellWidth = SimulatorWidth / this.CellSize;
    this.CellHeight = SimulatorHeight / this.CellSize;
    this.Scale = 1.0;
    this.CellSVG = svg;
    this.CellGroup = svg.group();
    this.GridSVG = gridsvg;

    this.construct(svg, gridsvg, OffsetX, OffsetY);
};
