import {ToastContainer} from "react-toastify";

import '@mdxeditor/editor/style.css';
import './styles/usdswebsite.override.css';
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import {Fragment, useReducer} from "react";
import {BlogEditorPage} from "./pages/BlogEditorPage.tsx";
import {Header, PrimaryNav, Grid, GridContainer} from "@trussworks/react-uswds";
import {HomePage} from "./pages/HomePage.tsx";
import {AboutPage} from "./pages/AboutPage.tsx";

// we use the uswds styles from usds.github.io/website-staging
// import '@uswds/uswds/css/uswds.css';

// roll our own nav. Doing anything too fancy is difficult on github pages because of paths.
// keys are UX names which isn't great but whatever. It's just a few lines of code.
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
      <Header basic>
        <div className={"float-left position-absolute top-1 left-105 text-bold"}>
          Website Content Editor
        </div>
        <div className="usa-nav-container">
          <PrimaryNav
            aria-label="Primary navigation"
            items={Pages.map((eachPage) =>
              <a key={`${eachPage}`}
                 href=""
                 className={eachPage === page ? "usa-nav__link usa-current" : "usa-nav__link"}
                 onClick={(e) => {
                   setPage(eachPage);
                   e.preventDefault();
                   e.stopPropagation();
                 }}>{eachPage}</a>)}/>
        </div>
      </Header>
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
