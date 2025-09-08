import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";

import { Layout } from "./pages/Layout.jsx";
import { Home } from "./pages/Home.jsx";
import { Login } from "./pages/Login.jsx";
import { SignUp } from "./pages/SignUp.jsx";
import { Settings } from "./pages/Settings.jsx";
import { ContactList } from "./pages/ContactList.jsx";
import { AddContact } from "./pages/AddContact.jsx";
import { EditContact } from "./pages/EditContact.jsx";
import { Characters } from "./pages/Characters.jsx";
import { CharacterDetails } from "./pages/CharacterDetails.jsx";
import { Planets } from "./pages/Planets.jsx";
import { PlanetDetails } from "./pages/PlanetDetails.jsx";
import { Starships } from "./pages/Starships.jsx";
import { StarshipDetails } from "./pages/StarshipDetails.jsx";

export const router = createBrowserRouter(
  createRoutesFromElements(
    // CreateRoutesFromElements function allows you to build route elements declaratively.
    // Create your routes here, if you want to keep the Navbar and Footer in all views, add your new routes inside the containing Route.
    // Root, on the contrary, create a sister Route, if you have doubts, try it!
    // Note: keep in mind that errorElement will be the default page when you don't get a route, customize that page to make your project more attractive.
    // Note: The child paths of the Layout element replace the Outlet component with the elements contained in the "element" attribute of these child paths.

    // Root Route: All navigation will start from here.
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >

      {/* Nested Routes: Defines sub-routes within the BaseHome component. */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/contacts" element={<ContactList />} />
      <Route path="/contacts/add-contact" element={<AddContact />} />
      <Route path="/contacts/edit-contact" element={<EditContact />} />
      <Route path="/characters" element={<Characters />} />
      <Route path="/characters/:characterId" element={<CharacterDetails />} />
      <Route path="/planets" element={<Planets />} />
      <Route path="/planets/:planetId" element={<PlanetDetails />} />
      <Route path="/starships" element={<Starships />} />
      <Route path="/starships/:starshipId" element={<StarshipDetails />} />
    </Route>
  )
);