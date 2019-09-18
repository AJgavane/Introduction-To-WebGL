/*Global Variables*/
var gl;
const INPUT_TRIANGLE_URL = 
    "https://ncsucgclass.github.io/prog1/triangles.json";
var vertex_buffer;
var triangle_buffer;
var triangle_buffer_size = 0;			// number of triangle in the index buffer 

var vertex_position_attribute;
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
	}	// end input tirangle check
}	// end load models

function setupShaders()
{
	// 1. Writing Shader code:
	// Define vertex shader in essl using es6 template string
	var vertex_shader_code = `
		attribute vec3 vertex_position;

		void main(void)
		{
			gl_Position = vec4(vertex_position, 1.0);	// use the untransformed position
		}
	`;

	// Define fragment shader in essl using es6 template string
	var fragment_shader_code = `
		void main(void)
		{
			gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // all fragments are white
		}
	`;

	// 2.: Setting up Shader Code:
	try
	{
		// Protocol for shader: Create -> Attach -> Compile -> Link to a program -> Validate the program.
		// Vertex Shader
		var vertex_shader = gl.createShader(gl.VERTEX_SHADER);		// Create a Vertex Shader
		gl.shaderSource(vertex_shader, vertex_shader_code);			// Attach the code
		gl.compileShader(vertex_shader);							// Compile the code for GPU execution
		if(!gl.getShaderParameter(vertex_shader, gl.COMPILE_STATUS))
		{
			throw "Error occurred when compiling Vertex Shader!" + gl.getShaderInfoLog(vertex_shader);
			gl.deleteShader(vertex_shader);
		}

		// Fragment shader
		var fragment_shader = gl.createShader(gl.FRAGMENT_SHADER);	// Create a Fragment Shader
		gl.shaderSource(fragment_shader, fragment_shader_code);		// Attach the code
		gl.compileShader(fragment_shader);							// Compile the code for GPU execution
		if(!gl.getShaderParameter(fragment_shader, gl.COMPILE_STATUS))
		{
			throw "Error occurred when compiling Fragment Shader!" + gl.getShaderInfoLog(fragment_shader);
			gl.deleteShader(fragment_shader);
		}

		// Shader Program: Attach All the shaders -> Link it to gl context -> Validate (optional)
		var shader_program = gl.createProgram();				// Create a shader program
		gl.attachShader(shader_program, vertex_shader);			// put vertex shader in program
		gl.attachShader(shader_program, fragment_shader);		// put fragment shader in program
		gl.linkProgram(shader_program);							// Link the program to the WebGL context
		if(!gl.getProgramParameter(shader_program, gl.LINK_STATUS))
		{
			throw "Error occurred when Linking the Program!"
		}
		else 
		{
			gl.useProgram(shader_program); // activate the program
			// Get pointer to vertex shader input
			vertex_position_attribute = gl.getAttribLocation(shader_program, "vertex_position");	
			// input to shader from array
			gl.enableVertexAttribArray(vertex_position_attribute); 	
		}
	}
	catch (e)
	{
		console.log(e);
	}
}

/*
 * Render the model on the canvas
 */
function render()
{
	// Always clear the frame & depth buffers
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Vertex buffer: Activate and feed into vertex Shader
	gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);	// Activate
	gl.vertexAttribPointer(vertex_position_attribute, 	// index of the vertex attribute
							3, 							// size: number of components in the vertex attribute
							gl.FLOAT,					// data type of each component of vertex attribute
							false,						// is normalized?
							0,0							// stride, offset
						);	// Feed

	// Triangle buffer: Activate and Render
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangle_buffer);
	gl.drawElements(
		gl.TRIANGLES,			// Mode
		triangle_buffer_size,	// number of elements to be rendered
		gl.UNSIGNED_SHORT,		// type of values in the element array buffer
		0						// offset
		); 	// render
	console.log("Triangles Rendered Successfully!");
}	

/*
 * Main method
 */
function main() 
{
    setupWebGL();
    loadModels();
    setupShaders();
    render();
}