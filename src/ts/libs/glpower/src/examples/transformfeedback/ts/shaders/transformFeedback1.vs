#version 300 es
precision highp float;

layout ( location = 0 ) in float value;

out float o_value_1;

void main( void ) {

	o_value_1 = value * 2.0;

}