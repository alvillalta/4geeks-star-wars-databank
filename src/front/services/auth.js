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


export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("character-favorites");
  localStorage.removeItem("planet-favorites");
  localStorage.removeItem("starship-favorites");
  localStorage.removeItem("characters");
  localStorage.removeItem("planets");
  localStorage.removeItem("starships");
  const keys = Object.keys(localStorage);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key.includes("character-details")) {
      localStorage.removeItem(key);
    }
    if (key.includes("planet-details")) {
      localStorage.removeItem(key);
    }
    if (key.includes("starship-details")) {
      localStorage.removeItem(key);
    }
  }
}


export const recoverPassword = async (userToRecover) => {
  const uri = `${host}/api/recover-password`;
  const options = {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify(userToRecover),
  };
  const response = await fetch(uri, options);
  if (!response.ok) {
    const backError = await response.json();
    throw new Error(backError.message || `Error ${response.status}`);
  }
  const recoverPasswordOk = await response.json();
  const results = {
    responseOk: response.status,
    message: recoverPasswordOk.message
  }
  return results;
};


export const resetPassword = async (passwordToReset) => {
  const uri = `${host}/api/reset-password`;
  const options = {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify(passwordToReset),
  };
  const response = await fetch(uri, options);
  if (!response.ok) {
    const backError = await response.json();
    throw new Error(backError.message || `Error ${response.status}`);
  }
  return response.status;
};


export const putUser = async (userId, userToPut) => {
  const uri = `${host}/api/users/${userId}`;
  const options = {
    method: "PUT",
    headers: {
      "Content-type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(userToPut),
  };
  const response = await fetch(uri, options);
  if (!response.ok) {
    const backError = await response.json();
    throw new Error(backError.message || `Error ${response.status}`);
  }
  const userPut = await response.json();
  localStorage.setItem("user", JSON.stringify(userPut.results));
  return userPut.results;
};


export const deleteUser = async (userId) => {
  const uri = `${host}/api/users/${userId}`;
  const options = {
    method: "DELETE",
    headers: {
      "Content-type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`,
    },
  };
  const response = await fetch(uri, options);
  if (!response.ok) {
    const backError = await response.json();
    throw new Error(backError.message || `Error ${response.status}`);
  }
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("character-favorites");
  localStorage.removeItem("planet-favorites");
  localStorage.removeItem("starship-favorites");
  localStorage.removeItem("characters");
  localStorage.removeItem("planets");
  localStorage.removeItem("starships");
  const keys = Object.keys(localStorage);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key.includes("character-details")) {
      localStorage.removeItem(key);
    }
    if (key.includes("planet-details")) {
      localStorage.removeItem(key);
    }
    if (key.includes("starship-details")) {
      localStorage.removeItem(key);
    }
  }
  return response.status;
};
