import {ToastContainer} from "react-toastify";

import '@mdxeditor/editor/style.css';
import './styles/usdswebsite.override.css';
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import {Fragment} from "react";
import {BlogEditorPage} from "./pages/BlogEditorPage.tsx";
import {BrowserRouter, Routes, Route, NavLink, Outlet} from "react-router-dom";
import {HomePage} from "./pages/HomePage.tsx";
import {ErrorElement} from "./components/ErrorElement.tsx";
import {NavList, Header, Title,} from "@trussworks/react-uswds";
import {AboutPage} from "./pages/AboutPage.tsx";

// we use the uswds styles from usds.github.io/website-staging
// import '@uswds/uswds/css/uswds.css';


const Layout = () => {
  return (
    <Fragment>
      <Header basic>
        <div className="usa-nav-container">
          <div className="usa-navbar">
            <Title>Website Content Editor</Title>
            {/* A "layout route" is a good place to put markup you want to
          share across all the pages on your site, like navigation. */}
            <NavList items={
              [<NavLink key={"homenavlink"} to="/">Home</NavLink>,
                <NavLink key={"aboutlink"} to="/about">About</NavLink>,
                <NavLink key={"blogedit"} to="/blogedit">News-and-blog editor</NavLink>]
            } type="primary"/>
          </div>
        </div>
      </Header>


      {/* An <Outlet> renders whatever child route is currently active,
          so you can think about this <Outlet> as a placeholder for
          the child routes we defined above. */}
      <section className="usa-section">
        <Outlet/>
      </section>
    </Fragment>
);
}

function App() {
  return (
    <Fragment>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout/>}>
            <Route path="/" element={<HomePage/>}/>
            <Route path="/about" element={<AboutPage/>}/>
            <Route path="/blogedit" element={<BlogEditorPage/>}/>
          </Route>
        </Routes>
      </BrowserRouter>
      <ToastContainer limit={4}/>
    </Fragment>
  );
}

export default App
