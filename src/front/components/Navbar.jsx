import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import starWarsLogo from "../assets/star-wars-logo.png";

export const Navbar = () => {
	const navigate = useNavigate();
	const { store, dispatch } = useGlobalReducer();
	const characterFavorites = store.characterFavorites;
	const planetFavorites = store.planetFavorites;
	const starshipFavorites = store.starshipFavorites;
	const favoritesLength = characterFavorites.length + planetFavorites.length + starshipFavorites.length;

	const handleLogIn = () => {
		if (store.login.isLogged) {
			localStorage.clear();
			dispatch({ type: "LOGOUT" }); 
			navigate("/");
		} else {
			navigate("/login");
		}
	}

	const handleSignUp = () => {
		if (store.login.isLogged) {
			navigate("/settings")
		} else {
			navigate("/signup");
		}
	}

	const handleFavorites = () => {
		if (favoritesLength > 0) {
			navigate("/favorites");
		}
	}

	return (
		<nav className="navbar navbar-light bg-light">
			<div className="container my-2">
				<div className="col-12 col-lg-4 mb-4 mb-lg-0">
					<div className="d-flex justify-content-center justify-content-lg-start">
						<Link to="/">
							<span className="d-flex justify-content-center justify-content-lg-start">
								<img src={starWarsLogo} className="img-fluid w-25" />
							</span>
						</Link>
					</div>
				</div>
				<div className="col-12 col-lg-4 mb-5 mb-lg-0">
					<div className="d-flex flex-column flex-lg-row justify-content-center align-items-center">
						<Link to="/characters" className="mb-3 mb-lg-0 text-decoration-none">
							<span className="navbar-brand mb-0 me-0 me-lg-3 h1">Characters</span>
						</Link>
						<Link to="/planets" className="mb-3 mb-lg-0 text-decoration-none">
							<span className="navbar-brand mb-0 me-0 me-lg-3 h1">Planets</span>
						</Link>
						<Link to="/starships" className="mb-3 mb-lg-0 text-decoration-none">
							<span className="navbar-brand mb-0 me-0 me-lg-3 h1">Starships</span>
						</Link>
						<Link to="/contacts" className="mb-3 mb-lg-0 text-decoration-none">
							<span className="navbar-brand mb-0 me-0 me-lg-3 h1">Contacts</span>
						</Link>
						<button onClick={handleFavorites} type="button" 
							className={`btn btn-${favoritesLength > 0 ? "dark" : "secondary"} position-relative`}>
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
				</div>
				<div className="col-12 col-lg-4">
					<div className="d-flex flex-column flex-lg-row justify-content-center justify-content-lg-end align-items-center">
						<button onClick={handleLogIn} type="button" className="btn btn-light text-dark border-dark mx-3 mb-3 mb-lg-0">{store.login.isLogged ? "Log Out" : "Log In"}</button>
						<button onClick={handleSignUp} type="button" className="btn btn-dark">{store.login.isLogged ? "Settings" : "Sign Up"}</button>
					</div>
				</div>
			</div>
		</nav>
	);
};