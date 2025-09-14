const host = import.meta.env.VITE_BACKEND_URL;


export const signup = async (userToPost) => {
  const uri = `${host}/api/signup`;
  const options = {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify(userToPost),
  };
  const response = await fetch(uri, options);
  if (!response.ok) {
    const backError = await response.json();
    throw new Error(backError.message || `Error ${response.status}`);
  }
  const signupOk = await response.json();
  localStorage.setItem("token", signupOk.access_token);
  localStorage.setItem("user", JSON.stringify(signupOk.results));
  localStorage.setItem("character-favorites", JSON.stringify([]));
  localStorage.setItem("planet-favorites", JSON.stringify([]));
  localStorage.setItem("starship-favorites", JSON.stringify([]));
  return signupOk;
};


export const login = async (userToPost) => {
  const uri = `${host}/api/login`;
  const options = {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify(userToPost),
  };
  const response = await fetch(uri, options);
  if (!response.ok) {
    const backError = await response.json();
    throw new Error(backError.message || `Error ${response.status}`);
  }
  const loginOk = await response.json();
  localStorage.setItem("token", loginOk.access_token);
  localStorage.setItem("user", JSON.stringify(loginOk.results));
  return loginOk;
};

