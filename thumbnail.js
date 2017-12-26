function make_thumbnail_canvas(cvs, data, width, height) {
    // Resize the canvas
    cvs.style.width = width;
    cvs.style.height = height;

    // Get a context for 2d drawing
    let ctx = cvs.getContext('2d');

    let pixels_per_cell = 
}
