import {ToastContainer} from "react-toastify";

import {Fragment, useReducer} from "react";
import {BlogEditorPage} from "./pages/BlogEditorPage.tsx";
import {Header as USWDSHeader, Grid, GridContainer} from "@trussworks/react-uswds";
import {HomePage} from "./pages/HomePage.tsx";
import {AboutPage} from "./pages/AboutPage.tsx";

import '@mdxeditor/editor/style.css';
// we use the uswds styles from usds.github.io/website-staging
// import '@uswds/uswds/css/uswds.css';
import './styles/usdswebsite.override.css';
import './styles/uswds.navmenu.override.css';
import "react-toastify/dist/ReactToastify.css";
import "./App.css";


// roll our own nav. Doing anything too fancy is difficult on github pages because of paths.
// keys are UX names which isn't great but whatever. It's just a few lines of code.
// We could switch to <HashRouter> if this site gets complex enough
const Pages = ["Home", "Blog Edit", "About"] as const;
type PagesType = (typeof Pages)[number];
type PagesMap = {
  [key in PagesType]?: React.ReactElement;
};


function App() {
  // this is basically useState that persists to localstorage
  const [page, setPage] = useReducer((_prev: PagesType, cur: PagesType) => {
    localStorage.setItem('currentPage', cur);
    return cur;
  }, (localStorage.getItem('currentPage') as PagesType) || "Home");
  const PAGES_MAP: PagesMap = {
    "Home": <HomePage/>,
    "Blog Edit": <BlogEditorPage/>,
    "About": <AboutPage/>,
  };

  return (
    <Fragment>

      <USWDSHeader basic>
        <div className={"float-left position-absolute top-1 left-105 text-bold"}>
          Website Content Editor
        </div>
        {/* We could use <PrimaryNav> here but the css breakpoint for the mobile is annoying */}
        <div className="usa-nav-custom-container">
          <nav className="usa-nav-custom" aria-label="Primary navigation">
            <ul className="usa-nav-custom__primary usa-accordion">
              {Pages.map((eachPage) =>
                <li key={eachPage} className="usa-nav-custom__primary-item">
                  <a href="" type="primary"
                     className={eachPage === page ? "usa-nav-custom__link usa-current" : "usa-nav-custom__link"}
                     onClick={(e) => {
                       setPage(eachPage);
                       e.preventDefault();
                       e.stopPropagation();
                     }}>{eachPage}</a>
                </li>)}
            </ul>
          </nav>
        </div>
      </USWDSHeader>


      <div className="usa-section">
        <GridContainer>
          <Grid row gap>
            <main
              className="usa-layout-docs__main desktop:grid-col-12 usa-prose usa-layout-docs"
              id="main-content"
              role={"main"}
            >
              {PAGES_MAP[page] ?? PAGES_MAP.Home}
            </main>
          </Grid>
        </GridContainer>
      </div>
      <ToastContainer limit={4}/>
    </Fragment>
  );
}

export default App
