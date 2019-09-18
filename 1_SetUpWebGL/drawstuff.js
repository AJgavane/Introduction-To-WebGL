var gl;
function setupWebGL()
{
	// Get the canvas and context
	var canvas = document.getElementById("viewport"); 	// create a JS canvas
	gl = canvas.getContext("webgl"); 			// get a webgl object from it.
	// Requried to get an access to WebGL context for 2D and/or 3D graphics rendering.

	try
	{
		if (gl == null)
		{
			throw "Make sure your browser supports WebGL!"
		}
		else 
		{
			gl.clearColor(0.0, 0.0, 0.0, 1.0);  // clear the frame buffer with black
			gl.clearDepth(1.0); 				// Use max when we clear the depth buffer
			// Clear the buffer with the specified color and depth.
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			gl.enable(gl.DEPTH_TEST);			// Use hidden surface removal (w/ Z-buffering)
			console.log("GL context successfully created!");
		}
	} // end try
	catch (e)
	{
		console.log(e);
	}
}


function main() {
    setupWebGL();
}
