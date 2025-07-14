import { Link, useNavigate } from "react-router-dom";

import useGlobalReducer from "../hooks/useGlobalReducer";

import starWarsLogo from "../assets/star-wars-logo.png";

export const Navbar = () => {

	//  Declatations
	const navigate = useNavigate();
	const { store, dispatch } = useGlobalReducer();
	const favorites = store.favorites

	//  Handlers
	const handleDeleteFavorites = (item) => {
		dispatch({
			type: "REMOVE-FAVORITES",
			payload: { name: item.name, like: false, id: item.id }
		});
	}

	const handleLogIn = () => {
		if (store.login.isLogged) {
			localStorage.removeItem("token");
			dispatch({
                type: "LOGIN",
                payload: { token: "", isLogged: false }
            });
			navigate("/");
		} 
		navigate("/login");
	}

	const handleSignUp = () => {
		if (store.login.isLogged) {
			navigate("/user-settings")
		}
		navigate("/signup");
	}

	//  Render
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
						<Link to="/characters" className="mb-3 mb-lg-0">
							<span className="navbar-brand mb-0 me-0 me-lg-3 h1">Characters</span>
						</Link>
						<Link to="/planets" className="mb-3 mb-lg-0">
							<span className="navbar-brand mb-0 me-0 me-lg-3 h1">Planets</span>
						</Link>
						<Link to="/starships" className="mb-3 mb-lg-0">
							<span className="navbar-brand mb-0 me-0 me-lg-3 h1">Starships</span>
						</Link>
						<Link to="/contacts" className="mb-3 mb-lg-0">
							<span className="navbar-brand mb-0 me-0 me-lg-3 h1">Contacts</span>
						</Link>
						<div className="dropdown">
							<button className={`btn btn-${favorites.length > 0 ? "primary dropdown-toggle" : "secondary"} position-relative`} type="button" data-bs-toggle="dropdown" aria-expanded="false">
								{favorites.length > 0 ?
									<span>
										Favorites
										<span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
											{favorites.length}
										</span>
									</span>
									:
									<span>
										Favorites
									</span>
								}
							</button>
							{favorites.length > 0 ?
								<div className="dropdown-menu dropdown-menu-end">
									{favorites.map((item) => {
										return (
											<div key={item.id} className="d-flex justify-content-between p-2">
												<span>{item.name}</span>
												<button onClick={() => handleDeleteFavorites(item)} type="button" ><i className="fa-solid fa-xmark"></i></button>
											</div>
										)
									})}
								</div>
								:
								<div className="dropdown-menu d-none"></div>
							}
						</div>
					</div>
				</div>
				<div className="col-12 col-lg-4">
					<div className="d-flex flex-column flex-lg-row justify-content-center justify-content-lg-end align-items-center">
						<button onClick={handleLogIn} type="button" className="btn btn-light text-success border-success mx-3 mb-3 mb-lg-0">{store.login.isLogged ? "Log Out" : "Log In"}</button>
						<button onClick={handleSignUp} type="button" className="btn btn-success">{store.login.isLogged ? "Settings" : "Sign Up"}</button>
					</div>
				</div>
			</div>
		</nav>
	);
};