const host = "https://playground.4geeks.com/contact";
const user = "alvillalta";

const postUser = async () => {
  const uri = `${host}/agendas/${user}`;
  const options = { method: "POST" };
  try {
    const response = await fetch(uri, options);
    if (!response.ok) {
      console.log(response.status, " error");
      return [];
    }
  } catch {
    console.error("Error creating a user");
    return [];
  }
};

export const getAgenda = async () => {
  const uri = `${host}/agendas/${user}`;
  const options = { method: "GET" };
  try {
    const response = await fetch(uri, options);
    if (response.status === 404) {
      return postUser();
    } else if (!response.ok) {
      console.log(response.status, " error");
    }
    const agendaData = await response.json();
    return agendaData.contacts;
  } catch {
    console.error("Error getting agenda");
  }
};

export const postContact = async (newContact) => {
  const uri = `${host}/agendas/${user}/contacts`;
  const options = {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify(newContact),
  };
  try {
    const response = await fetch(uri, options);
    if (!response.ok) {
      console.log(response.status, " error");
    }
  }
  catch {
    console.error("Error posting contact");
  }
};

export const deleteContact = async (contactId) => {
  const uri = `${host}/agendas/${user}/contacts/${contactId}`;
  const options = { method: "DELETE" };
  try {
    const response = await fetch(uri, options);
    if (!response.ok) {
      console.log(response.status, " error");
    }
    return await getAgenda();
  }
  catch {
    console.error("Error deleting contact");
  }
};

export const putContact = async (editedContact) => {
  const uri = `${host}/agendas/${user}/contacts/${editedContact.id}`;
  const options = {
    method: "PUT",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify(editedContact),
  };
  try {
    const response = await fetch(uri, options);
    if (!response.ok) {
      console.log(response.status, " error");
    }
  }
  catch {
    console.error("Error putting contact");
  }
};
