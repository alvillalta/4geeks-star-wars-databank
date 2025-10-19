import { useState } from "react"
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import starWarsLogo from "../assets/star-wars-logo.png";
import { logout } from "../services/auth.js";

export const Navbar = () => {
	const navigate = useNavigate();
	const [isToggled, setIsToggled] = useState(false);
	const [isClosing, setIsClosing] = useState(false);
	const { store, dispatch } = useGlobalReducer();
	const isLogged = store.login.isLogged;
	const characterFavorites = store.characterFavorites;
	const planetFavorites = store.planetFavorites;
	const starshipFavorites = store.starshipFavorites;
	const favoritesLength = characterFavorites.length + planetFavorites.length + starshipFavorites.length;

	const showToggler = () => {
		if (!isToggled) {
			setIsToggled(true);
		}
		else {
			setIsClosing(true);
			setTimeout(() => {
				setIsClosing(false);
				setIsToggled(false);
			}, 300);
		}
	}

	const handleLogIn = () => {
		if (isLogged) {
			logout();
			dispatch({ type: "CLEAR-STORE" });
			navigate("/");
		} else {
			navigate("/login");
		}
	}

	const handleSignUp = () => {
		if (isLogged) {
			navigate("/settings")
		} else {
			navigate("/signup");
		}
	}

	const handleFavorites = () => {
		if (favoritesLength > 0) {
			navigate("/favorites");
		} else {
			dispatch({
				type: "SET-NOTIFICATION",
				payload: "There are no favorites yet"
			});
		}
	}

	return (
		<nav className="navbar navbar-light bg-light">
			<div className="container d-flex justify-content-between align-items-center my-2">
				<div className="d-flex d-lg-none px-2 pt-3 mt-4">
					<div className="position-absolute top-0 start-0 my-3 ms-4">
						<Link to="/">
							<img src={starWarsLogo} className="css-navbar-logo img-fluid" />
						</Link>
					</div>
					<button type="button" onClick={showToggler} className="navbar-toggler position-absolute top-0 end-0 my-3 me-4 shadow-none">
						<span className="navbar-toggler-icon"></span>
					</button>
					<div id="offcanvas" className={`offcanvas offcanvas-end css-z-index-2000 justify-content-start align-items-end gap-3 px-4
					${isToggled ? `${isClosing ? "closing" : "show"}` : ""}`}>
						<button type="button" onClick={showToggler} className="navbar-toggler css-z-index-2000 position-absolute top-0 end-0 my-3 me-4 border-dark border-5 border-opacity-75 rounded-3 shadow-none">
							<span className="navbar-toggler-icon"></span>
						</button>
						<div className="d-flex flex-column align-items-end gap-3 mt-5 pt-5">
							<Link to="/characters" onClick={showToggler} className="nav-link text-decoration-none">
								<span className="h5">Characters</span>
							</Link>
							<Link to="/planets" onClick={showToggler} className="nav-link text-decoration-none">
								<span className="h5">Planets</span>
							</Link>
							<Link to="/starships" onClick={showToggler} className="nav-link text-decoration-none">
								<span className="h5">Starships</span>
							</Link>
							<Link to="/contacts" onClick={showToggler} className="d-none nav-link text-decoration-none">
								<span className="h5">Contacts</span>
							</Link>
							<button type="button" onClick={() => { handleFavorites(); showToggler(); }}
							className={`${isLogged ? `btn-${favoritesLength > 0 ? "dark" : "secondary"}` : "d-none"} btn position-relative`}>
								{favoritesLength > 0 ?
									<span>
										Favorites
										<span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
											{favoritesLength}
										</span>
									</span>
									:
									<span>
										Favorites
									</span>
								}
							</button>
						</div>
						<div className="d-flex flex-column gap-3 mt-5">
							<button onClick={() => { handleLogIn(); showToggler(); }} type="button" className="btn btn-light text-dark-subtle border-dark">
								{isLogged ? "Log Out" : "Log In"}
							</button>
							<button onClick={() => { handleSignUp(); showToggler(); }} type="button" className="btn btn-dark border-dark">
								{isLogged ? "Settings" : "Sign Up"}
							</button>
						</div>
					</div>
					{isToggled || isClosing ? 
						<div onClick={showToggler} className={`${isClosing ? "css-opacity-closing" : "css-opacity-06"} css-z-index-1055 position-fixed top-0 start-0 w-100 h-100 bg-dark`}></div>
						: 
						<div className="d-none"></div>
					}
				</div>
				<div className="d-none d-lg-flex css-logo-negative-space">
					<Link to="/">
						<img src={starWarsLogo} className="css-navbar-logo img-fluid" />
					</Link>
				</div>
				<div className="d-none d-lg-flex align-items-center gap-3">
					<Link to="/characters" className="nav-link text-decoration-none">
						<span className="h5">Characters</span>
					</Link>
					<Link to="/planets" className="nav-link text-decoration-none">
						<span className="h5">Planets</span>
					</Link>
					<Link to="/starships" className="nav-link text-decoration-none">
						<span className="h5">Starships</span>
					</Link>
					<Link to="/contacts" className="d-none nav-link text-decoration-none">
						<span className="h5">Contacts</span>
					</Link>
					<button type="button" onClick={handleFavorites} className={`${isLogged ? `btn-${favoritesLength > 0 ? "dark" : "secondary"}` : "d-none"} btn position-relative`}>
						{favoritesLength > 0 ?
							<span>
								Favorites
								<span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
									{favoritesLength}
								</span>
							</span>
							:
							<span>
								Favorites
							</span>
						}
					</button>
				</div>
				<div className="d-none d-lg-flex gap-3">
					<button onClick={handleLogIn} type="button" className="btn btn-light text-dark-subtle border-dark">
						{isLogged ? "Log Out" : "Log In"}
					</button>
					<button onClick={handleSignUp} type="button" className="btn btn-dark border-dark">
						{isLogged ? "Settings" : "Sign Up"}
					</button>
				</div>
			</div>
		</nav>
	);
};