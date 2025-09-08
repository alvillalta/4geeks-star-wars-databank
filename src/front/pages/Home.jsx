import React from "react"

import starWarsDisplay from "../assets/star-wars-display.jpg";

export const Home = () => {
	return (
		<div className="text-center my-4">
			<img src={starWarsDisplay} className="img-fluid rounded"/>
		</div>
	);
}; 