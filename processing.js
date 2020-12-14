let model;

async function loadModel() {
    const modelUrl = 'TFJS/model.json';
    model = await tf.loadGraphModel(modelUrl);
}

function predictImage() {

    // Reads image
    let image = cv.imread(canvas);

    // Converts image to grayscale
    cv.cvtColor(image, image, cv.COLOR_RGBA2GRAY, 0);

    // Adds thresholding
    cv.threshold(image, image, 175, 255, cv.THRESH_BINARY);

    // Finding the contours
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();

    cv.findContours(image, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

    // Bounding rectangle and crop image
    let cnt = contours.get(0)
    let rect = cv.boundingRect(cnt)
    image = image.roi(rect)

    // Resizing the image (longest edge is 20 pixels)
    let height = image.rows;
    let width = image.cols;

    if (height > width) {
        height = 20;
        const scaleFactor = image.rows / height;
        width = Math.round(image.cols / scaleFactor);
    } else {
        width = 20;
        const scaleFactor = image.cols / width;
        height = Math.round(image.rows / scaleFactor);
    }

    let newSize = new cv.Size(width, height);
    cv.resize(image, image, newSize, 0, 0, cv.INTER_AREA);

    // Add padding to make the image 28 x 28 pixels
    const LEFT = Math.ceil((4 + (20 - width) / 2));
    const RIGHT = Math.floor((4 + (20 - width) / 2));
    const TOP = Math.ceil((4 + (20 - height) / 2));
    const BOTTOM = Math.floor((4 + (20 - height) / 2));

    const BLACK = new cv.Scalar(0, 0, 0, 0);
    cv.copyMakeBorder(image, image, TOP, BOTTOM, LEFT, RIGHT, cv.BORDER_CONSTANT, BLACK);

    // Finding center of mass
    cv.findContours(image, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    cnt = contours.get(0);
    const Moments = cv.moments(cnt, false);

    const cx = Moments.m10 / Moments.m00;
    const cy = Moments.m01 / Moments.m00;

    // Shift the image using the center of mass (by how much should it be shifted?)
    const X_SHIFT = Math.round(image.cols / 2.0 - cx);
    const Y_SHIFT = Math.round(image.rows / 2.0 - cy);

    const M = cv.matFromArray(2, 3, cv.CV_64FC1, [1, 0, X_SHIFT, 0, 1, Y_SHIFT]);
    newSize = new cv.Size(image.rows, image.cols);
    cv.warpAffine(image, image, M, newSize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, BLACK);

    // Normalise the pixel values
    let pixelValues = image.data;
    pixelValues = Float32Array.from(pixelValues);

    pixelValues = pixelValues.map(value => {
        return value / 255.0;
    });

    // Creating a Tensor
    const X = tf.tensor([pixelValues]);

    // Making a Prediction
    const result = model.predict(X);
    result.print();
    const output = result.dataSync()[0];


    // Testing only
    // const outputCanvas = document.createElement('CANVAS');
    // cv.imshow(outputCanvas, image);

    // document.body.appendChild(outputCanvas);

    // Cleanup
    image.delete();
    contours.delete();
    hierarchy.delete();
    cnt.delete();
    M.delete();
    X.dispose();
    result.dispose();

    return output;

}