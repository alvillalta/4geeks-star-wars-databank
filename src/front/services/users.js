const host = "https://turbo-zebra-r4wpgpp679jvh5644-3001.app.github.dev";

export const modifyUser = async (userId, userToPut) => {
  const uri = `${host}/api/users/${userId}`;
  const options = {
    method: "PUT",
    headers: { 
      "Content-type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
     },
    body: JSON.stringify(userToPut),
  };
  const response = await fetch(uri, options);
  try {
    if (!response.ok) {
      console.log(response.status, " error");
    }
    const userPut = await response.json();
    return userPut;
  } catch {
    console.error("Error putting user");
  }
}
