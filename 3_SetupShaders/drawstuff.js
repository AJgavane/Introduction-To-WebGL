/*Global Variables*/
var gl;
const INPUT_TRIANGLE_URL = 
    "https://ncsucgclass.github.io/prog1/triangles.json";
var vertex_buffer;
var triangle_buffer;
/*
 * Set up WebGL context
 */
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
		}
	} // end try
	catch (e)
	{
		console.log(e);
	}
}

/*
 * Read the triangles and Loads model into WebGL buffers
 */
function loadModels()
{
	var input_triangles = getJSONFile(INPUT_TRIANGLE_URL,"triangles");

	if (input_triangles != String.null)
	{
		var vertex_set;							// index of vertex in current triangle set
		var index_set;							// index of triange in current triangle set
		var vertex_buffer_data = [];					// 1D array of vertex coordinates for WebGL
		var triangle_buffer_data = [];					// 1D array of vertex Indices for WebGL
		var vertex_buffer_size = 0;				// number of vertices in the vertex Buffer
		var triangle_buffer_size = 0;			// number of triangle in the index buffer 
		var vertex_to_add = [];					// Vertex corrdinates to add in the vertex array
		var triangle_to_add = vec3.create();   	// Triangle indeces to add in the index buffer
		var index_offset = vec3.create();		// the number of vertices in the vertex buffer
	
		for (var triangle = 0; triangle < input_triangles.length; triangle++)
		{
			// Update the vertex offset
			// index_offset = vec3(vertex_buffer_size)
			vec3.set(index_offset, vertex_buffer_size, vertex_buffer_size, vertex_buffer_size);

			// Set up the vertex array
			for (vertex_set = 0; vertex_set < input_triangles[triangle].vertices.length; vertex_set++)
			{
				vertex_to_add = input_triangles[triangle].vertices[vertex_set];
				vertex_buffer_data.push(vertex_to_add[0], vertex_to_add[1],vertex_to_add[2]);
			} // end for vertices in set

			// Set up triangle indeces and adjust the indices while adding
			for(index_set = 0; index_set < input_triangles[triangle].triangles.length; index_set++)
			{
				// troangle_to_add = index_offset + input_triangles[tri_set].triangles[triagle_set]
				vec3.add(triangle_to_add, index_offset, input_triangles[triangle].triangles[index_set]);
				triangle_buffer_data.push(triangle_to_add[0],triangle_to_add[1], triangle_to_add[2]);
			}
			//Update vertex_buffer_size and index_buffer_size
			vertex_buffer_size += input_triangles[triangle].vertices.length;
			triangle_buffer_size += input_triangles[triangle].triangles.length;
		} // end for triangle loop
		triangle_buffer_size *= 3;

		// Send the vertex buffer data to webGL
		// Protocol: Create -> Bind -> Store
		vertex_buffer = gl.createBuffer();		// initialize empty vertex buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);	// activate the buffer
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertex_buffer_data), gl.STATIC_DRAW); // update the buffer

		// Send the Index buffer data to webGL
		// Protocol: Create -> Bind -> Store
		triangle_buffer = gl.createBuffer();	// initialize empty triangle buffer
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangle_buffer);	// activate the buffer
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(triangle_buffer_data), gl.STATIC_DRAW); // update the buffer
		
		console.log("Models Loaded Succesfully!");
	}	// end input tirangle check
}	// end load models


/*
 * Main method
 */
function main() 
{
    setupWebGL();
    loadModels();

}